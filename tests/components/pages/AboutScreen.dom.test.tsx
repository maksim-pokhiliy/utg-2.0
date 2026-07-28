import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AboutScreen from "@root/components/pages/AboutScreen";
import type { Dictionary } from "@root/i18n";

import { renderWithI18n, UK_DICTIONARY } from "../../support/renderWithI18n";

const REPORTS_LINK_TOKEN = "{link}";
const REPORTS_HREF = "/uk/reports";
const TOKEN_FREE_PROCEEDS = "All proceeds reach the unit. No placeholder here.";

const ABOUT = UK_DICTIONARY.about;

const [PROCEEDS_PREFIX, PROCEEDS_SUFFIX] =
  ABOUT.all_proceeds.split(REPORTS_LINK_TOKEN);

const TOKEN_FREE_DICTIONARY: Dictionary = {
  ...UK_DICTIONARY,
  about: { ...ABOUT, all_proceeds: TOKEN_FREE_PROCEEDS },
};

describe("AboutScreen and the splitAtToken helper module-private to src/components/pages/AboutScreen.tsx (not src/utils/seo.ts)", () => {
  it("surrounds the reports label with the copy preceding and following the token when the dictionary carries {link}", () => {
    renderWithI18n(<AboutScreen />);

    const link = screen.getByRole("link", { name: ABOUT.reports_link });

    expect(link.closest("p")?.textContent).toBe(
      `${PROCEEDS_PREFIX}${ABOUT.reports_link}${PROCEEDS_SUFFIX}`
    );
  });

  it("points the reports anchor at the locale-prefixed reports path when the dictionary carries {link}", () => {
    renderWithI18n(<AboutScreen />);

    const link = screen.getByRole("link", { name: ABOUT.reports_link });

    expect(link.getAttribute("href")).toBe(REPORTS_HREF);
  });

  it("renders the proceeds copy verbatim when the dictionary carries no {link} token", () => {
    renderWithI18n(<AboutScreen />, { dictionary: TOKEN_FREE_DICTIONARY });

    expect(screen.getByText(TOKEN_FREE_PROCEEDS).textContent).toBe(
      TOKEN_FREE_PROCEEDS
    );
  });

  it("renders no reports link when the dictionary carries no {link} token", () => {
    renderWithI18n(<AboutScreen />, { dictionary: TOKEN_FREE_DICTIONARY });

    expect(screen.queryByRole("link", { name: ABOUT.reports_link })).toBeNull();
  });
});
