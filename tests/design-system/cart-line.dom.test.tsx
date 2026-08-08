import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CartLine, type CartLineScale } from "@root/design-system";

const TITLE = "Waiting patch · L";
const REMOVE_LABEL = "Remove the line";
const QUANTITY_LABEL = "Quantity";
const INCREMENT_LABEL = `${QUANTITY_LABEL} +`;
const QUANTITY = 2;
const TOTAL = "1 200 ₴";
const MEDIA_TEXT = "photo";

const LINE_PROPS = {
  title: TITLE,
  media: <span>{MEDIA_TEXT}</span>,
  total: TOTAL,
  quantity: QUANTITY,
  onQuantityChange: () => {},
  onRemove: () => {},
  quantityLabel: QUANTITY_LABEL,
  removeLabel: REMOVE_LABEL,
};

const SCALES: readonly CartLineScale[] = ["drawer", "summary"];

type ScaledPart = "row" | "frame" | "content" | "titleRow" | "title" | "remove";

const SCALED_PARTS: readonly ScaledPart[] = [
  "row",
  "frame",
  "content",
  "titleRow",
  "title",
  "remove",
];

const ICON_BUTTON_CHROME = [
  "inline-flex",
  "items-center",
  "justify-center",
  "relative",
  "border-2",
  "border-transparent",
  "bg-transparent",
  "cursor-pointer",
  "active:translate-y-px",
  "text-ink",
  "hover:bg-muted",
];

const EXPECTED: Record<CartLineScale, Record<ScaledPart, readonly string[]>> = {
  drawer: {
    row: [
      "grid",
      "gap-3",
      "border-b",
      "border-line",
      "grid-cols-[64px_1fr]",
      "py-4",
    ],
    frame: [
      "relative",
      "border",
      "border-ink",
      "[&_img]:object-cover",
      "w-16",
      "min-h-16",
    ],
    content: [
      "flex",
      "min-w-0",
      "flex-col",
      "justify-between",
      "min-h-16",
      "gap-2",
    ],
    titleRow: ["flex", "items-start", "justify-between", "gap-3"],
    title: [
      "text-pretty",
      "font-body",
      "text-[0.9375rem]",
      "font-medium",
      "leading-[1.35]",
    ],
    remove: [
      ...ICON_BUTTON_CHROME,
      "shrink-0",
      "-mt-1",
      "-mr-1.5",
      "h-8",
      "w-8",
    ],
  },
  summary: {
    row: [
      "grid",
      "gap-3",
      "border-b",
      "border-line",
      "grid-cols-[56px_1fr]",
      "py-2.5",
    ],
    frame: [
      "relative",
      "border",
      "border-ink",
      "[&_img]:object-cover",
      "w-14",
      "min-h-14",
    ],
    content: [
      "flex",
      "min-w-0",
      "flex-col",
      "justify-between",
      "min-h-14",
      "gap-1.5",
    ],
    titleRow: ["flex", "items-start", "justify-between", "gap-2"],
    title: ["text-pretty", "type-small"],
    remove: [
      ...ICON_BUTTON_CHROME,
      "shrink-0",
      "-mt-0.5",
      "-mr-1",
      "h-7",
      "w-7",
    ],
  },
};

const EXPECTED_CONTROLS = [
  "flex",
  "flex-wrap",
  "items-center",
  "justify-between",
  "gap-x-2",
  "gap-y-2",
];

const EXPECTED_STEPPER = {
  step: [
    "inline-flex",
    "items-center",
    "justify-center",
    "p-0",
    "bg-transparent",
    "text-ink",
    "cursor-pointer",
    "hover:bg-muted",
    "disabled:text-line",
    "disabled:cursor-not-allowed",
    "disabled:bg-transparent",
    "min-h-10",
    "w-10",
  ],
  box: [
    "text-center",
    "border-x",
    "border-line",
    "type-price",
    "bg-transparent",
    "text-ink",
    "p-0",
    "w-9",
  ],
};

const FIXED_FRAME_HEIGHTS = ["h-16", "h-14"];

const LOCK_TREATMENT = ["opacity-35", "pointer-events-none"];

const STEPPER_CONTROLS = [
  "decrement control",
  "quantity box",
  "increment control",
];

const NEW_QUANTITY = "5";

interface CartLineParts {
  row: HTMLElement;
  frame: HTMLElement;
  content: HTMLElement;
  titleRow: HTMLElement;
  title: HTMLElement;
  remove: HTMLElement;
  controls: HTMLElement;
  stepper: HTMLElement;
  glyph: SVGElement;
}

interface CartLineOverrides {
  scale?: CartLineScale;
  className?: string;
  locked?: boolean;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
}

const childAt = (parent: Element, index: number, what: string): HTMLElement => {
  const node = parent.children[index];

  if (!(node instanceof HTMLElement)) {
    throw new Error(`CartLine rendered no ${what}`);
  }

  return node;
};

const renderLine = (overrides: CartLineOverrides = {}): CartLineParts => {
  const { container } = render(<CartLine {...LINE_PROPS} {...overrides} />);
  const row = container.firstElementChild;

  if (!(row instanceof HTMLElement)) {
    throw new Error("CartLine rendered no row");
  }

  const frame = childAt(row, 0, "media frame");
  const content = childAt(row, 1, "content column");
  const titleRow = childAt(content, 0, "title row");
  const controls = childAt(content, 1, "stepper row");
  const stepper = childAt(controls, 0, "quantity stepper");
  const title = childAt(titleRow, 0, "title span");
  const remove = childAt(titleRow, 1, "remove control");
  const glyph = remove.querySelector("svg");

  if (!(glyph instanceof SVGElement)) {
    throw new Error("CartLine rendered no trash glyph");
  }

  return {
    row,
    frame,
    content,
    titleRow,
    title,
    remove,
    controls,
    stepper,
    glyph,
  };
};

const stepperControls = (stepper: HTMLElement): HTMLElement[] =>
  STEPPER_CONTROLS.map((what, index) => childAt(stepper, index, what));

const quantityBox = (stepper: HTMLElement): HTMLInputElement => {
  const box = childAt(stepper, 1, "quantity box");

  if (!(box instanceof HTMLInputElement)) {
    throw new Error("CartLine rendered no quantity input");
  }

  return box;
};

const classesOf = (element: Element): string[] =>
  Array.from(element.classList).sort();

const exactly = (utilities: readonly string[]): string[] =>
  [...utilities].sort();

const present = (element: Element, utilities: readonly string[]): string[] =>
  utilities.filter((utility) => element.classList.contains(utility));

describe("CartLine with the scale prop omitted", () => {
  it("falls back to the drawer preset on every element the scale drives", () => {
    const implicit = renderLine();
    const explicit = renderLine({ scale: "drawer" });

    for (const part of SCALED_PARTS) {
      expect(implicit[part].className).toBe(explicit[part].className);
    }
  });

  it("lays the row out on the drawer's 64px media column", () => {
    expect(renderLine().row.classList.contains("grid-cols-[64px_1fr]")).toBe(
      true
    );
  });
});

describe("CartLine at the drawer scale", () => {
  it("renders the geometry the cart drawer ships today and not one class more", () => {
    const { row, frame, content } = renderLine({ scale: "drawer" });

    expect(classesOf(row)).toEqual(exactly(EXPECTED.drawer.row));
    expect(classesOf(frame)).toEqual(exactly(EXPECTED.drawer.frame));
    expect(classesOf(content)).toEqual(exactly(EXPECTED.drawer.content));
  });

  it("renders the drawer's typography and not one class more", () => {
    const { titleRow, title } = renderLine({ scale: "drawer" });

    expect(classesOf(titleRow)).toEqual(exactly(EXPECTED.drawer.titleRow));
    expect(classesOf(title)).toEqual(exactly(EXPECTED.drawer.title));
  });

  it("renders the drawer's remove box over the IconButton chrome and sizes its trash glyph at 20", () => {
    const { remove, glyph } = renderLine({ scale: "drawer" });

    expect(classesOf(remove)).toEqual(exactly(EXPECTED.drawer.remove));
    expect(glyph.getAttribute("width")).toBe("20");
    expect(glyph.getAttribute("height")).toBe("20");
  });
});

describe("CartLine at the summary scale", () => {
  it("shrinks the media column, the padding and the frame to the checkout summary's density", () => {
    const { row, frame, content } = renderLine({ scale: "summary" });

    expect(classesOf(row)).toEqual(exactly(EXPECTED.summary.row));
    expect(classesOf(frame)).toEqual(exactly(EXPECTED.summary.frame));
    expect(classesOf(content)).toEqual(exactly(EXPECTED.summary.content));
  });

  it("tightens the title row and drops the title onto the small type ramp", () => {
    const { titleRow, title } = renderLine({ scale: "summary" });

    expect(classesOf(titleRow)).toEqual(exactly(EXPECTED.summary.titleRow));
    expect(classesOf(title)).toEqual(exactly(EXPECTED.summary.title));
  });

  it("lets the type-small shorthand own family and weight instead of restating them", () => {
    const { title } = renderLine({ scale: "summary" });

    expect(title.classList.contains("type-small")).toBe(true);
    expect(title.classList.contains("font-body")).toBe(false);
    expect(title.classList.contains("font-medium")).toBe(false);
  });

  it("renders the summary's remove box over the IconButton chrome and sizes its trash glyph at 16", () => {
    const { remove, glyph } = renderLine({ scale: "summary" });

    expect(classesOf(remove)).toEqual(exactly(EXPECTED.summary.remove));
    expect(glyph.getAttribute("width")).toBe("16");
    expect(glyph.getAttribute("height")).toBe("16");
  });
});

describe("the media frame's fixed height, whose removal is the whole amendment", () => {
  it("pins no height at either scale, so the frame stretches to the line it sits in", () => {
    for (const scale of SCALES) {
      const { frame } = renderLine({ scale });

      expect(present(frame, FIXED_FRAME_HEIGHTS)).toEqual([]);
    }
  });

  it("keeps a floor under the frame instead, so an empty media slot still holds the column open", () => {
    const drawer = renderLine({ scale: "drawer" });
    const summary = renderLine({ scale: "summary" });

    expect(drawer.frame.classList.contains("min-h-16")).toBe(true);
    expect(summary.frame.classList.contains("min-h-14")).toBe(true);
  });
});

describe("the content column, which pins the stepper row to the frame's bottom edge", () => {
  it("pushes its two rows apart at either scale", () => {
    for (const scale of SCALES) {
      const { content } = renderLine({ scale });

      expect(content.classList.contains("justify-between")).toBe(true);
    }
  });
});

describe("the axes CartLine deliberately leaves off the scale prop", () => {
  it("dresses the stepper row in one class set at either scale", () => {
    for (const scale of SCALES) {
      const { controls } = renderLine({ scale });

      expect(classesOf(controls)).toEqual(exactly(EXPECTED_CONTROLS));
    }
  });

  it("orders the small stepper at either scale, which is the geometry the row is cut for", () => {
    for (const scale of SCALES) {
      const { stepper } = renderLine({ scale });

      expect(classesOf(childAt(stepper, 0, "decrement control"))).toEqual(
        exactly(EXPECTED_STEPPER.step)
      );
      expect(classesOf(childAt(stepper, 1, "quantity box"))).toEqual(
        exactly(EXPECTED_STEPPER.box)
      );
      expect(classesOf(childAt(stepper, 2, "increment control"))).toEqual(
        exactly(EXPECTED_STEPPER.step)
      );
    }
  });
});

describe("the accessible names the cart drawer and the e2e specs query by", () => {
  it("exposes the remove control and the quantity stepper at the drawer scale", () => {
    const { remove, controls } = renderLine({ scale: "drawer" });
    const stepper = screen.getByRole("spinbutton", { name: QUANTITY_LABEL });

    if (!(stepper instanceof HTMLInputElement)) {
      throw new Error(
        "the quantity stepper rendered something other than an input"
      );
    }

    expect(screen.getByRole("button", { name: REMOVE_LABEL })).toBe(remove);
    expect(controls.contains(stepper)).toBe(true);
    expect(stepper.value).toBe(String(QUANTITY));
  });

  it("exposes both of them at the summary scale, where the glyph and the box shrink", () => {
    const { remove, controls } = renderLine({ scale: "summary" });
    const stepper = screen.getByRole("spinbutton", { name: QUANTITY_LABEL });

    if (!(stepper instanceof HTMLInputElement)) {
      throw new Error(
        "the quantity stepper rendered something other than an input"
      );
    }

    expect(screen.getByRole("button", { name: REMOVE_LABEL })).toBe(remove);
    expect(controls.contains(stepper)).toBe(true);
    expect(stepper.value).toBe(String(QUANTITY));
  });
});

describe("the title the customer identifies the line by", () => {
  it("prints the title prop inside the title span at the drawer scale", () => {
    const { title } = renderLine({ scale: "drawer" });

    expect(title.textContent).toBe(TITLE);
    expect(screen.getByText(TITLE)).toBe(title);
  });

  it("prints it at the summary scale too, where the same line rides inside checkout", () => {
    const { title } = renderLine({ scale: "summary" });

    expect(title.textContent).toBe(TITLE);
  });
});

describe("the nodes the caller hands CartLine to place", () => {
  it("puts the media node inside the framed column rather than loose in the row", () => {
    const { frame } = renderLine({ scale: "drawer" });

    expect(frame.contains(screen.getByText(MEDIA_TEXT))).toBe(true);
  });

  it("puts the line total in the stepper row, opposite the quantity control", () => {
    const { controls } = renderLine({ scale: "drawer" });

    expect(controls.contains(screen.getByText(TOTAL))).toBe(true);
  });
});

describe("the quantity the stepper hands back, which the cart's totals ride on", () => {
  it("reports the incremented quantity to onQuantityChange when the customer steps up", () => {
    const onQuantityChange = vi.fn<(quantity: number) => void>();

    renderLine({ scale: "drawer", onQuantityChange });
    fireEvent.click(screen.getByRole("button", { name: INCREMENT_LABEL }));

    expect(onQuantityChange).toHaveBeenCalledTimes(1);
    expect(onQuantityChange).toHaveBeenCalledWith(QUANTITY + 1);
  });
});

describe("the remove control, the only way a line leaves the cart", () => {
  it("reports the press to onRemove exactly once at the drawer scale", () => {
    const onRemove = vi.fn<() => void>();

    renderLine({ scale: "drawer", onRemove });
    fireEvent.click(screen.getByRole("button", { name: REMOVE_LABEL }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("reports it at the summary scale too, where the box and the glyph shrink", () => {
    const onRemove = vi.fn<() => void>();

    renderLine({ scale: "summary", onRemove });
    fireEvent.click(screen.getByRole("button", { name: REMOVE_LABEL }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("the line lock the checkout summary raises while an order is in flight", () => {
  it("stamps no lock treatment when the prop is omitted, so the drawer's line is untouched", () => {
    const { remove, stepper } = renderLine();

    expect(remove.hasAttribute("aria-disabled")).toBe(false);
    expect(present(remove, LOCK_TREATMENT)).toEqual([]);

    for (const control of stepperControls(stepper)) {
      expect(control.hasAttribute("disabled")).toBe(false);
    }
  });

  it("marks the remove control aria-disabled rather than disabled, so a locked line never strands focus", () => {
    const { remove } = renderLine({ locked: true });

    expect(remove.getAttribute("aria-disabled")).toBe("true");
    expect(remove.hasAttribute("disabled")).toBe(false);
  });

  it("dims the remove control and lifts it out of the pointer flow while locked", () => {
    const { remove } = renderLine({ locked: true });

    expect(present(remove, LOCK_TREATMENT)).toEqual(LOCK_TREATMENT);
  });

  it("puts a real disabled on all three quantity controls while locked", () => {
    const { stepper } = renderLine({ locked: true });

    for (const control of stepperControls(stepper)) {
      expect(control.hasAttribute("disabled")).toBe(true);
    }
  });

  it("ignores a click on the remove control while locked, which is the only thing stopping a keyboard activation", () => {
    const onRemove = vi.fn<() => void>();

    renderLine({ locked: true, onRemove });
    fireEvent.click(screen.getByRole("button", { name: REMOVE_LABEL }));

    expect(onRemove).not.toHaveBeenCalled();
  });

  it("ignores a quantity change while locked, so a line cannot be repriced mid-submit", () => {
    const onQuantityChange = vi.fn<(quantity: number) => void>();
    const { stepper } = renderLine({ locked: true, onQuantityChange });

    fireEvent.change(quantityBox(stepper), {
      target: { value: NEW_QUANTITY },
    });
    fireEvent.click(screen.getByRole("button", { name: INCREMENT_LABEL }));

    expect(onQuantityChange).not.toHaveBeenCalled();
  });

  it("reports the removal and the quantity change as usual once the lock is down", () => {
    const onRemove = vi.fn<() => void>();
    const onQuantityChange = vi.fn<(quantity: number) => void>();
    const { stepper } = renderLine({
      locked: false,
      onRemove,
      onQuantityChange,
    });

    fireEvent.change(quantityBox(stepper), {
      target: { value: NEW_QUANTITY },
    });
    fireEvent.click(screen.getByRole("button", { name: REMOVE_LABEL }));

    expect(onQuantityChange).toHaveBeenCalledWith(Number(NEW_QUANTITY));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("keeps the title and the line total at full legibility, because only the controls dim", () => {
    const unlocked = renderLine({ scale: "summary" });
    const locked = renderLine({ scale: "summary", locked: true });
    const unlockedTotal = childAt(unlocked.controls, 1, "line total");
    const lockedTotal = childAt(locked.controls, 1, "line total");

    expect(locked.title.className).toBe(unlocked.title.className);
    expect(locked.title.textContent).toBe(TITLE);
    expect(lockedTotal.className).toBe(unlockedTotal.className);
    expect(lockedTotal.textContent).toBe(TOTAL);
  });
});

describe("the consumer className on the row", () => {
  it("merges alongside the preset's grid template rather than replacing it", () => {
    const { row } = renderLine({ className: "mt-6" });

    expect(row.classList.contains("mt-6")).toBe(true);
    expect(row.classList.contains("grid-cols-[64px_1fr]")).toBe(true);
  });
});

describe("the quantity guard on a line that locks while the buyer is typing in it", () => {
  const DRAFT_QUANTITY = "5";

  const renderLockable = (onQuantityChange: (quantity: number) => void) => {
    const view = render(
      <CartLine {...LINE_PROPS} onQuantityChange={onQuantityChange} />
    );

    return {
      ...view,
      lock: () =>
        view.rerender(
          <CartLine
            {...LINE_PROPS}
            onQuantityChange={onQuantityChange}
            locked
          />
        ),
    };
  };

  it("refuses the commit a blur fires after the lock landed, which is how a mid-flight order would still be mutated", () => {
    const onQuantityChange = vi.fn<(quantity: number) => void>();
    const { lock } = renderLockable(onQuantityChange);
    const input = screen.getByLabelText(QUANTITY_LABEL);

    fireEvent.change(input, { target: { value: DRAFT_QUANTITY } });

    expect(onQuantityChange).toHaveBeenCalledWith(Number(DRAFT_QUANTITY));

    lock();
    onQuantityChange.mockClear();

    fireEvent.blur(input);

    expect(onQuantityChange).not.toHaveBeenCalled();
  });

  it("still commits that blur when the line is not locked, so the guard is the lock and not the blur", () => {
    const onQuantityChange = vi.fn<(quantity: number) => void>();

    render(<CartLine {...LINE_PROPS} onQuantityChange={onQuantityChange} />);

    const input = screen.getByLabelText(QUANTITY_LABEL);

    fireEvent.change(input, { target: { value: DRAFT_QUANTITY } });
    onQuantityChange.mockClear();
    fireEvent.blur(input);

    expect(onQuantityChange).toHaveBeenCalledWith(Number(DRAFT_QUANTITY));
  });
});
