import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon, IconButton } from "@root/design-system";

const LABEL = "Next photo";
const INERT_CLASSES = ["opacity-35", "pointer-events-none"];

const renderButton = (inert?: boolean): HTMLElement => {
  render(
    <IconButton aria-label={LABEL} inert={inert}>
      <Icon name="chevron-right" />
    </IconButton>
  );

  return screen.getByRole("button", { name: LABEL });
};

describe("IconButton without the inert prop", () => {
  it("renders no aria-disabled attribute so the other consumers keep byte-identical markup", () => {
    expect(renderButton().hasAttribute("aria-disabled")).toBe(false);
  });

  it("carries neither inert utility", () => {
    const button = renderButton();

    for (const utility of INERT_CLASSES) {
      expect(button.classList.contains(utility)).toBe(false);
    }
  });
});

describe("IconButton with inert false", () => {
  it("renders aria-disabled false because the lightbox chevrons published that attribute before the prop existed", () => {
    expect(renderButton(false).getAttribute("aria-disabled")).toBe("false");
  });

  it("carries neither inert utility", () => {
    const button = renderButton(false);

    for (const utility of INERT_CLASSES) {
      expect(button.classList.contains(utility)).toBe(false);
    }
  });
});

describe("IconButton with inert true", () => {
  it("renders aria-disabled true", () => {
    expect(renderButton(true).getAttribute("aria-disabled")).toBe("true");
  });

  it("dims the control and swallows its pointer events", () => {
    const button = renderButton(true);

    for (const utility of INERT_CLASSES) {
      expect(button.classList.contains(utility)).toBe(true);
    }
  });
});

describe("IconButton as the sole owner of aria-disabled", () => {
  it("ignores a raw aria-disabled attribute, which jsx cannot type-check away because of the hyphen", () => {
    render(
      <IconButton aria-label={LABEL} aria-disabled={true}>
        <Icon name="chevron-right" />
      </IconButton>
    );

    const button = screen.getByRole("button", { name: LABEL });

    expect(button.hasAttribute("aria-disabled")).toBe(false);

    for (const utility of INERT_CLASSES) {
      expect(button.classList.contains(utility)).toBe(false);
    }
  });
});

describe("the ratified law that a focused control is never really disabled", () => {
  it("never forwards the prop to the dom inert attribute, which would strand focus inside the radix trap", () => {
    expect(renderButton(true).hasAttribute("inert")).toBe(false);
  });

  it("leaves the button focusable and enabled so the radix focus trap keeps it", () => {
    const button = renderButton(true);

    if (!(button instanceof HTMLButtonElement)) {
      throw new Error("IconButton rendered something other than a button");
    }

    expect(button.disabled).toBe(false);

    button.focus();

    expect(document.activeElement).toBe(button);
  });
});
