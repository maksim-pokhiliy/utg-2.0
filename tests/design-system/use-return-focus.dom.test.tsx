import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "@root/design-system";

const TRACKED_EVENTS = ["pointerdown", "keydown"];

type ListenerSpy = ReturnType<typeof vi.spyOn>;

interface Listeners {
  add: ListenerSpy;
  remove: ListenerSpy;
}

const countTracked = (spy: ListenerSpy): number =>
  spy.mock.calls.filter(([type]) => TRACKED_EVENTS.includes(String(type)))
    .length;

const closedDialog = (): ReactElement => (
  <Dialog open={false} onClose={() => undefined} title="UTG">
    <p>Menu</p>
  </Dialog>
);

describe("the interaction listeners behind the design system's return-focus", () => {
  let listeners: Listeners;

  beforeEach(() => {
    listeners = {
      add: vi.spyOn(document, "addEventListener"),
      remove: vi.spyOn(document, "removeEventListener"),
    };
  });

  it("registers one pointerdown and one keydown listener for the first dialog", () => {
    render(closedDialog());

    expect(countTracked(listeners.add)).toBe(TRACKED_EVENTS.length);
  });

  it("registers nothing more for a second dialog", () => {
    const first = render(closedDialog());

    render(closedDialog());

    expect(countTracked(listeners.add)).toBe(TRACKED_EVENTS.length);

    first.unmount();
  });

  it("keeps the listeners attached while one dialog remains", () => {
    const first = render(closedDialog());
    const second = render(closedDialog());

    first.unmount();

    expect(countTracked(listeners.remove)).toBe(0);

    second.unmount();
  });

  it("detaches both listeners once the last dialog unmounts", () => {
    const first = render(closedDialog());
    const second = render(closedDialog());

    first.unmount();
    second.unmount();

    expect(countTracked(listeners.remove)).toBe(TRACKED_EVENTS.length);
  });

  it("re-registers after every dialog has gone so a later one still tracks interactions", () => {
    const first = render(closedDialog());

    first.unmount();

    const second = render(closedDialog());

    expect(countTracked(listeners.add)).toBe(TRACKED_EVENTS.length * 2);

    second.unmount();
  });
});
