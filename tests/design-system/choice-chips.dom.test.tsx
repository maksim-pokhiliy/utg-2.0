import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ChoiceChips,
  Field,
  Input,
  Textarea,
  type ChoiceChipOption,
} from "@root/design-system";

const LABEL = "Contact channel";
const METHOD_LABEL = "Delivery method";
const HELPER = "Nova Poshta has no branches or parcel lockers here";
const OPTIONS: readonly ChoiceChipOption[] = [
  { id: "phone", label: "Phone" },
  { id: "viber", label: "Viber" },
  { id: "telegram", label: "Telegram" },
];
const METHODS: readonly ChoiceChipOption[] = [
  { id: "branch", label: "Branch" },
  { id: "locker", label: "Parcel locker", disabled: true },
  { id: "courier", label: "Courier" },
];
const COURIER_ONLY_METHODS: readonly ChoiceChipOption[] = [
  { id: "branch", label: "Branch", disabled: true },
  { id: "locker", label: "Parcel locker", disabled: true },
  { id: "courier", label: "Courier" },
];
const HEAD_DISABLED_METHODS: readonly ChoiceChipOption[] = [
  { id: "branch", label: "Branch", disabled: true },
  { id: "locker", label: "Parcel locker" },
  { id: "courier", label: "Courier" },
];
const TAIL_DISABLED_METHODS: readonly ChoiceChipOption[] = [
  { id: "branch", label: "Branch" },
  { id: "locker", label: "Parcel locker" },
  { id: "courier", label: "Courier", disabled: true },
];
const SERVED_METHOD = "locker";
const UNSERVED_METHODS: readonly ChoiceChipOption[] = METHODS.map((option) => ({
  ...option,
  disabled: true,
}));
const MIDDLE = OPTIONS[1].id;
const FIRST_METHOD = METHODS[0].id;
const LAST_METHOD = METHODS[2].id;
const UNKNOWN_VALUE = "carrier-pigeon";
const MODIFIERS = [
  { ctrlKey: true },
  { altKey: true },
  { metaKey: true },
  { shiftKey: true },
];

const CHIP_CHROME = [
  "inline-flex",
  "items-center",
  "justify-center",
  "min-h-11",
  "px-4",
  "border-2",
  "border-ink",
  "cursor-pointer",
  "font-mono",
  "font-medium",
  "text-[0.8125rem]",
  "leading-none",
  "tracking-[var(--caps-tracking)]",
  "uppercase",
  "transition-colors",
  "duration-200",
  "ease-[var(--ease)]",
  "disabled:opacity-55",
  "disabled:cursor-not-allowed",
  "disabled:pointer-events-none",
  "aria-disabled:opacity-55",
  "aria-disabled:cursor-not-allowed",
];

const HOVER_INVERSION = ["hover:bg-ink", "hover:text-paper"];

const EXPECTED_CHIP = {
  selected: [...CHIP_CHROME, "bg-ink", "text-paper"],
  unselected: [...CHIP_CHROME, "bg-paper", "text-ink", ...HOVER_INVERSION],
  unavailable: [...CHIP_CHROME, "bg-paper", "text-ink"],
};

const EXPECTED_ROW = ["flex", "flex-wrap", "gap-2"];
const EXPECTED_FIELD = ["flex", "flex-col", "gap-1.5"];
const EXPECTED_CAPTION = ["type-caption", "text-ink"];
const EXPECTED_ERROR = ["type-small", "font-medium", "text-destructive"];

interface ChipsOverrides {
  label?: string;
  value?: string;
  onChange?: (id: string) => void;
  options?: readonly ChoiceChipOption[];
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const classesOf = (element: Element): string[] =>
  Array.from(element.classList).sort();

const exactly = (utilities: readonly string[]): string[] =>
  [...utilities].sort();

const renderChips = (overrides: ChipsOverrides = {}): HTMLElement[] => {
  const {
    label = LABEL,
    value = MIDDLE,
    onChange = vi.fn(),
    options = OPTIONS,
    helper,
    required,
    disabled,
    className,
  } = overrides;

  render(
    <ChoiceChips
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      helper={helper}
      required={required}
      disabled={disabled}
      className={className}
    />
  );

  return screen.getAllByRole("radio");
};

const renderMethods = (overrides: ChipsOverrides = {}): HTMLElement[] =>
  renderChips({
    label: METHOD_LABEL,
    value: FIRST_METHOD,
    options: METHODS,
    helper: HELPER,
    ...overrides,
  });

const describedNodeOf = (chip: HTMLElement): HTMLElement | null => {
  const id = chip.getAttribute("aria-describedby");

  return id === null ? null : document.getElementById(id);
};

const group = (): HTMLElement => screen.getByRole("radiogroup");

const chipRow = (): HTMLElement => {
  const row = screen.getAllByRole("radio")[0].parentElement;

  if (!(row instanceof HTMLElement)) {
    throw new Error("ChoiceChips rendered no chip row");
  }

  return row;
};

const caption = (): HTMLElement => {
  const id = group().getAttribute("aria-labelledby");
  const node = id === null ? null : document.getElementById(id);

  if (!(node instanceof HTMLElement)) {
    throw new Error("ChoiceChips named its group after nothing");
  }

  return node;
};

const press = (key: string, from: number, value = MIDDLE): string[][] => {
  const onChange = vi.fn();
  const chips = renderChips({ value, onChange });

  fireEvent.keyDown(chips[from], { key });

  return onChange.mock.calls;
};

const firstChildOf = (parent: Element, what: string): HTMLElement => {
  const node = parent.firstElementChild;

  if (!(node instanceof HTMLElement)) {
    throw new Error(`Field rendered no ${what}`);
  }

  return node;
};

const renderField = (
  props: Partial<{
    required: boolean;
    error: string;
    helper: string;
    className: string;
  }> = {}
): HTMLElement => {
  const { container } = render(
    <Field label="City" htmlFor="city" {...props}>
      <Input
        id="city"
        name="city"
        autoComplete="address-level2"
        value="Kyiv"
        placeholder="Type a city"
        onChange={() => {}}
        invalid={props.error !== undefined}
        required={props.required}
      />
    </Field>
  );

  return firstChildOf(container, "wrapper");
};

describe("the chip group's radio semantics", () => {
  it("publishes one radio per option inside a group a screen reader finds by its caption", () => {
    const chips = renderChips();
    const named = screen.getByRole("radiogroup", { name: LABEL });

    expect(chips.length).toBe(OPTIONS.length);

    for (const chip of chips) {
      expect(named.contains(chip)).toBe(true);
    }
  });

  it("checks exactly the chip whose option id equals the value and no other", () => {
    const chips = renderChips({ value: OPTIONS[2].id });

    expect(chips.map((chip) => chip.getAttribute("aria-checked"))).toEqual([
      "false",
      "false",
      "true",
    ]);
    expect(chips[2].textContent).toBe(OPTIONS[2].label);
  });
});

describe("the roving tabindex that keeps the group one tab stop", () => {
  it("leaves the checked chip in the tab order and pulls every other chip out of it", () => {
    expect(renderChips().map((chip) => chip.tabIndex)).toEqual([-1, 0, -1]);
  });
});

describe("a value matching no option, which an async default or a consumer bug produces", () => {
  it("checks nothing", () => {
    const chips = renderChips({ value: UNKNOWN_VALUE });

    expect(chips.map((chip) => chip.getAttribute("aria-checked"))).toEqual([
      "false",
      "false",
      "false",
    ]);
  });

  it("still hands the first chip the tab stop so the group stays keyboard-reachable", () => {
    expect(
      renderChips({ value: UNKNOWN_VALUE }).map((chip) => chip.tabIndex)
    ).toEqual([0, -1, -1]);
  });
});

describe("the arrow, Home and End matrix from the middle chip", () => {
  it("advances to the next option on ArrowRight", () => {
    expect(press("ArrowRight", 1)).toEqual([[OPTIONS[2].id]]);
  });

  it("advances to the next option on ArrowDown, because a chip row is one axis to a keyboard", () => {
    expect(press("ArrowDown", 1)).toEqual([[OPTIONS[2].id]]);
  });

  it("retreats to the previous option on ArrowLeft", () => {
    expect(press("ArrowLeft", 1)).toEqual([[OPTIONS[0].id]]);
  });

  it("retreats to the previous option on ArrowUp", () => {
    expect(press("ArrowUp", 1)).toEqual([[OPTIONS[0].id]]);
  });

  it("jumps to the first option on Home", () => {
    expect(press("Home", 1)).toEqual([[OPTIONS[0].id]]);
  });

  it("jumps to the last option on End", () => {
    expect(press("End", 1)).toEqual([[OPTIONS[2].id]]);
  });
});

describe("Home and End over a row whose edge chip the carrier does not serve", () => {
  it("walks Home forward off a disabled first chip onto the first one the carrier does serve", () => {
    const onChange = vi.fn();
    const chips = renderChips({
      options: HEAD_DISABLED_METHODS,
      value: LAST_METHOD,
      onChange,
    });

    fireEvent.keyDown(chips[2], { key: "Home" });

    expect(onChange.mock.calls).toEqual([[SERVED_METHOD]]);
    expect(document.activeElement).toBe(chips[1]);
  });

  it("walks End backward off a disabled last chip onto the last one the carrier does serve", () => {
    const onChange = vi.fn();
    const chips = renderChips({
      options: TAIL_DISABLED_METHODS,
      value: FIRST_METHOD,
      onChange,
    });

    fireEvent.keyDown(chips[0], { key: "End" });

    expect(onChange.mock.calls).toEqual([[SERVED_METHOD]]);
    expect(document.activeElement).toBe(chips[1]);
  });
});

describe("the wrapping that WAI requires of a radiogroup", () => {
  it("wraps from the last chip round to the first on ArrowRight", () => {
    expect(press("ArrowRight", 2, OPTIONS[2].id)).toEqual([[OPTIONS[0].id]]);
  });

  it("wraps from the first chip round to the last on ArrowLeft", () => {
    expect(press("ArrowLeft", 0, OPTIONS[0].id)).toEqual([[OPTIONS[2].id]]);
  });
});

describe("the rule that a radiogroup selects as it moves, unlike a listbox", () => {
  it("selects the target option and drags focus onto it in the same keystroke", () => {
    const onChange = vi.fn();
    const chips = renderChips({ onChange });

    chips[1].focus();
    fireEvent.keyDown(chips[1], { key: "ArrowRight" });

    expect(onChange.mock.calls).toEqual([[OPTIONS[2].id]]);
    expect(document.activeElement).toBe(chips[2]);
  });
});

describe("the keystrokes the component deliberately declines", () => {
  it("ignores an arrow carried by a modifier so browser and os shortcuts survive", () => {
    const onChange = vi.fn();
    const chips = renderChips({ onChange });

    for (const modifier of MODIFIERS) {
      const isDefaultAllowed = fireEvent.keyDown(chips[1], {
        key: "ArrowRight",
        ...modifier,
      });

      expect(isDefaultAllowed).toBe(true);
    }

    expect(onChange).not.toHaveBeenCalled();
  });

  it("leaves Space to the native button click, which is why onChange never double-fires", () => {
    const onChange = vi.fn();
    const chips = renderChips({ onChange });

    const isDefaultAllowed = fireEvent.keyDown(chips[0], { key: " " });

    expect(onChange).not.toHaveBeenCalled();
    expect(isDefaultAllowed).toBe(true);
  });

  it("ignores a printable key, so typing at a focused chip never moves the selection", () => {
    const onChange = vi.fn();
    const chips = renderChips({ onChange });

    const isDefaultAllowed = fireEvent.keyDown(chips[1], { key: "a" });

    expect(onChange).not.toHaveBeenCalled();
    expect(isDefaultAllowed).toBe(true);
  });

  it("leaves Tab to the browser, or focus could never walk out of the group", () => {
    const onChange = vi.fn();
    const chips = renderChips({ onChange });

    const isDefaultAllowed = fireEvent.keyDown(chips[1], { key: "Tab" });

    expect(onChange).not.toHaveBeenCalled();
    expect(isDefaultAllowed).toBe(true);
  });
});

describe("pointer selection", () => {
  it("reports the clicked chip's option id", () => {
    const onChange = vi.fn();
    const chips = renderChips({ onChange });

    fireEvent.click(chips[2]);

    expect(onChange.mock.calls).toEqual([[OPTIONS[2].id]]);
  });
});

describe("a chip pressed inside the form the checkout wraps it in", () => {
  it("reports the choice without submitting the order under it", () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();

    render(
      <form onSubmit={onSubmit}>
        <ChoiceChips
          label={LABEL}
          value={MIDDLE}
          onChange={onChange}
          options={OPTIONS}
        />
      </form>
    );

    fireEvent.click(screen.getAllByRole("radio")[2]);

    expect(onChange.mock.calls).toEqual([[OPTIONS[2].id]]);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("says so on every chip's type attribute, which is what holds the submit back", () => {
    const chips = renderChips();

    expect(chips.map((chip) => chip.getAttribute("type"))).toEqual(
      OPTIONS.map(() => "button")
    );
  });
});

describe("the ratified chip geometry, which the addendum sizes to the thumb", () => {
  it("dresses a checked chip in the ratified chrome and not one class more", () => {
    const chips = renderChips();

    expect(classesOf(chips[1])).toEqual(exactly(EXPECTED_CHIP.selected));
  });

  it("dresses an unchecked chip in the same chrome plus the hover inversion it holds back", () => {
    const chips = renderChips();

    expect(classesOf(chips[0])).toEqual(exactly(EXPECTED_CHIP.unselected));
  });

  it("wraps the chips in one flex row at the ratified gap and not one class more", () => {
    renderChips();

    expect(classesOf(chipRow())).toEqual(exactly(EXPECTED_ROW));
  });
});

describe("the disabled group", () => {
  it("disables every chip natively rather than dimming a live control", () => {
    const chips = renderChips({ disabled: true });

    for (const chip of chips) {
      if (!(chip instanceof HTMLButtonElement)) {
        throw new Error("ChoiceChips rendered something other than a button");
      }

      expect(chip.disabled).toBe(true);
    }
  });

  it("kills the pointer on a locked chip, so hover can never paint it like the chosen one", () => {
    const chips = renderChips({ disabled: true });

    expect(classesOf(chips[0])).toEqual(exactly(EXPECTED_CHIP.unselected));
    expect(classesOf(chips[1])).toEqual(exactly(EXPECTED_CHIP.selected));

    for (const chip of chips) {
      expect(chip.classList.contains("disabled:pointer-events-none")).toBe(
        true
      );
    }
  });

  it("reports nothing when a chip is clicked", () => {
    const onChange = vi.fn();
    const chips = renderChips({ onChange, disabled: true });

    fireEvent.click(chips[0]);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("says so on the group too, because natively disabled chips read as an empty group", () => {
    renderChips({ disabled: true });

    expect(group().getAttribute("aria-disabled")).toBe("true");
  });

  it("leaves the group enabled while the chips are live", () => {
    renderChips();

    expect(group().getAttribute("aria-disabled")).toBe("false");
  });
});

describe("a method the carrier does not offer here, which the checkout disables rather than hides", () => {
  it("marks it aria-disabled and never natively disabled, because a real disabled attribute strands the focus already on it", () => {
    const chips = renderMethods();

    expect(chips[1].getAttribute("aria-disabled")).toBe("true");
    expect(chips[1].hasAttribute("disabled")).toBe(false);
    expect(chips[0].hasAttribute("aria-disabled")).toBe(false);
    expect(chips[2].hasAttribute("aria-disabled")).toBe(false);
  });

  it("reports nothing when the pointer lands on it anyway", () => {
    const onChange = vi.fn();
    const chips = renderMethods({ onChange });

    fireEvent.click(chips[1]);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("holds the hover inversion back, so the pointer can never paint a refused method like a live one", () => {
    const chips = renderMethods();

    expect(classesOf(chips[1])).toEqual(exactly(EXPECTED_CHIP.unavailable));
    expect(classesOf(chips[2])).toEqual(exactly(EXPECTED_CHIP.unselected));
  });

  it("skips it on ArrowRight and lands on the next method the carrier does offer", () => {
    const onChange = vi.fn();
    const chips = renderMethods({ onChange });

    chips[0].focus();

    const isDefaultAllowed = fireEvent.keyDown(chips[0], { key: "ArrowRight" });

    expect(isDefaultAllowed).toBe(false);
    expect(onChange.mock.calls).toEqual([[LAST_METHOD]]);
    expect(document.activeElement).toBe(chips[2]);
  });

  it("skips it on ArrowLeft too, wrapping straight past it to the last live method", () => {
    const onChange = vi.fn();
    const chips = renderMethods({ onChange });

    fireEvent.keyDown(chips[0], { key: "ArrowLeft" });

    expect(onChange.mock.calls).toEqual([[LAST_METHOD]]);
    expect(document.activeElement).toBe(chips[2]);
  });

  it("hands the tab stop to a live chip when every method above the chosen one is refused", () => {
    expect(
      renderMethods({
        options: COURIER_ONLY_METHODS,
        value: LAST_METHOD,
      }).map((chip) => chip.tabIndex)
    ).toEqual([-1, -1, 0]);
  });

  it("hands it to the first live chip when the value matches no option at all", () => {
    expect(
      renderMethods({
        options: COURIER_ONLY_METHODS,
        value: UNKNOWN_VALUE,
      }).map((chip) => chip.tabIndex)
    ).toEqual([-1, -1, 0]);
  });

  it("keeps the group in the tab order even where the carrier offers nothing, so the shopper is never trapped past it", () => {
    const onChange = vi.fn();
    const chips = renderMethods({
      options: UNSERVED_METHODS,
      value: UNKNOWN_VALUE,
      onChange,
    });

    expect(chips.map((chip) => chip.tabIndex)).toEqual([0, -1, -1]);

    const isDefaultAllowed = fireEvent.keyDown(chips[0], { key: "ArrowRight" });

    expect(isDefaultAllowed).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("the reason line under a refused chip", () => {
  it("renders the reason with an id and points the refused chip at it, so the refusal is spoken and not only greyed", () => {
    const chips = renderMethods();
    const reason = describedNodeOf(chips[1]);

    expect(reason).not.toBeNull();
    expect(reason?.id.length).toBeGreaterThan(0);
    expect(reason?.textContent).toBe(HELPER);
    expect(screen.getByText(HELPER)).toBe(reason);
  });

  it("leaves every live chip undescribed, because the reason is not about them", () => {
    const chips = renderMethods();

    expect(chips[0].hasAttribute("aria-describedby")).toBe(false);
    expect(chips[2].hasAttribute("aria-describedby")).toBe(false);
  });

  it("points two refused chips at the one line rather than repeating it under each", () => {
    const chips = renderMethods({ options: COURIER_ONLY_METHODS });

    expect(chips[0].getAttribute("aria-describedby")).toBe(
      chips[1].getAttribute("aria-describedby")
    );
    expect(describedNodeOf(chips[0])).toBe(describedNodeOf(chips[1]));
    expect(screen.getAllByText(HELPER)).toHaveLength(1);
  });

  it("points at nothing when the consumer gave no reason, rather than at an id that renders nothing", () => {
    const chips = renderMethods({ helper: undefined });

    expect(chips[1].getAttribute("aria-disabled")).toBe("true");
    expect(chips[1].hasAttribute("aria-describedby")).toBe(false);
    expect(screen.queryByText(HELPER)).toBeNull();
  });
});

describe("the Field the group is built out of rather than re-drawn by hand", () => {
  it("wears the Field wrapper's column layout and not one class more", () => {
    renderChips();

    expect(classesOf(group())).toEqual(exactly(EXPECTED_FIELD));
  });

  it("captions itself with a span, since a label pointing at a radiogroup would be an orphan", () => {
    renderChips();

    expect(caption().tagName).toBe("SPAN");
    expect(caption().hasAttribute("for")).toBe(false);
    expect(document.querySelector("label")).toBeNull();
  });

  it("names the group by reference to that caption instead of shadowing it with aria-label", () => {
    renderChips();

    expect(group().hasAttribute("aria-label")).toBe(false);
    expect(caption().id.length > 0).toBe(true);
    expect(caption().textContent).toBe(LABEL);
  });

  it("hands two groups on one page two caption ids, so neither steals the other's name", () => {
    render(
      <ChoiceChips
        label={LABEL}
        value={MIDDLE}
        onChange={() => {}}
        options={OPTIONS}
      />
    );
    render(
      <ChoiceChips
        label="Delivery"
        value={MIDDLE}
        onChange={() => {}}
        options={OPTIONS}
      />
    );

    const ids = screen
      .getAllByRole("radiogroup")
      .map((node) => node.getAttribute("aria-labelledby"));

    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("the caption above the chips", () => {
  it("renders the label the consumer passed on the Field caption ramp", () => {
    renderChips();

    expect(classesOf(caption())).toEqual(exactly(EXPECTED_CAPTION));
  });

  it("carries no required mark by default", () => {
    renderChips();

    expect(screen.queryByText("*")).toBeNull();
  });

  it("appends a destructive asterisk when the field is required", () => {
    renderChips({ required: true });

    const mark = screen.getByText("*");

    expect(classesOf(mark)).toEqual(["text-destructive"]);
    expect(mark.textContent).toBe(" *");
  });

  it("also marks the group required, since the glyph alone says nothing to a screen reader", () => {
    renderChips({ required: true });

    expect(group().getAttribute("aria-required")).toBe("true");
  });

  it("leaves the group optional when no asterisk is asked for", () => {
    renderChips();

    expect(group().getAttribute("aria-required")).toBe("false");
  });
});

describe("the ink inversion that says which chip is chosen", () => {
  it("paints the checked chip ink on paper", () => {
    const chips = renderChips();

    expect(chips[1].classList.contains("bg-ink")).toBe(true);
    expect(chips[1].classList.contains("text-paper")).toBe(true);
  });

  it("leaves an unchecked chip paper on ink, holding the inversion back for hover", () => {
    const chips = renderChips();

    expect(chips[0].classList.contains("bg-paper")).toBe(true);
    expect(chips[0].classList.contains("text-ink")).toBe(true);
    expect(chips[0].classList.contains("bg-ink")).toBe(false);
  });
});

describe("the consumer className on the group", () => {
  it("merges alongside the preset's column layout rather than replacing it", () => {
    renderChips({ className: "mt-6" });

    expect(classesOf(group())).toEqual(exactly([...EXPECTED_FIELD, "mt-6"]));
  });
});

describe("Field, rendered the way the two checkout consumers render it", () => {
  it("still captions a required invalid field with a real label and a destructive mark", () => {
    const wrapper = renderField({ required: true, error: "Required field" });
    const label = firstChildOf(wrapper, "caption");
    const mark = screen.getByText("*");

    expect(classesOf(wrapper)).toEqual(exactly(EXPECTED_FIELD));
    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe("city");
    expect(label.hasAttribute("id")).toBe(false);
    expect(classesOf(label)).toEqual(exactly(EXPECTED_CAPTION));
    expect(mark.textContent).toBe(" *");
    expect(classesOf(mark)).toEqual(["text-destructive"]);
  });

  it("still adds no group aria to a plain optional field, which is a wrapper and not a group", () => {
    const { container } = render(
      <Field label="Comment" htmlFor="additional">
        <Textarea id="additional" name="additional" rows={5} />
      </Field>
    );
    const wrapper = firstChildOf(container, "wrapper");

    expect(wrapper.hasAttribute("role")).toBe(false);
    expect(wrapper.hasAttribute("aria-labelledby")).toBe(false);
    expect(wrapper.hasAttribute("aria-required")).toBe(false);
    expect(wrapper.hasAttribute("aria-disabled")).toBe(false);
    expect(screen.queryByText("*")).toBeNull();
    expect(screen.getByText("Comment").tagName).toBe("LABEL");
  });

  it("still voices the error through an alert keyed to the input's describedby id", () => {
    renderField({ error: "Required field" });

    const alert = screen.getByRole("alert");

    expect(alert.id).toBe("city-error");
    expect(classesOf(alert)).toEqual(exactly(EXPECTED_ERROR));
  });

  it("still shows the helper only while no error is speaking over it", () => {
    renderField({ helper: "Street and building" });

    expect(classesOf(screen.getByText("Street and building"))).toEqual(
      exactly(["type-small", "text-ink-faint"])
    );

    renderField({ helper: "Street and building", error: "Required field" });

    expect(screen.getAllByText("Street and building").length).toBe(1);
  });
});
