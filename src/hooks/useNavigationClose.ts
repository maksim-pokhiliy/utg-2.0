"use client";

import { useMemo, useRef } from "react";

interface NavigationClose {
  markOpened: () => void;
  markNavigating: () => void;
  suppressReturnFocus: (event: Event) => void;
}

export function useNavigationClose(): NavigationClose {
  const isNavigatingRef = useRef(false);

  return useMemo(
    () => ({
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
    }),
    []
  );
}
