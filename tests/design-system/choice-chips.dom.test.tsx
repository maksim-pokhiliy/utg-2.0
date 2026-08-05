import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChoiceChips, type ChoiceChipOption } from "@root/design-system";

const LABEL = "Contact channel";
const OPTIONS: readonly ChoiceChipOption[] = [
  { id: "phone", label: "Phone" },
  { id: "viber", label: "Viber" },
  { id: "telegram", label: "Telegram" },
];
const MIDDLE = OPTIONS[1].id;
const MODIFIERS = [
  { ctrlKey: true },
  { altKey: true },
  { metaKey: true },
  { shiftKey: true },
];

interface ChipsOverrides {
  value?: string;
  onChange?: (id: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const renderChips = (overrides: ChipsOverrides = {}): HTMLElement[] => {
  const { value = MIDDLE, onChange = vi.fn(), required, disabled } = overrides;

  render(
    <ChoiceChips
      label={LABEL}
      value={value}
      onChange={onChange}
      options={OPTIONS}
      required={required}
      disabled={disabled}
    />
  );

  return screen.getAllByRole("radio");
};

const press = (key: string, from: number, value = MIDDLE): string[][] => {
  const onChange = vi.fn();
  const chips = renderChips({ value, onChange });

  fireEvent.keyDown(chips[from], { key });

  return onChange.mock.calls;
};

describe("the chip group's radio semantics", () => {
  it("publishes one radio per option inside a group a screen reader finds by its caption", () => {
    const chips = renderChips();
    const group = screen.getByRole("radiogroup", { name: LABEL });

    expect(chips.length).toBe(OPTIONS.length);

    for (const chip of chips) {
      expect(group.contains(chip)).toBe(true);
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
    const chips = renderChips({ value: "carrier-pigeon" });

    expect(chips.map((chip) => chip.getAttribute("aria-checked"))).toEqual([
      "false",
      "false",
      "false",
    ]);
  });

  it("still hands the first chip the tab stop so the group stays keyboard-reachable", () => {
    expect(
      renderChips({ value: "carrier-pigeon" }).map((chip) => chip.tabIndex)
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
      fireEvent.keyDown(chips[1], { key: "ArrowRight", ...modifier });
    }

    expect(onChange).not.toHaveBeenCalled();
  });

  it("leaves Space to the native button click, which is why onChange never double-fires", () => {
    const onChange = vi.fn();
    const chips = renderChips({ onChange });

    fireEvent.keyDown(chips[0], { key: " " });

    expect(onChange).not.toHaveBeenCalled();
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

describe("the disabled group", () => {
  it("disables every chip natively rather than dimming a live control", () => {
    const chips = renderChips({ disabled: true });

    for (const chip of chips) {
      if (!(chip instanceof HTMLButtonElement)) {
        throw new Error("ChoiceChips rendered something other than a button");
      }

      expect(chip.disabled).toBe(true);
      expect(chip.classList.contains("disabled:opacity-55")).toBe(true);
    }
  });

  it("reports nothing when a chip is clicked", () => {
    const onChange = vi.fn();
    const chips = renderChips({ onChange, disabled: true });

    fireEvent.click(chips[0]);

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("the caption above the chips", () => {
  it("renders the label the consumer passed", () => {
    renderChips();

    expect(screen.getByText(LABEL).classList.contains("type-caption")).toBe(
      true
    );
  });

  it("carries no required mark by default", () => {
    renderChips();

    expect(screen.queryByText("*")).toBeNull();
  });

  it("appends a destructive asterisk when the field is required", () => {
    renderChips({ required: true });

    expect(screen.getByText("*").classList.contains("text-destructive")).toBe(
      true
    );
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
