import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import type { ReactElement } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
  type MockInstance,
} from "vitest";

import { Combobox, type ComboboxOption } from "@root/design-system";

const ID = "np-city";
const LISTBOX_ID = `${ID}-listbox`;
const ERROR_ID = `${ID}-error`;
const LABEL = "Місто";
const LISTBOX_LABEL = "Міста Нової пошти";
const PLACEHOLDER = "Почніть вводити назву";
const FIELD_CLASS = "np-city-field";
const EMPTY_LABEL = "Нічого не знайдено";
const ERROR_TEXT = "Оберіть місто";
const META_LABEL = "Львівська обл.";
const ASTERISK = "*";
const DEBOUNCE_MS = 250;
const BLUR_GRACE_MS = 140;
const MID_GRACE_MS = 100;
const LOADING_BAR_COUNT = 3;
const LOADING_BAR_WIDTHS = ["w-[60%]", "w-[45%]", "w-[70%]"];
const WIDTH_UTILITY = /^w-\[/;
const PULSE_CLASS = "animate-[utg-pulse_1.4s_var(--ease)_infinite]";
const BAR_CLASSES = ["bg-muted", "h-3.5", PULSE_CLASS];
const ACTIVE_ROW_CLASSES = ["bg-ink", "text-paper"];
const INACTIVE_ROW_CLASS = "text-ink";
const ACTIVE_META_CLASS = "text-band-muted";
const INACTIVE_META_CLASS = "text-ink-faint";
const PANEL_CLASSES = ["max-h-[220px]", "overflow-y-auto"];
const PANEL_BORDER_FUSE = "-mt-0.5";
const INVALID_BORDER_CLASS = "border-destructive";
const VALID_BORDER_CLASS = "border-input";
const CHEVRON_SIZE = "18";
const NEAREST_BLOCK: ScrollIntoViewOptions = { block: "nearest" };
const HIDDEN_SELECTOR = '[aria-hidden="true"]';
const MODIFIERS = [
  { ctrlKey: true },
  { altKey: true },
  { metaKey: true },
  { shiftKey: true },
];

const OPTIONS: readonly ComboboxOption[] = [
  { id: "lviv", label: "Львів", meta: META_LABEL },
  { id: "kyiv", label: "Київ", meta: "Київська обл." },
  { id: "odesa", label: "Одеса" },
];

interface Props {
  value?: string;
  options?: readonly ComboboxOption[];
  loading?: boolean;
  listboxLabel?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

interface Scene {
  input: HTMLInputElement;
  onValueChange: Mock<(next: string) => void>;
  onSearch: Mock<(query: string) => void>;
  onSelect: Mock<(option: ComboboxOption) => void>;
  onSubmit: Mock<() => void>;
  update: (next: Props) => void;
  unmount: () => void;
}

const renderCombobox = (props: Props = {}): Scene => {
  const onValueChange = vi.fn<(next: string) => void>();
  const onSearch = vi.fn<(query: string) => void>();
  const onSelect = vi.fn<(option: ComboboxOption) => void>();
  const onSubmit = vi.fn<() => void>();

  const markup = (current: Props): ReactElement => (
    <form onSubmit={onSubmit}>
      <Combobox
        id={ID}
        label={LABEL}
        value={current.value ?? ""}
        onValueChange={onValueChange}
        onSearch={onSearch}
        onSelect={onSelect}
        options={current.options ?? []}
        emptyLabel={EMPTY_LABEL}
        loading={current.loading ?? false}
        listboxLabel={current.listboxLabel}
        placeholder={current.placeholder}
        required={current.required}
        disabled={current.disabled}
        error={current.error}
        className={current.className}
      />
    </form>
  );

  const view = render(markup(props));
  const input = screen.getByRole("combobox");

  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Combobox rendered something other than a text input");
  }

  return {
    input,
    onValueChange,
    onSearch,
    onSelect,
    onSubmit,
    update: (next: Props) => view.rerender(markup(next)),
    unmount: view.unmount,
  };
};

const tick = (ms: number): void => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const typeInto = (input: HTMLInputElement, next: string): void => {
  fireEvent.change(input, { target: { value: next } });
};

const hover = (row: HTMLElement): void => {
  fireEvent.mouseOver(row);
};

const optionId = (index: number): string => `${ID}-option-${index}`;

const panel = (): HTMLElement => screen.getByRole("listbox");

const rows = (): HTMLElement[] => screen.getAllByRole("option");

const loadingBars = (): Element[] =>
  Array.from(panel().querySelectorAll(HIDDEN_SELECTOR));

const missing = (element: Element, utilities: readonly string[]): string[] =>
  utilities.filter((utility) => !element.classList.contains(utility));

const widthsOf = (element: Element): string[] =>
  Array.from(element.classList).filter((utility) =>
    WIDTH_UTILITY.test(utility)
  );

const metaOf = (row: HTMLElement): Element => {
  const meta = row.children.item(1);

  if (meta === null) {
    throw new Error("The option row carries no meta span");
  }

  return meta;
};

const chevron = (): Element => {
  const glyph = document.querySelector("svg");

  if (glyph === null) {
    throw new Error("The combobox rendered no chevron");
  }

  return glyph;
};

const fieldRoot = (): Element => {
  const root = document.querySelector(`.${FIELD_CLASS}`);

  if (root === null) {
    throw new Error("The field root carries no consumer class");
  }

  return root;
};

const openWithResults = (props: Props = {}): Scene => {
  const scene = renderCombobox({ options: OPTIONS, ...props });

  fireEvent.focus(scene.input);
  tick(DEBOUNCE_MS);

  return scene;
};

const settleWithResults = (query: string): Scene => {
  const scene = renderCombobox({ value: query, options: [] });

  fireEvent.focus(scene.input);
  tick(DEBOUNCE_MS);
  scene.update({ value: query, options: OPTIONS });

  return scene;
};

Element.prototype.scrollIntoView = function scrollIntoView(): void {};

let scrollIntoViewSpy: MockInstance<
  (arg?: boolean | ScrollIntoViewOptions) => void
>;

beforeEach(() => {
  vi.useFakeTimers();
  scrollIntoViewSpy = vi
    .spyOn(Element.prototype, "scrollIntoView")
    .mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

describe("the search the combobox debounces on its own", () => {
  it("echoes the keystroke to the consumer synchronously and asks for nothing yet", () => {
    const { input, onValueChange, onSearch } = renderCombobox();

    typeInto(input, "Льв");

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("Льв");
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("still holds the search back one millisecond short of the window", () => {
    const { input, onSearch } = renderCombobox();

    typeInto(input, "Льв");
    tick(DEBOUNCE_MS - 1);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("asks for the typed query exactly once when the window closes", () => {
    const { input, onSearch } = renderCombobox();

    typeInto(input, "Льв");
    tick(DEBOUNCE_MS);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("Льв");
  });

  it("restarts the window on the next keystroke so one search carries the later query", () => {
    const { input, onSearch } = renderCombobox();

    typeInto(input, "Ль");
    tick(DEBOUNCE_MS - 1);
    typeInto(input, "Льв");
    tick(DEBOUNCE_MS - 1);

    expect(onSearch).not.toHaveBeenCalled();

    tick(1);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("Льв");
  });

  it("opens and searches on focus so a field returned to re-offers its list", () => {
    const { input, onSearch } = renderCombobox({ value: "Львів" });

    fireEvent.focus(input);

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(onSearch).not.toHaveBeenCalled();

    tick(DEBOUNCE_MS);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("Львів");
  });
});

describe("the pending window that keeps the panel from flashing empty", () => {
  it("opens the panel on the keystroke and fills it with loading bars", () => {
    const { input } = renderCombobox();

    typeInto(input, "Льв");

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);
  });

  it("renders neither a row nor the empty label while the window runs, though options are empty and loading is false", () => {
    const { input } = renderCombobox();

    typeInto(input, "Льв");

    expect(screen.queryAllByRole("option").length).toBe(0);
    expect(screen.queryByText(EMPTY_LABEL)).toBeNull();

    tick(DEBOUNCE_MS - 1);

    expect(screen.queryAllByRole("option").length).toBe(0);
    expect(screen.queryByText(EMPTY_LABEL)).toBeNull();
    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);
  });

  it("hands the panel over to the empty label the moment the window closes on an empty query", () => {
    const { input } = renderCombobox();

    typeInto(input, "Льв");
    tick(DEBOUNCE_MS);

    expect(screen.getByText(EMPTY_LABEL).textContent).toBe(EMPTY_LABEL);
    expect(loadingBars().length).toBe(0);
  });
});

describe("the rows of the query the user has already moved on from", () => {
  it("pulls the previous results the instant a new keystroke opens a window", () => {
    const scene = settleWithResults("Льв");

    expect(rows().length).toBe(OPTIONS.length);

    typeInto(scene.input, "Киї");

    expect(screen.queryAllByRole("option").length).toBe(0);
    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);

    tick(DEBOUNCE_MS - 1);

    expect(screen.queryAllByRole("option").length).toBe(0);
    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);
  });

  it("keeps them back for the whole round trip once the consumer raises loading", () => {
    const scene = settleWithResults("Льв");

    typeInto(scene.input, "Киї");
    tick(DEBOUNCE_MS);

    expect(scene.onSearch).toHaveBeenLastCalledWith("Киї");

    scene.update({ value: "Киї", options: OPTIONS, loading: true });

    expect(screen.queryAllByRole("option").length).toBe(0);
    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);
  });

  it("keeps them back past the search too, when the consumer answers without ever raising loading", () => {
    const scene = settleWithResults("Льв");

    expect(rows().length).toBe(OPTIONS.length);

    typeInto(scene.input, "Киї");
    tick(DEBOUNCE_MS);

    expect(scene.onSearch).toHaveBeenLastCalledWith("Киї");
    expect(screen.queryAllByRole("option").length).toBe(0);
    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);

    scene.update({ value: "Киї", options: OPTIONS });

    expect(screen.queryAllByRole("option").length).toBe(0);
    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);

    fireEvent.keyDown(scene.input, { key: "Enter" });

    expect(scene.onSelect).not.toHaveBeenCalled();
  });

  it("hands the panel over the moment the answer to the new query lands", () => {
    const scene = settleWithResults("Льв");

    typeInto(scene.input, "Киї");
    tick(DEBOUNCE_MS);
    scene.update({ value: "Киї", options: [OPTIONS[1]] });

    expect(loadingBars().length).toBe(0);
    expect(rows().length).toBe(1);
    expect(rows()[0].textContent).toBe(`${OPTIONS[1].label}${OPTIONS[1].meta}`);
  });
});

describe("the loading prop the consumer owns", () => {
  it("keeps the bars up past the window and holds every row back", () => {
    const { input } = renderCombobox({ options: OPTIONS, loading: true });

    fireEvent.focus(input);
    tick(DEBOUNCE_MS);

    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);
    expect(screen.queryAllByRole("option").length).toBe(0);
  });

  it("keeps the empty label back too, so a refetch in flight never reads as no results", () => {
    const { input } = renderCombobox({ loading: true });

    fireEvent.focus(input);
    tick(DEBOUNCE_MS);

    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);
    expect(screen.queryByText(EMPTY_LABEL)).toBeNull();
  });
});

describe("the loading bars themselves", () => {
  it("are design-system skeletons, muted fill and utg pulse included", () => {
    const { input } = renderCombobox();

    typeInto(input, "Льв");

    const bars = loadingBars();

    expect(bars.length).toBe(LOADING_BAR_COUNT);
    expect(bars.map((bar) => missing(bar, BAR_CLASSES))).toEqual([[], [], []]);
  });

  it("carry the three ratified widths in order, so the block reads as a list and not a slab", () => {
    const { input } = renderCombobox();

    typeInto(input, "Льв");

    expect(loadingBars().map(widthsOf)).toEqual(
      LOADING_BAR_WIDTHS.map((width) => [width])
    );
  });
});

describe("the empty result row", () => {
  it("publishes the consumer label as one disabled option, so the listbox holds nothing but options", () => {
    const { input } = renderCombobox();

    fireEvent.focus(input);
    tick(DEBOUNCE_MS);

    const list = rows();

    expect(list.length).toBe(1);
    expect(list[0].textContent).toBe(EMPTY_LABEL);
    expect(list[0].getAttribute("aria-disabled")).toBe("true");
    expect(list[0].hasAttribute("id")).toBe(false);
    expect(panel().childElementCount).toBe(1);
  });

  it("never takes the active row, so aria-activedescendant points at nothing while it shows", () => {
    const { input } = renderCombobox();

    fireEvent.focus(input);
    tick(DEBOUNCE_MS);

    expect(input.hasAttribute("aria-activedescendant")).toBe(false);

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    expect(rows()[0].getAttribute("aria-selected")).toBe("false");
  });

  it("stays inert under the pointer: the press selects nothing and the panel guard keeps it alive", () => {
    const { input, onSelect } = renderCombobox();

    fireEvent.focus(input);
    tick(DEBOUNCE_MS);

    expect(fireEvent.mouseDown(rows()[0])).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("the listbox a screen reader reads", () => {
  it("publishes the combobox contract on the input before anything opens", () => {
    const { input } = renderCombobox({ options: OPTIONS });

    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-controls")).toBe(LISTBOX_ID);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("gives the open panel the id the input already points at, named after the field", () => {
    const { input } = openWithResults();

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(
      screen.getByRole("listbox", { name: LABEL }).getAttribute("id")
    ).toBe(LISTBOX_ID);
  });

  it("takes the listbox label over the field label when the consumer names the list", () => {
    openWithResults({ listboxLabel: LISTBOX_LABEL });

    expect(panel().getAttribute("aria-label")).toBe(LISTBOX_LABEL);
    expect(
      screen.getByRole("listbox", { name: LISTBOX_LABEL }).getAttribute("id")
    ).toBe(LISTBOX_ID);
  });

  it("renders one row per option and marks exactly one of them selected", () => {
    openWithResults();

    const list = rows();
    const selected = list.filter(
      (row) => row.getAttribute("aria-selected") === "true"
    );

    expect(list.length).toBe(OPTIONS.length);
    expect(selected.length).toBe(1);
    expect(list[0].getAttribute("aria-selected")).toBe("true");
  });

  it("points aria-activedescendant at the first row and moves it with the active row", () => {
    const { input } = openWithResults();

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(0));

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(1));

    const list = rows();

    expect(list[0].getAttribute("aria-selected")).toBe("false");
    expect(list[1].getAttribute("aria-selected")).toBe("true");
    expect(list[1].getAttribute("id")).toBe(optionId(1));
  });

  it("marks the listbox busy while the bars stand in for the rows", () => {
    const { input } = renderCombobox({ options: OPTIONS });

    typeInto(input, "Киї");

    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);
    expect(panel().getAttribute("aria-busy")).toBe("true");
  });

  it("drops the busy flag once the rows are the ones on screen", () => {
    openWithResults();

    expect(panel().getAttribute("aria-busy")).toBe("false");
  });
});

describe("the panel box the rows live in", () => {
  it("scrolls inside the ratified 220px window instead of running down the page", () => {
    openWithResults();

    expect(missing(panel(), PANEL_CLASSES)).toEqual([]);
  });

  it("fuses its top border into the input border instead of stacking a second one", () => {
    openWithResults();

    expect(panel().classList.contains(PANEL_BORDER_FUSE)).toBe(true);
  });

  it("cancels a press on its own chrome, so the gutter never blurs the input out from under the list", () => {
    const { input } = openWithResults();

    expect(fireEvent.mouseDown(panel())).toBe(false);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(rows().length).toBe(OPTIONS.length);
  });

  it("renders the chevron at the ratified 18px", () => {
    renderCombobox();

    expect(chevron().getAttribute("width")).toBe(CHEVRON_SIZE);
    expect(chevron().getAttribute("height")).toBe(CHEVRON_SIZE);
  });
});

describe("the ink inversion that says where Enter will land", () => {
  it("fills the active row with ink and leaves the rest on paper", () => {
    openWithResults();

    const list = rows();

    expect(missing(list[0], ACTIVE_ROW_CLASSES)).toEqual([]);
    expect(list[1].classList.contains(INACTIVE_ROW_CLASS)).toBe(true);
    expect(missing(list[1], ACTIVE_ROW_CLASSES)).toEqual(ACTIVE_ROW_CLASSES);
  });

  it("moves the inversion with the arrow key, one row inverted at a time", () => {
    const { input } = openWithResults();

    fireEvent.keyDown(input, { key: "ArrowDown" });

    const list = rows();

    expect(missing(list[1], ACTIVE_ROW_CLASSES)).toEqual([]);
    expect(list[0].classList.contains(INACTIVE_ROW_CLASS)).toBe(true);
    expect(missing(list[0], ACTIVE_ROW_CLASSES)).toEqual(ACTIVE_ROW_CLASSES);
  });

  it("mutes the meta on the inverted row and fades it on the rest", () => {
    openWithResults();

    const list = rows();

    expect(metaOf(list[0]).classList.contains(ACTIVE_META_CLASS)).toBe(true);
    expect(metaOf(list[0]).classList.contains(INACTIVE_META_CLASS)).toBe(false);
    expect(metaOf(list[1]).classList.contains(INACTIVE_META_CLASS)).toBe(true);
    expect(metaOf(list[1]).classList.contains(ACTIVE_META_CLASS)).toBe(false);
  });
});

describe("walking the list from the keyboard", () => {
  it("cancels the arrow so the caret and the page stay put", () => {
    const { input } = openWithResults();

    expect(fireEvent.keyDown(input, { key: "ArrowDown" })).toBe(false);
  });

  it("cancels the arrows over the busy panel too, so the page cannot scroll under the bars", () => {
    const { input } = renderCombobox({ options: OPTIONS });

    typeInto(input, "Киї");

    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);
    expect(fireEvent.keyDown(input, { key: "ArrowDown" })).toBe(false);
    expect(fireEvent.keyDown(input, { key: "ArrowUp" })).toBe(false);
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("stays on the last row instead of wrapping to the top", () => {
    const { input } = openWithResults();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(2));

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(2));
  });

  it("stays on the first row instead of wrapping to the bottom", () => {
    const { input } = openWithResults();

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(0));

    fireEvent.keyDown(input, { key: "ArrowUp" });

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(0));
  });

  it("walks back up the rows it walked down", () => {
    const { input } = openWithResults();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(1));
  });

  it("returns the active row to the top when a new list arrives, instead of teleporting it", () => {
    const scene = openWithResults();

    fireEvent.keyDown(scene.input, { key: "ArrowDown" });
    fireEvent.keyDown(scene.input, { key: "ArrowDown" });

    expect(scene.input.getAttribute("aria-activedescendant")).toBe(optionId(2));

    scene.update({ options: [OPTIONS[0]] });
    scene.update({ options: OPTIONS });

    expect(scene.input.getAttribute("aria-activedescendant")).toBe(optionId(0));
    expect(rows()[0].getAttribute("aria-selected")).toBe("true");
  });
});

describe("the keys the combobox leaves to the browser", () => {
  it("ignores an arrow carried by a modifier so browser and os shortcuts survive", () => {
    const { input } = openWithResults();

    for (const modifier of MODIFIERS) {
      const isDefaultAllowed = fireEvent.keyDown(input, {
        key: "ArrowDown",
        ...modifier,
      });

      expect(isDefaultAllowed).toBe(true);
    }

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(0));
  });

  it("ignores Enter carried by a modifier, so the row under it survives the shortcut", () => {
    const { input, onSelect } = openWithResults();

    for (const modifier of MODIFIERS) {
      const isDefaultAllowed = fireEvent.keyDown(input, {
        key: "Enter",
        ...modifier,
      });

      expect(isDefaultAllowed).toBe(true);
    }

    expect(onSelect).not.toHaveBeenCalled();
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("ignores a key another handler already cancelled", () => {
    const { input, onSelect } = openWithResults();
    const cancelled = createEvent.keyDown(input, { key: "Enter" });

    cancelled.preventDefault();
    fireEvent(input, cancelled);

    expect(onSelect).not.toHaveBeenCalled();
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("walking the list with the pointer", () => {
  it("hands the active row to the option the pointer entered", () => {
    const { input } = openWithResults();

    hover(rows()[2]);

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(2));
    expect(rows()[2].getAttribute("aria-selected")).toBe("true");
    expect(missing(rows()[2], ACTIVE_ROW_CLASSES)).toEqual([]);
    expect(rows()[0].getAttribute("aria-selected")).toBe("false");
  });
});

describe("the scroll the list does only for the keyboard", () => {
  it("brings the newly active row into view when an arrow moves it", () => {
    const { input } = openWithResults();

    expect(scrollIntoViewSpy).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewSpy).toHaveBeenCalledWith(NEAREST_BLOCK);
  });

  it("holds the list still when the pointer is the one moving the active row", () => {
    openWithResults();

    hover(rows()[2]);

    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
  });

  it("stays still on a later options change, because an arrow that hit the boundary armed nothing", () => {
    const scene = openWithResults();

    fireEvent.keyDown(scene.input, { key: "ArrowDown" });
    fireEvent.keyDown(scene.input, { key: "ArrowDown" });
    fireEvent.keyDown(scene.input, { key: "ArrowDown" });
    scrollIntoViewSpy.mockClear();

    scene.update({ options: [OPTIONS[0]] });

    expect(scene.input.getAttribute("aria-activedescendant")).toBe(optionId(0));
    expect(scrollIntoViewSpy).not.toHaveBeenCalled();
  });
});

describe("picking an option", () => {
  it("hands the whole option object over on Enter and closes the panel", () => {
    const { input, onSelect } = openWithResults();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("picks on mousedown and cancels it, so the input never blurs out from under the pick", () => {
    const { input, onSelect } = openWithResults();
    const row = rows()[1];

    expect(fireEvent.mouseDown(row)).toBe(false);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("never echoes the pick back through onValueChange, on either path, because the consumer owns the query", () => {
    const scene = settleWithResults("Льв");
    const echoes = scene.onValueChange.mock.calls.length;

    fireEvent.keyDown(scene.input, { key: "Enter" });

    expect(scene.onSelect).toHaveBeenCalledTimes(1);
    expect(scene.onValueChange.mock.calls.length).toBe(echoes);

    fireEvent.click(scene.input);
    fireEvent.mouseDown(rows()[1]);

    expect(scene.onSelect).toHaveBeenCalledTimes(2);
    expect(scene.onValueChange.mock.calls.length).toBe(echoes);
  });
});

describe("Enter and the form wrapped around the field", () => {
  it("cancels Enter while a row is active so the checkout cannot submit under the panel", () => {
    const { input, onSubmit } = openWithResults();

    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("cancels Enter while the panel is still busy, so an impatient submit waits for the list", () => {
    const { input, onSelect, onSubmit } = renderCombobox({ options: OPTIONS });

    typeInto(input, "Киї");

    expect(loadingBars().length).toBe(LOADING_BAR_COUNT);
    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("cancels Enter over the empty row too, so a dead query cannot submit the form either", () => {
    const { input, onSelect, onSubmit } = renderCombobox();

    fireEvent.focus(input);
    tick(DEBOUNCE_MS);

    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("leaves Enter alone with the panel closed so the form still submits", () => {
    const { input } = renderCombobox({ options: OPTIONS });

    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(true);
  });
});

describe("closing and reopening the panel", () => {
  it("closes on Escape and takes the listbox out of the dom", () => {
    const { input } = openWithResults();

    expect(fireEvent.keyDown(input, { key: "Escape" })).toBe(false);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("drops the armed search too, so a dismissed query costs no request", () => {
    const { input, onSearch } = renderCombobox();

    typeInto(input, "Льв");
    fireEvent.keyDown(input, { key: "Escape" });
    tick(DEBOUNCE_MS * 2);

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("reopens on the rows it already has, not on the bars of the query it dropped", () => {
    const { input } = renderCombobox({ options: OPTIONS });

    typeInto(input, "Льв");
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(loadingBars().length).toBe(0);
    expect(rows().length).toBe(OPTIONS.length);
  });

  it("reopens on ArrowDown at the first row without asking the consumer to search again", () => {
    const { input, onSearch } = openWithResults();

    fireEvent.keyDown(input, { key: "Escape" });

    const searches = onSearch.mock.calls.length;

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(rows().length).toBe(OPTIONS.length);
    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(0));

    tick(DEBOUNCE_MS);

    expect(onSearch.mock.calls.length).toBe(searches);
  });

  it("reopens on a click, because a pick leaves the focus on the input and fires no second focus", () => {
    const { input, onSearch } = openWithResults();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(input.getAttribute("aria-expanded")).toBe("false");

    const searches = onSearch.mock.calls.length;

    fireEvent.click(input);

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(rows().length).toBe(OPTIONS.length);

    tick(DEBOUNCE_MS);

    expect(onSearch.mock.calls.length).toBe(searches);
  });

  it("leaves an open panel open when the pointer comes back to the input", () => {
    const { input } = openWithResults();

    fireEvent.click(input);

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(rows().length).toBe(OPTIONS.length);
  });
});

describe("the grace period after focus leaves", () => {
  it("keeps the panel open right up to the last millisecond of the grace", () => {
    const { input } = openWithResults();

    fireEvent.blur(input);

    expect(input.getAttribute("aria-expanded")).toBe("true");

    tick(BLUR_GRACE_MS - 1);

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(rows().length).toBe(OPTIONS.length);
  });

  it("closes the panel when the grace expires", () => {
    const { input } = openWithResults();

    fireEvent.blur(input);
    tick(BLUR_GRACE_MS);

    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("cancels the pending close when focus comes straight back", () => {
    const { input } = openWithResults();

    fireEvent.blur(input);
    tick(MID_GRACE_MS);
    fireEvent.focus(input);
    tick(MID_GRACE_MS);

    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("drops the armed search when the grace closes the panel, the field left behind costs no request", () => {
    const { input, onSearch } = renderCombobox({ options: OPTIONS });

    typeInto(input, "Льв");
    fireEvent.blur(input);
    tick(DEBOUNCE_MS * 2);

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("the query the combobox refuses to own", () => {
  it("reports the keystroke but leaves the displayed value to the consumer", () => {
    const { input, onValueChange, onSelect } = renderCombobox({
      value: "Львів",
      options: OPTIONS,
    });

    typeInto(input, "Киї");

    expect(onValueChange).toHaveBeenCalledWith("Киї");
    expect(input.value).toBe("Львів");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("shows the new query only once the consumer re-renders with it", () => {
    const { input, update } = renderCombobox({
      value: "Львів",
      options: OPTIONS,
    });

    typeInto(input, "Киї");
    update({ value: "Киї", options: OPTIONS });

    expect(input.value).toBe("Киї");
  });

  it("schedules a fresh search when typing resumes after a pick, without selecting again", () => {
    const scene = openWithResults();

    fireEvent.keyDown(scene.input, { key: "Enter" });
    scene.update({ value: OPTIONS[0].label, options: OPTIONS });
    typeInto(scene.input, "Киї");

    expect(scene.onValueChange).toHaveBeenLastCalledWith("Киї");

    tick(DEBOUNCE_MS);

    expect(scene.onSearch).toHaveBeenLastCalledWith("Киї");
    expect(scene.onSelect).toHaveBeenCalledTimes(1);
  });
});

describe("the disabled combobox", () => {
  it("carries the native disabled attribute", () => {
    const { input } = renderCombobox({ disabled: true, options: OPTIONS });

    expect(input.disabled).toBe(true);
  });

  it("keeps the panel shut when focus and the arrow key both arrive anyway", () => {
    const { input } = renderCombobox({ disabled: true, options: OPTIONS });

    fireEvent.focus(input);
    tick(DEBOUNCE_MS);

    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes an open panel for good, so re-enabling never brings stale rows back on its own", () => {
    const scene = openWithResults();

    expect(rows().length).toBe(OPTIONS.length);

    scene.update({ options: OPTIONS, disabled: true });

    expect(scene.input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();

    scene.update({ options: OPTIONS, disabled: false });

    expect(scene.input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("drops the armed search as well, so a locked form never queries the directory mid-submit", () => {
    const scene = renderCombobox({ options: OPTIONS });

    typeInto(scene.input, "Льв");
    scene.update({ options: OPTIONS, disabled: true });
    tick(DEBOUNCE_MS * 2);

    expect(scene.onSearch).not.toHaveBeenCalled();
  });
});

describe("the error the field publishes", () => {
  it("marks the input invalid, points it at the message and paints the invalid border", () => {
    const { input } = renderCombobox({ error: ERROR_TEXT });

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(ERROR_ID);
    expect(input.classList.contains(INVALID_BORDER_CLASS)).toBe(true);
  });

  it("renders the message as an alert carrying the id the input names", () => {
    renderCombobox({ error: ERROR_TEXT });

    const alert = screen.getByRole("alert");

    expect(alert.getAttribute("id")).toBe(ERROR_ID);
    expect(alert.textContent).toBe(ERROR_TEXT);
  });

  it("publishes neither hook while the field is clean", () => {
    const { input } = renderCombobox();

    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("treats an empty error string as clean, not as a red border pointing at nothing", () => {
    const { input } = renderCombobox({ error: "" });

    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(input.classList.contains(INVALID_BORDER_CLASS)).toBe(false);
    expect(input.classList.contains(VALID_BORDER_CLASS)).toBe(true);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("the plain input contract the field forwards", () => {
  it("hands the placeholder straight to the input", () => {
    const { input } = renderCombobox({ placeholder: PLACEHOLDER });

    expect(input.getAttribute("placeholder")).toBe(PLACEHOLDER);
  });

  it("marks the input required and the label with the asterisk", () => {
    const { input } = renderCombobox({ required: true });

    expect(input.required).toBe(true);
    expect(screen.getByText(ASTERISK).textContent).toBe(` ${ASTERISK}`);
  });

  it("leaves the input optional and the label bare by default", () => {
    const { input } = renderCombobox();

    expect(input.required).toBe(false);
    expect(screen.queryByText(ASTERISK)).toBeNull();
  });

  it("hands the consumer className to the field root rather than to the input", () => {
    const { input } = renderCombobox({ className: FIELD_CLASS });

    expect(document.querySelectorAll(`.${FIELD_CLASS}`).length).toBe(1);
    expect(fieldRoot().contains(input)).toBe(true);
    expect(input.classList.contains(FIELD_CLASS)).toBe(false);
  });
});

describe("the meta line an option may carry", () => {
  it("renders the meta beside the label when the option has one", () => {
    openWithResults();

    const row = rows()[0];

    expect(row.childElementCount).toBe(2);
    expect(row.textContent).toBe(`${OPTIONS[0].label}${META_LABEL}`);
  });

  it("renders nothing beside the label when the option has none", () => {
    openWithResults();

    const row = rows()[2];

    expect(row.childElementCount).toBe(1);
    expect(row.textContent).toBe(OPTIONS[2].label);
  });
});

describe("timers that would outlive the component", () => {
  it("drops the pending search when the field unmounts mid-window", () => {
    const { input, onSearch, unmount } = renderCombobox();

    typeInto(input, "Льв");
    unmount();
    tick(DEBOUNCE_MS * 2);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("drops the pending blur close when the field unmounts inside the grace", () => {
    const { input, unmount } = openWithResults();

    fireEvent.blur(input);

    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
