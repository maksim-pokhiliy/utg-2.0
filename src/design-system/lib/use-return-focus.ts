"use client";

import { useCallback, useRef } from "react";

const ENCLOSING_LAYER = "[role='dialog']";
const FOCUSABLE = "button, a[href], input, select, textarea, [tabindex]";

interface ReturnFocus {
  captureOpener: (event: Event) => void;
  restoreOpener: (event: Event) => void;
}

let lastInteraction: HTMLElement | null = null;

const trackInteraction = (event: Event): void => {
  lastInteraction = event.target instanceof HTMLElement ? event.target : null;
};

if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", trackInteraction, true);
  document.addEventListener("keydown", trackInteraction, true);
}

const firstConnected = (
  ...candidates: (HTMLElement | null)[]
): HTMLElement | null =>
  candidates.find((candidate) => candidate?.isConnected === true) ?? null;

const resolveOpener = (): HTMLElement | null => {
  const { activeElement } = document;

  if (activeElement instanceof HTMLElement && activeElement !== document.body) {
    return activeElement;
  }

  return lastInteraction?.closest<HTMLElement>(FOCUSABLE) ?? null;
};

export function useReturnFocus(): ReturnFocus {
  const openerRef = useRef<HTMLElement | null>(null);
  const enclosingRef = useRef<HTMLElement | null>(null);
  const pathnameRef = useRef<string | null>(null);

  const captureOpener = useCallback((): void => {
    const opener = resolveOpener();

    openerRef.current = opener;
    enclosingRef.current =
      opener?.closest<HTMLElement>(ENCLOSING_LAYER) ?? null;
    pathnameRef.current = window.location.pathname;
  }, []);

  const restoreOpener = useCallback((event: Event): void => {
    const target = firstConnected(openerRef.current, enclosingRef.current);
    const capturedPathname = pathnameRef.current;

    openerRef.current = null;
    enclosingRef.current = null;
    pathnameRef.current = null;

    if (event.defaultPrevented || target === null) {
      return;
    }

    if (capturedPathname !== window.location.pathname) {
      return;
    }

    event.preventDefault();
    target.focus({ preventScroll: true });
  }, []);

  return { captureOpener, restoreOpener };
}
