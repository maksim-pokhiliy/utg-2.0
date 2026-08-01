import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CartDrawer from "@root/components/cart/CartDrawer";
import { Icon, IconButton } from "@root/design-system";
import { I18nProvider } from "@root/i18n";
import { useSidebarStore } from "@root/store/sidebar";

import { UAH_MONEY, UK_DICTIONARY } from "../../support/renderWithI18n";

const route = vi.hoisted(() => ({ pathname: "/uk" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

const CATALOG_PATH = "/uk";
const CHECKOUT_PATH = "/uk/checkout";
const OPENER_LABEL = "Cart";
const CLOSE_LABEL = UK_DICTIONARY.shared.close;

function Harness(): ReactElement {
  const open = useSidebarStore((state) => state.open);

  return (
    <>
      <IconButton aria-label={OPENER_LABEL} onClick={open}>
        <Icon name="shopping-bag" />
      </IconButton>

      <CartDrawer />
    </>
  );
}

const withI18n = ({ children }: { children: ReactNode }): ReactElement => (
  <I18nProvider locale="uk" dictionary={UK_DICTIONARY} money={UAH_MONEY}>
    {children}
  </I18nProvider>
);

const renderDrawer = () => render(<Harness />, { wrapper: withI18n });

const opener = (): HTMLElement =>
  screen.getByRole("button", { name: OPENER_LABEL });

const openDrawer = async (): Promise<void> => {
  const button = opener();

  button.focus();
  fireEvent.click(button);

  await screen.findByRole("button", { name: CLOSE_LABEL });
};

const closeByHand = (): void => {
  fireEvent.click(screen.getByRole("button", { name: CLOSE_LABEL }));
};

const expectDrawerClosed = async (): Promise<void> => {
  await waitFor(() => {
    expect(screen.queryByRole("button", { name: CLOSE_LABEL })).toBeNull();
  });
};

beforeEach(() => {
  route.pathname = CATALOG_PATH;
  useSidebarStore.setState({ isOpen: false });
});

afterEach(() => {
  useSidebarStore.setState({ isOpen: false });
});

describe("CartDrawer closing because the route changed", () => {
  it("closes the drawer", async () => {
    const { rerender } = renderDrawer();
    await openDrawer();

    route.pathname = CHECKOUT_PATH;
    rerender(<Harness />);

    await expectDrawerClosed();
  });

  it("leaves focus off the opener, because the shopper moved to another page", async () => {
    const { rerender } = renderDrawer();
    await openDrawer();

    route.pathname = CHECKOUT_PATH;
    rerender(<Harness />);

    await expectDrawerClosed();
    await waitFor(() => {
      expect(document.activeElement).not.toBe(opener());
    });
  });
});

describe("CartDrawer closing on the same route", () => {
  it("returns focus to the control that opened it", async () => {
    renderDrawer();
    await openDrawer();

    closeByHand();

    await expectDrawerClosed();
    await waitFor(() => {
      expect(document.activeElement).toBe(opener());
    });
  });

  it("still returns focus after an earlier route change closed it, so the navigation flag never sticks", async () => {
    const { rerender } = renderDrawer();

    await openDrawer();

    route.pathname = CHECKOUT_PATH;
    rerender(<Harness />);
    await expectDrawerClosed();

    await openDrawer();
    closeByHand();

    await expectDrawerClosed();
    await waitFor(() => {
      expect(document.activeElement).toBe(opener());
    });
  });
});
