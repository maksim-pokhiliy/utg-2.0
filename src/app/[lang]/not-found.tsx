"use client";

import { usePathname } from "next/navigation";

import { Button, Container, Typography } from "@root/design-system";
import { NavLink } from "@root/components/layout/NavLink";
import { resolveLocale } from "@root/utils/locale";

const messages = {
  uk: { title: "Сторінку не знайдено", home: "На головну" },
  en: { title: "Page not found", home: "Back home" },
};

export default function NotFound() {
  const pathname = usePathname();
  const message = messages[resolveLocale(pathname.split("/")[1])];

  return (
    <Container className="py-20 text-center">
      <Typography variant="hero" as="h1" className="mb-4">
        404
      </Typography>

      <Typography variant="body" className="mb-8">
        {message.title}
      </Typography>

      <Button asChild variant="outline">
        <NavLink href="/">{message.home}</NavLink>
      </Button>
    </Container>
  );
}
