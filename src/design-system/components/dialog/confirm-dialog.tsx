"use client";

import type { ReactElement } from "react";

import { Button } from "../button/button";
import { Typography } from "../typography/typography";
import { Dialog } from "./dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  destructive?: boolean;
  onCloseAutoFocus?: (event: Event) => void;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  cancelLabel,
  confirmLabel,
  destructive = false,
  onCloseAutoFocus,
}: ConfirmDialogProps): ReactElement {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      onCloseAutoFocus={onCloseAutoFocus}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>

          <Button
            variant={destructive ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Typography variant="body">{body}</Typography>
    </Dialog>
  );
}
