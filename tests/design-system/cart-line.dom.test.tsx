import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CartLine, type CartLineScale } from "@root/design-system";

const TITLE = "Waiting patch · L";
const REMOVE_LABEL = "Remove the line";
const QUANTITY_LABEL = "Quantity";
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

const DRAWER_ROW = [
  "grid",
  "grid-cols-[64px_1fr]",
  "gap-3",
  "border-b",
  "border-line",
  "py-4",
];
const DRAWER_FRAME = ["relative", "border", "border-ink", "w-16", "min-h-16"];
const DRAWER_CONTENT = [
  "flex",
  "min-w-0",
  "flex-col",
  "justify-between",
  "min-h-16",
  "gap-2",
];
const DRAWER_TITLE_ROW = ["flex", "items-start", "justify-between", "gap-3"];
const DRAWER_TITLE = [
  "text-pretty",
  "font-body",
  "text-[0.9375rem]",
  "font-medium",
  "leading-[1.35]",
];
const DRAWER_REMOVE = ["-mt-1", "-mr-1.5", "h-8", "w-8", "shrink-0"];

const SUMMARY_ROW = [
  "grid",
  "grid-cols-[56px_1fr]",
  "gap-3",
  "border-b",
  "border-line",
  "py-2.5",
];
const SUMMARY_FRAME = ["relative", "border", "border-ink", "w-14", "min-h-14"];
const SUMMARY_CONTENT = [
  "flex",
  "min-w-0",
  "flex-col",
  "justify-between",
  "min-h-14",
  "gap-1.5",
];
const SUMMARY_TITLE_ROW = ["flex", "items-start", "justify-between", "gap-2"];
const SUMMARY_TITLE = ["text-pretty", "type-small"];
const SUMMARY_REMOVE = ["-mt-0.5", "-mr-1", "h-7", "w-7", "shrink-0"];

const SHARED_ROW = ["grid", "gap-3", "border-b", "border-line"];
const SHARED_FRAME = [
  "relative",
  "border",
  "border-ink",
  "[&_img]:object-cover",
];
const SHARED_CONTROLS = [
  "flex",
  "flex-wrap",
  "items-center",
  "justify-between",
  "gap-x-2",
  "gap-y-2",
];

const FIXED_FRAME_HEIGHTS = ["h-16", "h-14"];

type ScaledPart = "row" | "frame" | "content" | "titleRow" | "title" | "remove";

const SCALED_PARTS: readonly ScaledPart[] = [
  "row",
  "frame",
  "content",
  "titleRow",
  "title",
  "remove",
];

const DRAWER_ONLY: Record<ScaledPart, readonly string[]> = {
  row: ["grid-cols-[64px_1fr]", "py-4"],
  frame: ["w-16", "min-h-16"],
  content: ["min-h-16", "gap-2"],
  titleRow: ["gap-3"],
  title: ["font-body", "text-[0.9375rem]", "font-medium", "leading-[1.35]"],
  remove: ["-mt-1", "-mr-1.5", "h-8", "w-8"],
};

const SUMMARY_ONLY: Record<ScaledPart, readonly string[]> = {
  row: ["grid-cols-[56px_1fr]", "py-2.5"],
  frame: ["w-14", "min-h-14"],
  content: ["min-h-14", "gap-1.5"],
  titleRow: ["gap-2"],
  title: ["type-small"],
  remove: ["-mt-0.5", "-mr-1", "h-7", "w-7"],
};

interface CartLineParts {
  row: HTMLElement;
  frame: HTMLElement;
  content: HTMLElement;
  titleRow: HTMLElement;
  title: HTMLElement;
  remove: HTMLElement;
  controls: HTMLElement;
  glyph: SVGElement;
}

interface CartLineOverrides {
  scale?: CartLineScale;
  className?: string;
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
  const title = childAt(titleRow, 0, "title span");
  const remove = childAt(titleRow, 1, "remove control");
  const glyph = remove.querySelector("svg");

  if (!(glyph instanceof SVGElement)) {
    throw new Error("CartLine rendered no trash glyph");
  }

  return { row, frame, content, titleRow, title, remove, controls, glyph };
};

const missing = (element: Element, utilities: readonly string[]): string[] =>
  utilities.filter((utility) => !element.classList.contains(utility));

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
  it("renders the geometry the cart drawer ships today, class for class", () => {
    const { row, frame, content } = renderLine({ scale: "drawer" });

    expect(missing(row, DRAWER_ROW)).toEqual([]);
    expect(missing(frame, DRAWER_FRAME)).toEqual([]);
    expect(missing(content, DRAWER_CONTENT)).toEqual([]);
  });

  it("renders the drawer's typography, class for class", () => {
    const { titleRow, title } = renderLine({ scale: "drawer" });

    expect(missing(titleRow, DRAWER_TITLE_ROW)).toEqual([]);
    expect(missing(title, DRAWER_TITLE)).toEqual([]);
  });

  it("renders the drawer's remove box and sizes its trash glyph at 20", () => {
    const { remove, glyph } = renderLine({ scale: "drawer" });

    expect(missing(remove, DRAWER_REMOVE)).toEqual([]);
    expect(glyph.getAttribute("width")).toBe("20");
    expect(glyph.getAttribute("height")).toBe("20");
  });
});

describe("CartLine at the summary scale", () => {
  it("shrinks the media column, the padding and the frame to the checkout summary's density", () => {
    const { row, frame, content } = renderLine({ scale: "summary" });

    expect(missing(row, SUMMARY_ROW)).toEqual([]);
    expect(missing(frame, SUMMARY_FRAME)).toEqual([]);
    expect(missing(content, SUMMARY_CONTENT)).toEqual([]);
  });

  it("tightens the title row and drops the title onto the small type ramp", () => {
    const { titleRow, title } = renderLine({ scale: "summary" });

    expect(missing(titleRow, SUMMARY_TITLE_ROW)).toEqual([]);
    expect(missing(title, SUMMARY_TITLE)).toEqual([]);
  });

  it("lets the type-small shorthand own family and weight instead of restating them", () => {
    const { title } = renderLine({ scale: "summary" });

    expect(title.classList.contains("type-small")).toBe(true);
    expect(title.classList.contains("font-body")).toBe(false);
    expect(title.classList.contains("font-medium")).toBe(false);
  });

  it("renders the summary's remove box and sizes its trash glyph at 16", () => {
    const { remove, glyph } = renderLine({ scale: "summary" });

    expect(missing(remove, SUMMARY_REMOVE)).toEqual([]);
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

describe("the two presets, which must not bleed into each other", () => {
  it("keeps every summary-only utility off the drawer preset", () => {
    const parts = renderLine({ scale: "drawer" });

    for (const part of SCALED_PARTS) {
      expect(present(parts[part], SUMMARY_ONLY[part])).toEqual([]);
    }
  });

  it("keeps every drawer-only utility off the summary preset", () => {
    const parts = renderLine({ scale: "summary" });

    for (const part of SCALED_PARTS) {
      expect(present(parts[part], DRAWER_ONLY[part])).toEqual([]);
    }
  });
});

describe("the axes CartLine deliberately leaves off the scale prop", () => {
  it("keeps the row's gutter, rule and grid mode identical at either scale", () => {
    for (const scale of SCALES) {
      const { row } = renderLine({ scale });

      expect(missing(row, SHARED_ROW)).toEqual([]);
    }
  });

  it("keeps the framed media treatment and the stepper row identical at either scale", () => {
    for (const scale of SCALES) {
      const { frame, controls } = renderLine({ scale });

      expect(missing(frame, SHARED_FRAME)).toEqual([]);
      expect(missing(controls, SHARED_CONTROLS)).toEqual([]);
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

describe("the consumer className on the row", () => {
  it("merges alongside the preset's grid template rather than replacing it", () => {
    const { row } = renderLine({ className: "mt-6" });

    expect(row.classList.contains("mt-6")).toBe(true);
    expect(row.classList.contains("grid-cols-[64px_1fr]")).toBe(true);
  });
});
