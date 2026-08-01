"use client";

import { useCallback, useEffect, useRef } from "react";

const ENCLOSING_LAYER = "[role='dialog']";
const FOCUSABLE = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

interface ReturnFocus {
  captureOpener: (event: Event) => void;
  restoreOpener: (event: Event) => void;
}

let lastInteraction: HTMLElement | null = null;
let consumerCount = 0;

const trackInteraction = (event: Event): void => {
  lastInteraction = event.target instanceof HTMLElement ? event.target : null;
};

const retainInteractionTracking = (): (() => void) => {
  consumerCount += 1;

  if (consumerCount === 1) {
    document.addEventListener("pointerdown", trackInteraction, true);
    document.addEventListener("keydown", trackInteraction, true);
  }

  return () => {
    consumerCount -= 1;

    if (consumerCount === 0) {
      document.removeEventListener("pointerdown", trackInteraction, true);
      document.removeEventListener("keydown", trackInteraction, true);
      lastInteraction = null;
    }
  };
};

const firstConnected = (
  ...candidates: (HTMLElement | null)[]
): HTMLElement | null =>
  candidates.find((candidate) => candidate?.isConnected === true) ?? null;

const resolveOpener = (): HTMLElement | null => {
  const { activeElement } = document;
  const interaction = lastInteraction;

  lastInteraction = null;

  if (activeElement instanceof HTMLElement && activeElement !== document.body) {
    return activeElement;
  }

  return interaction?.closest<HTMLElement>(FOCUSABLE) ?? null;
};

export function useReturnFocus(): ReturnFocus {
  const openerRef = useRef<HTMLElement | null>(null);
  const enclosingRef = useRef<HTMLElement | null>(null);

  useEffect(retainInteractionTracking, []);

  const captureOpener = useCallback((): void => {
    const opener = resolveOpener();

    openerRef.current = opener;
    enclosingRef.current =
      opener?.closest<HTMLElement>(ENCLOSING_LAYER) ?? null;
  }, []);

  const restoreOpener = useCallback((event: Event): void => {
    const target = firstConnected(openerRef.current, enclosingRef.current);

    openerRef.current = null;
    enclosingRef.current = null;

    if (event.defaultPrevented || target === null) {
      return;
    }

    event.preventDefault();
    target.focus({ preventScroll: true });
  }, []);

  return { captureOpener, restoreOpener };
}
