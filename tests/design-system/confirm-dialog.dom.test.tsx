import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { ConfirmDialog, IconButton } from "@root/design-system";

const OPENER_LABEL = "Remove";
const CANCEL_LABEL = "Cancel";
const CONFIRM_LABEL = "Remove it";
const TITLE = "Remove the line";
const BODY = "This cannot be undone.";

interface HarnessProps {
  isSuppressed: boolean;
}

function Harness({ isSuppressed }: HarnessProps): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton aria-label={OPENER_LABEL} onClick={() => setOpen(true)}>
        <span>x</span>
      </IconButton>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title={TITLE}
        body={BODY}
        cancelLabel={CANCEL_LABEL}
        confirmLabel={CONFIRM_LABEL}
        onCloseAutoFocus={(event) => {
          if (isSuppressed) {
            event.preventDefault();
          }
        }}
      />
    </>
  );
}

const opener = (): HTMLElement =>
  screen.getByRole("button", { name: OPENER_LABEL });

const openAndCancel = async (isSuppressed: boolean): Promise<void> => {
  render(<Harness isSuppressed={isSuppressed} />);

  const button = opener();

  button.focus();
  fireEvent.click(button);

  fireEvent.click(await screen.findByRole("button", { name: CANCEL_LABEL }));

  await waitFor(() => {
    expect(screen.queryByRole("button", { name: CANCEL_LABEL })).toBeNull();
  });
};

describe("the confirm dialog's close-auto-focus slot", () => {
  it("returns focus to the opener when the consumer leaves the event alone", async () => {
    await openAndCancel(false);

    await waitFor(() => {
      expect(document.activeElement).toBe(opener());
    });
  });

  it("leaves focus alone when the consumer prevents the default, which is how a layer opts out while navigating", async () => {
    await openAndCancel(true);

    await waitFor(() => {
      expect(document.activeElement).toBe(document.body);
    });
  });
});
