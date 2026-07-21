"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ReactElement } from "react";

import { TextTab } from "@root/design-system";
import { useLocale } from "@root/i18n";

const LOCALES = ["uk", "en"] as const;

export default function LanguageSwitcher(): ReactElement {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (lang: (typeof LOCALES)[number]) => {
    if (lang === locale) {
      return;
    }

    const prefix = `/${locale}`;
    router.push(`/${lang}${pathname.slice(prefix.length)}`);
  };

  return (
    <nav aria-label="Language" className="flex items-center gap-1">
      {LOCALES.map((code) => (
        <TextTab
          key={code}
          active={code === locale}
          onClick={() => switchTo(code)}
        >
          {code.toUpperCase()}
        </TextTab>
      ))}
    </nav>
  );
}
