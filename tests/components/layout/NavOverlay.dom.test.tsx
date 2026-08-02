import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ pathname: "/uk" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

import { NavOverlay } from "@root/components/layout/NavOverlay";
import { I18nProvider } from "@root/i18n";

import { UAH_MONEY, UK_DICTIONARY } from "../../support/renderWithI18n";

const MENU_LABEL = "Menu";
const CLOSE_LABEL = "Close";
const REPORTS_LABEL = UK_DICTIONARY.shared.reports;
const HOME_PATH = "/uk";
const REPORTS_PATH = "/uk/reports";

beforeEach(() => {
  route.pathname = HOME_PATH;
});

const withI18n = ({ children }: { children: ReactNode }): ReactElement => (
  <I18nProvider locale="uk" dictionary={UK_DICTIONARY} money={UAH_MONEY}>
    {children}
  </I18nProvider>
);

const burger = (): HTMLElement =>
  screen.getByRole("button", { name: MENU_LABEL });

const openMenu = async (): Promise<void> => {
  const button = burger();

  button.focus();
  fireEvent.click(button);

  await screen.findByRole("button", { name: CLOSE_LABEL });
};

const reportsLink = (): HTMLElement =>
  screen.getByRole("link", {
    name: (accessibleName: string) => accessibleName.includes(REPORTS_LABEL),
  });

const expectMenuClosed = async (): Promise<void> => {
  await waitFor(() => {
    expect(screen.queryByRole("button", { name: CLOSE_LABEL })).toBeNull();
  });
};

describe("the mobile menu closing through one of its own links", () => {
  it("leaves focus off the burger, because the shopper moved to another page", async () => {
    render(<NavOverlay />, { wrapper: withI18n });
    await openMenu();

    fireEvent.click(reportsLink());

    await expectMenuClosed();
    await waitFor(() => {
      expect(document.activeElement).toBe(document.body);
    });
  });
});

describe("a menu link that leads to the page already showing", () => {
  it("returns focus to the burger, because the shopper went nowhere", async () => {
    route.pathname = REPORTS_PATH;

    render(<NavOverlay />, { wrapper: withI18n });
    await openMenu();

    fireEvent.click(reportsLink());

    await expectMenuClosed();
    await waitFor(() => {
      expect(document.activeElement).toBe(burger());
    });
  });

  it("returns focus to the burger when the link is opened in a new tab", async () => {
    render(<NavOverlay />, { wrapper: withI18n });
    await openMenu();

    fireEvent.click(reportsLink(), { metaKey: true });

    await expectMenuClosed();
    await waitFor(() => {
      expect(document.activeElement).toBe(burger());
    });
  });
});

describe("the mobile menu closing by hand", () => {
  it("returns focus to the burger that opened it", async () => {
    render(<NavOverlay />, { wrapper: withI18n });
    await openMenu();

    fireEvent.click(screen.getByRole("button", { name: CLOSE_LABEL }));

    await expectMenuClosed();
    await waitFor(() => {
      expect(document.activeElement).toBe(burger());
    });
  });

  it("still returns focus after an earlier link navigation closed it", async () => {
    render(<NavOverlay />, { wrapper: withI18n });

    await openMenu();
    fireEvent.click(reportsLink());
    await expectMenuClosed();

    await openMenu();
    fireEvent.click(screen.getByRole("button", { name: CLOSE_LABEL }));

    await expectMenuClosed();
    await waitFor(() => {
      expect(document.activeElement).toBe(burger());
    });
  });
});
