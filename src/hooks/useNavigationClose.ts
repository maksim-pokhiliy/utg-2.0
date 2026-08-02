"use client";

import { useRef, type MouseEvent } from "react";

interface NavigationClose {
  markOpened: () => void;
  markNavigating: () => void;
  suppressReturnFocus: (event: Event) => void;
}

export function willNavigateAway(
  event: MouseEvent<HTMLAnchorElement>,
  pathname: string
): boolean {
  const isPlainClick =
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

  return isPlainClick && event.currentTarget.pathname !== pathname;
}

export function useNavigationClose(): NavigationClose {
  const isNavigatingRef = useRef(false);
  const signalRef = useRef<NavigationClose | null>(null);

  if (signalRef.current === null) {
    signalRef.current = {
      markOpened: () => {
        isNavigatingRef.current = false;
      },
      markNavigating: () => {
        isNavigatingRef.current = true;
      },
      suppressReturnFocus: (event: Event) => {
        if (isNavigatingRef.current) {
          event.preventDefault();
        }
      },
    };
  }

  return signalRef.current;
}
