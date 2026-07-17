"use client";

import { usePathname } from "next/navigation";

const messages = {
  uk: { title: "Щось пішло не так", retry: "Спробувати ще раз" },
  en: { title: "Something went wrong", retry: "Try again" },
};

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] === "en" ? "en" : "uk";
  const message = messages[locale];

  return (
    <div className="mx-auto px-10 py-20 text-center">
      <h1 className="font-bold uppercase text-4xl md:text-6xl mb-4">
        {message.title}
      </h1>

      <button
        type="button"
        onClick={reset}
        className="btn-main rounded-2xl inline-block"
      >
        {message.retry}
      </button>
    </div>
  );
}
