import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useNavigationClose } from "@root/hooks/useNavigationClose";

const closeEvent = (): Event => new Event("close", { cancelable: true });

const suppresses = (signal: ReturnType<typeof useNavigationClose>): boolean => {
  const event = closeEvent();

  signal.suppressReturnFocus(event);

  return event.defaultPrevented;
};

describe("the navigation-close signal", () => {
  it("lets a layer restore focus when no navigation was declared", () => {
    const { result } = renderHook(() => useNavigationClose());

    expect(suppresses(result.current)).toBe(false);
  });

  it("suppresses the restore once a navigation is declared", () => {
    const { result } = renderHook(() => useNavigationClose());

    result.current.markNavigating();

    expect(suppresses(result.current)).toBe(true);
  });

  it("stays suppressed across several close events, so a second route change cannot clear a pending one", () => {
    const { result } = renderHook(() => useNavigationClose());

    result.current.markNavigating();

    expect(suppresses(result.current)).toBe(true);
    expect(suppresses(result.current)).toBe(true);
  });

  it("clears the suppression when the layer opens again", () => {
    const { result } = renderHook(() => useNavigationClose());

    result.current.markNavigating();
    result.current.markOpened();

    expect(suppresses(result.current)).toBe(false);
  });

  it("keeps a stable identity across re-renders so an effect can depend on it", () => {
    const { result, rerender } = renderHook(() => useNavigationClose());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
