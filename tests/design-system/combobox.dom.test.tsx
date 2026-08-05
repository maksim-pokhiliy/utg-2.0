import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

import { Combobox, type ComboboxOption } from "@root/design-system";

const ID = "np-city";
const LISTBOX_ID = `${ID}-listbox`;
const ERROR_ID = `${ID}-error`;
const LABEL = "Місто";
const EMPTY_LABEL = "Нічого не знайдено";
const ERROR_TEXT = "Оберіть місто";
const META_LABEL = "Львівська обл.";
const DEBOUNCE_MS = 250;
const BLUR_GRACE_MS = 140;
const MID_GRACE_MS = 100;
const LOADING_BAR_COUNT = 3;
const HIDDEN_SELECTOR = '[aria-hidden="true"]';

const OPTIONS: readonly ComboboxOption[] = [
  { id: "lviv", label: "Львів", meta: META_LABEL },
  { id: "kyiv", label: "Київ", meta: "Київська обл." },
  { id: "odesa", label: "Одеса" },
];

interface Props {
  value?: string;
  options?: readonly ComboboxOption[];
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}

interface Scene {
  input: HTMLInputElement;
  onValueChange: Mock<(next: string) => void>;
  onSearch: Mock<(query: string) => void>;
  onSelect: Mock<(option: ComboboxOption) => void>;
  update: (next: Props) => void;
  unmount: () => void;
}

const renderCombobox = (props: Props = {}): Scene => {
  const onValueChange = vi.fn<(next: string) => void>();
  const onSearch = vi.fn<(query: string) => void>();
  const onSelect = vi.fn<(option: ComboboxOption) => void>();

  const markup = (current: Props): ReactElement => (
    <Combobox
      id={ID}
      label={LABEL}
      value={current.value ?? ""}
      onValueChange={onValueChange}
      onSearch={onSearch}
      onSelect={onSelect}
      options={current.options ?? []}
      emptyLabel={EMPTY_LABEL}
      loading={current.loading}
      disabled={current.disabled}
      error={current.error}
    />
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

const optionId = (index: number): string => `${ID}-option-${index}`;

const panel = (): HTMLElement => screen.getByRole("listbox");

const loadingBars = (): NodeListOf<Element> =>
  panel().querySelectorAll(HIDDEN_SELECTOR);

const openWithResults = (): Scene => {
  const scene = renderCombobox({ options: OPTIONS });

  fireEvent.focus(scene.input);
  tick(DEBOUNCE_MS);

  return scene;
};

beforeEach(() => {
  vi.useFakeTimers();
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

  it("hands the panel over to the empty label the moment the window closes", () => {
    const { input } = renderCombobox();

    typeInto(input, "Льв");
    tick(DEBOUNCE_MS);

    expect(screen.getByText(EMPTY_LABEL).textContent).toBe(EMPTY_LABEL);
    expect(panel().querySelectorAll(HIDDEN_SELECTOR).length).toBe(0);
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

describe("the empty result row", () => {
  it("carries the label the consumer supplied and claims no option role", () => {
    const { input } = renderCombobox();

    fireEvent.focus(input);
    tick(DEBOUNCE_MS);

    expect(screen.getByText(EMPTY_LABEL).textContent).toBe(EMPTY_LABEL);
    expect(screen.queryAllByRole("option").length).toBe(0);
  });

  it("stays inert, so pressing it selects nothing and leaves the panel open", () => {
    const { input, onSelect } = renderCombobox();

    fireEvent.focus(input);
    tick(DEBOUNCE_MS);
    fireEvent.mouseDown(screen.getByText(EMPTY_LABEL));

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

  it("renders one row per option and marks exactly one of them selected", () => {
    openWithResults();

    const rows = screen.getAllByRole("option");
    const selected = rows.filter(
      (row) => row.getAttribute("aria-selected") === "true"
    );

    expect(rows.length).toBe(OPTIONS.length);
    expect(selected.length).toBe(1);
    expect(rows[0].getAttribute("aria-selected")).toBe("true");
  });

  it("points aria-activedescendant at the first row and moves it with the active row", () => {
    const { input } = openWithResults();

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(0));

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(1));

    const rows = screen.getAllByRole("option");

    expect(rows[0].getAttribute("aria-selected")).toBe("false");
    expect(rows[1].getAttribute("aria-selected")).toBe("true");
    expect(rows[1].getAttribute("id")).toBe(optionId(1));
  });
});

describe("walking the list from the keyboard", () => {
  it("cancels the arrow so the caret and the page stay put", () => {
    const { input } = openWithResults();

    expect(fireEvent.keyDown(input, { key: "ArrowDown" })).toBe(false);
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
    const row = screen.getAllByRole("option")[1];

    expect(fireEvent.mouseDown(row)).toBe(false);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("Enter and the form wrapped around the field", () => {
  it("cancels Enter while a row is active so the checkout cannot submit under the panel", () => {
    const { input } = openWithResults();

    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
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

  it("reopens on ArrowDown at the first row without asking the consumer to search again", () => {
    const { input, onSearch } = openWithResults();

    fireEvent.keyDown(input, { key: "Escape" });

    const searches = onSearch.mock.calls.length;

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("option").length).toBe(OPTIONS.length);
    expect(input.getAttribute("aria-activedescendant")).toBe(optionId(0));

    tick(DEBOUNCE_MS);

    expect(onSearch.mock.calls.length).toBe(searches);
  });
});

describe("the grace period after focus leaves", () => {
  it("keeps the panel open right up to the last millisecond of the grace", () => {
    const { input } = openWithResults();

    fireEvent.blur(input);

    expect(input.getAttribute("aria-expanded")).toBe("true");

    tick(BLUR_GRACE_MS - 1);

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("option").length).toBe(OPTIONS.length);
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
});

describe("the error the field publishes", () => {
  it("marks the input invalid, points it at the message and paints the invalid border", () => {
    const { input } = renderCombobox({ error: ERROR_TEXT });

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(ERROR_ID);
    expect(input.classList.contains("border-destructive")).toBe(true);
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
});

describe("the meta line an option may carry", () => {
  it("renders the meta beside the label when the option has one", () => {
    openWithResults();

    const row = screen.getAllByRole("option")[0];

    expect(row.childElementCount).toBe(2);
    expect(row.textContent).toBe(`${OPTIONS[0].label}${META_LABEL}`);
  });

  it("renders nothing beside the label when the option has none", () => {
    openWithResults();

    const row = screen.getAllByRole("option")[2];

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
    unmount();
    tick(BLUR_GRACE_MS * 2);

    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
