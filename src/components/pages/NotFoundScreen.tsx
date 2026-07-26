"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  Button,
  Container,
  SectionBand,
  Typography,
} from "@root/design-system";
import { resolveLocale } from "@root/utils/locale";

const KICKER = "/ 404";

const messages = {
  uk: {
    title: "Сторінку не знайдено",
    body: "Такої сторінки немає. Можливо, товар знято з продажу.",
    cta: "До мерчу",
  },
  en: {
    title: "Page not found",
    body: "This page doesn't exist. The item may have been removed.",
    cta: "To merch",
  },
};

export default function NotFoundScreen() {
  const pathname = usePathname();
  const locale = resolveLocale(pathname.split("/")[1]);
  const message = messages[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <>
      <SectionBand kicker={KICKER} title={message.title} />

      <section className="pt-8 pb-24">
        <Container>
          <div className="flex max-w-[560px] flex-col items-start gap-6">
            <Typography
              variant="body"
              as="p"
              className="text-pretty text-ink-soft"
            >
              {message.body}
            </Typography>

            <Button asChild variant="outline">
              <Link href={`/${locale}/category`}>{message.cta}</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
