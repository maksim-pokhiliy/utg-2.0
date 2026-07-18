"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ChangeEvent, ReactElement } from "react";

import { Select } from "@root/design-system";
import { useLocale } from "@root/i18n";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "uk", label: "UA" },
];

export default function LanguageSwitcher(): ReactElement {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const lang = event.target.value;

    router.push(pathname.replace(`/${locale}`, `/${lang}`));
  };

  return (
    <Select
      value={locale}
      onChange={handleLanguageChange}
      aria-label="Language"
      wrapperClassName="inline-block"
      className="w-auto min-h-10 pr-9"
    >
      {LANGUAGES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </Select>
  );
}
