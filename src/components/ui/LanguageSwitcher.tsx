"use client";

import { useRouter, usePathname } from "next/navigation";

import { useLocale } from "@root/i18n";

const languages = [
  { code: "en", label: "EN" },
  { code: "uk", label: "UA" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const lang = event.target.value;
    const newPath = pathname.replace(`/${locale}`, `/${lang}`);

    router.push(newPath);
  };

  return (
    <select
      value={locale}
      onChange={handleLanguageChange}
      className="w-fit py-1 px-2 rounded bg-zinc-900 text-white text-xs"
    >
      {languages.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
