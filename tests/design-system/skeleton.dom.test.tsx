import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "@root/design-system";

const BASE_CLASSES = [
  "bg-muted",
  "pointer-events-none",
  "transition-opacity",
  "duration-300",
];
const PULSE_CLASS = "animate-[utg-pulse_1.4s_var(--ease)_infinite]";
const KEYFRAME_UTILITY = /^animate-\[/;
const CONSUMER_CLASS_NAME = "absolute inset-0";
const CONSUMER_CLASSES = ["absolute", "inset-0"];

interface SkeletonOverrides {
  settled?: boolean;
  className?: string;
}

const renderSkeleton = (overrides: SkeletonOverrides = {}): HTMLElement => {
  const { container } = render(<Skeleton {...overrides} />);
  const element = container.firstElementChild;

  if (!(element instanceof HTMLElement)) {
    throw new Error("Skeleton rendered no element");
  }

  return element;
};

const missing = (
  element: HTMLElement,
  utilities: readonly string[]
): string[] =>
  utilities.filter((utility) => !element.classList.contains(utility));

describe("Skeleton with the settled prop omitted", () => {
  it("stays fully opaque, because the placeholder is the thing the reader is looking at", () => {
    expect(renderSkeleton().classList.contains("opacity-100")).toBe(true);
  });

  it("runs the utg pulse at the ratified 1.4s cadence", () => {
    const element = renderSkeleton();

    expect(element.classList.contains(PULSE_CLASS)).toBe(true);
    expect(element.classList.contains("animate-none")).toBe(false);
  });
});

describe("Skeleton with settled true", () => {
  it("fades itself out rather than unmounting, which is what keeps the handover smooth", () => {
    const element = renderSkeleton({ settled: true });

    expect(element.classList.contains("opacity-0")).toBe(true);
    expect(element.classList.contains("animate-none")).toBe(true);
  });

  it("carries no keyframe utility at all, the unit-level proof that the pulse really stops", () => {
    const element = renderSkeleton({ settled: true });

    const keyframes = Array.from(element.classList).filter((utility) =>
      KEYFRAME_UTILITY.test(utility)
    );

    expect(keyframes).toEqual([]);
  });
});

describe("the axes Skeleton keeps in either state", () => {
  it("stays hidden from assistive technology whether it pulses or has settled", () => {
    expect(renderSkeleton().getAttribute("aria-hidden")).toBe("true");
    expect(renderSkeleton({ settled: true }).getAttribute("aria-hidden")).toBe(
      "true"
    );
  });

  it("keeps the muted fill, the pointer lock and the 300ms opacity transition", () => {
    expect(missing(renderSkeleton(), BASE_CLASSES)).toEqual([]);
    expect(missing(renderSkeleton({ settled: true }), BASE_CLASSES)).toEqual(
      []
    );
  });
});

describe("the consumer className, which is how the reports viewer positions the bar", () => {
  it("lands intact in either state", () => {
    const pulsing = renderSkeleton({ className: CONSUMER_CLASS_NAME });
    const settled = renderSkeleton({
      settled: true,
      className: CONSUMER_CLASS_NAME,
    });

    expect(missing(pulsing, CONSUMER_CLASSES)).toEqual([]);
    expect(missing(settled, CONSUMER_CLASSES)).toEqual([]);
  });

  it("wins the twMerge tie, so a consumer can still override the variant's own opacity", () => {
    const element = renderSkeleton({ settled: true, className: "opacity-100" });

    expect(element.classList.contains("opacity-100")).toBe(true);
    expect(element.classList.contains("opacity-0")).toBe(false);
  });
});
