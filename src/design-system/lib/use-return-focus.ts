"use client";

import { useCallback, useRef } from "react";

const ENCLOSING_LAYER = "[role='dialog']";

interface ReturnFocus {
  captureOpener: (event: Event) => void;
  restoreOpener: (event: Event) => void;
}

const firstConnected = (
  ...candidates: (HTMLElement | null)[]
): HTMLElement | null =>
  candidates.find((candidate) => candidate?.isConnected === true) ?? null;

export function useReturnFocus(): ReturnFocus {
  const openerRef = useRef<HTMLElement | null>(null);
  const enclosingRef = useRef<HTMLElement | null>(null);

  const captureOpener = useCallback((): void => {
    const { activeElement } = document;
    const opener = activeElement instanceof HTMLElement ? activeElement : null;

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
