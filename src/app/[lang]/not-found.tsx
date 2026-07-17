"use client";

import { usePathname } from "next/navigation";

import { NavLink } from "@root/components/layout/NavBar/NavLink";

const messages = {
  uk: { title: "Сторінку не знайдено", home: "На головну" },
  en: { title: "Page not found", home: "Back home" },
};

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] === "en" ? "en" : "uk";
  const message = messages[locale];

  return (
    <div className="mx-auto px-10 py-20 text-center">
      <h1 className="font-bold uppercase text-4xl md:text-6xl mb-4">404</h1>

      <p className="text-lg mb-8">{message.title}</p>

      <NavLink href="/" className="btn-main rounded-2xl inline-block">
        {message.home}
      </NavLink>
    </div>
  );
}
