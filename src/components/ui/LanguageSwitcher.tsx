"use client";

import { useRecoilState } from "recoil";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import { languageState } from "@root/recoil/atoms";

const languages = [
  { code: "en", label: "EN" },
  { code: "uk", label: "UA" },
];

export default function LanguageSwitcher() {
  const [language, setLanguage] = useRecoilState(languageState);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentLocale = pathname.split("/")[1];

    if (languages.some((lang) => lang.code === currentLocale)) {
      setLanguage(currentLocale);
    }
  }, [pathname, setLanguage]);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const lang = event.target.value;
    const newPath = pathname.replace(`/${language}`, `/${lang}`);

    setLanguage(lang);
    router.push(newPath);
  };

  return (
    <select
      value={language}
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
