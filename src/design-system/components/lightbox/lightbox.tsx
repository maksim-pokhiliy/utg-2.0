"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type TouchEvent,
} from "react";

import { useReturnFocus } from "../../lib/use-return-focus";
import { Icon } from "../icon/icon";
import { IconButton } from "../icon-button/icon-button";
import { Scrim } from "../scrim/scrim";
import { Typography } from "../typography/typography";

const SWIPE_THRESHOLD = 40;
const CONTROL_ICON_SIZE = 22;
const CONTROL_CLASS =
  "flex-none hover:bg-paper hover:text-ink focus-visible:outline-paper aria-disabled:opacity-35 aria-disabled:pointer-events-none";

interface SwipeOrigin {
  id: number;
  x: number;
  y: number;
}

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  index: string;
  caption?: string;
  media: ReactNode;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
}

export function Lightbox({
  open,
  onClose,
  ariaLabel,
  index,
  caption,
  media,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  prevLabel,
  nextLabel,
  closeLabel,
}: LightboxProps): ReactElement {
  const { captureOpener, restoreOpener } = useReturnFocus();
  const swipeRef = useRef<SwipeOrigin | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const handleOpenAutoFocus = (event: Event): void => {
    captureOpener(event);
    event.preventDefault();
    panelRef.current?.focus({ preventScroll: true });
  };

  const step = (delta: number): void => {
    if (delta < 0 && hasPrev) {
      onPrev();
    }

    if (delta > 0 && hasNext) {
      onNext();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const isModified =
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

    if (isModified || event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowLeft") {
      step(-1);
    }

    if (event.key === "ArrowRight") {
      step(1);
    }
  };

  const preventMediaDrag = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>): void => {
    const touch = event.touches[0];

    swipeRef.current =
      event.touches.length === 1 && touch !== undefined
        ? { id: touch.identifier, x: touch.clientX, y: touch.clientY }
        : null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>): void => {
    const origin = swipeRef.current;

    swipeRef.current = null;

    if (origin === null) {
      return;
    }

    const touch = Array.from(event.changedTouches).find(
      (candidate) => candidate.identifier === origin.id
    );

    if (touch === undefined) {
      return;
    }

    const distanceX = touch.clientX - origin.x;
    const distanceY = touch.clientY - origin.y;
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal && Math.abs(distanceX) >= SWIPE_THRESHOLD) {
      step(distanceX < 0 ? 1 : -1);
    }
  };

  const handleTouchCancel = (): void => {
    swipeRef.current = null;
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <Scrim />

        <DialogPrimitive.Content
          ref={panelRef}
          className="fixed left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 flex flex-col w-[min(92vw,880px)] max-h-[92vh] border-2 border-ink bg-paper focus:outline-none data-[state=open]:animate-[utg-fade-in_120ms_var(--ease)] data-[state=closed]:animate-[utg-fade-out_120ms_var(--ease)]"
          aria-label={ariaLabel}
          aria-labelledby={undefined}
          aria-describedby={undefined}
          onOpenAutoFocus={handleOpenAutoFocus}
          onCloseAutoFocus={restoreOpener}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-2 min-h-14 bg-band py-1.5 pr-1.5 pl-4 text-band-foreground">
            <DialogPrimitive.Title asChild>
              <Typography
                variant="caption"
                as="span"
                aria-live="polite"
                className="flex grow items-baseline gap-3 min-w-0"
              >
                <span className="flex-none text-band-muted">{index}</span>
                {caption ? (
                  <span className="text-pretty">{caption}</span>
                ) : null}
              </Typography>
            </DialogPrimitive.Title>

            <IconButton
              variant="band"
              aria-label={prevLabel}
              aria-disabled={!hasPrev}
              onClick={() => step(-1)}
              className={CONTROL_CLASS}
            >
              <Icon name="chevron-left" size={CONTROL_ICON_SIZE} />
            </IconButton>

            <IconButton
              variant="band"
              aria-label={nextLabel}
              aria-disabled={!hasNext}
              onClick={() => step(1)}
              className={CONTROL_CLASS}
            >
              <Icon name="chevron-right" size={CONTROL_ICON_SIZE} />
            </IconButton>

            <DialogPrimitive.Close asChild>
              <IconButton
                variant="band"
                aria-label={closeLabel}
                className={CONTROL_CLASS}
              >
                <Icon name="x" size={CONTROL_ICON_SIZE} />
              </IconButton>
            </DialogPrimitive.Close>
          </div>

          <div
            onMouseDown={preventMediaDrag}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            className="min-h-0 overflow-hidden bg-white [&_img]:w-full [&_img]:h-auto [&_img]:max-h-[calc(92vh-60px)] [&_img]:object-contain"
          >
            {media}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
