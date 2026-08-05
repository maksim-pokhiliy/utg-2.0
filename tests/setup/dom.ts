import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

Element.prototype.scrollIntoView = function scrollIntoView(): void {};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  window.localStorage.clear();
});
