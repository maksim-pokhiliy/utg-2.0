import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CartDrawer from "@root/components/cart/CartDrawer";
import { Icon, IconButton } from "@root/design-system";
import { I18nProvider } from "@root/i18n";
import { composeCartLine, useCartStore } from "@root/store/cart";
import { useSidebarStore } from "@root/store/sidebar";

import { UAH_MONEY, UK_DICTIONARY } from "../../support/renderWithI18n";

const route = vi.hoisted(() => ({ pathname: "/uk" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

const CATALOG_PATH = "/uk";
const CHECKOUT_PATH = "/uk/checkout";
const CATEGORY_PATH = "/uk/category";
const OPENER_LABEL = "Cart";

const CART = UK_DICTIONARY.cart;
const CLOSE_LABEL = UK_DICTIONARY.shared.close;
const REMOVE_LABEL = `${CART.remove_confirm}: ${"«Waiting»"}`;

const PATCH = {
  slug: "waiting",
  title: "«Waiting»",
  size: null,
  price: 300,
  quantity: 1,
  image: "/images/products/patches_waiting.jpg",
  productUrl: "/uk/category/patches/waiting",
};

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

const fillCart = (): void => {
  useCartStore.setState({ items: [composeCartLine(PATCH)] });
};

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

const navigateTo = (
  pathname: string,
  rerender: (ui: ReactElement) => void
): void => {
  route.pathname = pathname;
  rerender(<Harness />);
};

const expectDrawerClosed = async (): Promise<void> => {
  await waitFor(() => {
    expect(screen.queryByRole("button", { name: CLOSE_LABEL })).toBeNull();
  });
};

const settleReturnFocus = async (): Promise<void> => {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
};

const expectFocusOffTheOpener = async (): Promise<void> => {
  await settleReturnFocus();

  expect(document.activeElement).toBe(document.body);
};

const expectFocusOnTheOpener = async (): Promise<void> => {
  await waitFor(() => {
    expect(document.activeElement).toBe(opener());
  });
};

beforeEach(() => {
  route.pathname = CATALOG_PATH;
  useSidebarStore.setState({ isOpen: false });
  useCartStore.setState({ items: [] });
});

afterEach(() => {
  useSidebarStore.setState({ isOpen: false });
  useCartStore.setState({ items: [] });
});

describe("the drawer's own links, which close and navigate in one click", () => {
  it("leaves focus off the cart button after the checkout call to action, before the route has even committed", async () => {
    fillCart();

    renderDrawer();
    await openDrawer();

    fireEvent.click(screen.getByRole("link", { name: CART.proceed }));

    await expectDrawerClosed();
    await expectFocusOffTheOpener();
  });

  it("leaves focus off the cart button after the empty-cart catalog link, before the route has even committed", async () => {
    renderDrawer();
    await openDrawer();

    fireEvent.click(screen.getByRole("link", { name: CART.here }));

    await expectDrawerClosed();
    await expectFocusOffTheOpener();
  });
});

describe("a drawer link that leads to the route already showing", () => {
  it("returns focus to the cart button, because the shopper went nowhere", async () => {
    route.pathname = CHECKOUT_PATH;
    fillCart();

    renderDrawer();
    await openDrawer();

    fireEvent.click(screen.getByRole("link", { name: CART.proceed }));

    await expectDrawerClosed();
    await expectFocusOnTheOpener();
  });

  it("returns focus to the cart button when the link is opened in a new tab", async () => {
    fillCart();

    renderDrawer();
    await openDrawer();

    fireEvent.click(screen.getByRole("link", { name: CART.proceed }), {
      metaKey: true,
    });

    await expectDrawerClosed();
    await expectFocusOnTheOpener();
  });
});

describe("the drawer closing because the route changed underneath it", () => {
  it("closes the drawer", async () => {
    const { rerender } = renderDrawer();
    await openDrawer();

    navigateTo(CHECKOUT_PATH, rerender);

    await expectDrawerClosed();
  });

  it("leaves focus off the cart button, because the shopper moved to another page", async () => {
    const { rerender } = renderDrawer();
    await openDrawer();

    navigateTo(CHECKOUT_PATH, rerender);

    await expectDrawerClosed();
    await expectFocusOffTheOpener();
  });

  it("still suppresses the restore when a second route change follows the first", async () => {
    const { rerender } = renderDrawer();
    await openDrawer();

    navigateTo(CHECKOUT_PATH, rerender);
    navigateTo(CATEGORY_PATH, rerender);

    await expectDrawerClosed();
    await expectFocusOffTheOpener();
  });
});

describe("the drawer closing by hand on the same route", () => {
  it("returns focus to the control that opened it", async () => {
    renderDrawer();
    await openDrawer();

    closeByHand();

    await expectDrawerClosed();
    await expectFocusOnTheOpener();
  });

  it("still returns focus after an earlier route change closed it, so the navigation flag never sticks", async () => {
    const { rerender } = renderDrawer();

    await openDrawer();
    navigateTo(CHECKOUT_PATH, rerender);
    await expectDrawerClosed();

    await openDrawer();
    closeByHand();

    await expectDrawerClosed();
    await expectFocusOnTheOpener();
  });

  it("still returns focus when a route change lands while the manual close is still animating out", async () => {
    const { rerender } = renderDrawer();
    await openDrawer();

    closeByHand();
    navigateTo(CHECKOUT_PATH, rerender);

    await expectDrawerClosed();
    await expectFocusOnTheOpener();
  });

  it("still returns focus after the checkout call to action closed it", async () => {
    fillCart();

    const { rerender } = renderDrawer();
    await openDrawer();

    fireEvent.click(screen.getByRole("link", { name: CART.proceed }));
    navigateTo(CHECKOUT_PATH, rerender);
    await expectDrawerClosed();

    await openDrawer();
    closeByHand();

    await expectDrawerClosed();
    await expectFocusOnTheOpener();
  });
});

describe("the remove-confirmation nested inside the drawer", () => {
  it("returns focus to the remove control when it is dismissed on the same route", async () => {
    fillCart();

    renderDrawer();
    await openDrawer();

    const remove = screen.getByRole("button", { name: REMOVE_LABEL });

    remove.focus();
    fireEvent.click(remove);

    fireEvent.click(
      await screen.findByRole("button", { name: CART.remove_cancel })
    );

    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: REMOVE_LABEL })
      );
    });
  });

  it("does not pull focus into the dying drawer when the route changes underneath it", async () => {
    fillCart();

    const { rerender } = renderDrawer();
    await openDrawer();

    const remove = screen.getByRole("button", { name: REMOVE_LABEL });

    remove.focus();
    fireEvent.click(remove);
    await screen.findByRole("button", { name: CART.remove_cancel });

    navigateTo(CHECKOUT_PATH, rerender);

    await expectDrawerClosed();
    await expectFocusOffTheOpener();

    expect(screen.queryByRole("button", { name: REMOVE_LABEL })).toBeNull();
  });
});
