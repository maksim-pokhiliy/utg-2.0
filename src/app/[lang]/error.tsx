"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Button, Container, SectionBand } from "@root/design-system";
import { resolveLocale } from "@root/utils/locale";

const messages = {
  uk: { title: "Щось пішло не так", retry: "Спробувати ще раз" },
  en: { title: "Something went wrong", retry: "Try again" },
};

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const pathname = usePathname();
  const message = messages[resolveLocale(pathname.split("/")[1])];

  return (
    <>
      <SectionBand title={message.title} />

      <section className="pt-8 pb-24">
        <Container>
          <div className="flex max-w-[560px] flex-col items-start gap-6">
            <Button variant="outline" onClick={reset}>
              {message.retry}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
