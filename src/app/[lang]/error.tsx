"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Button, Container, Typography } from "@root/design-system";
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
    <Container className="py-20 text-center">
      <Typography variant="hero" as="h1" className="mb-4">
        {message.title}
      </Typography>

      <Button variant="outline" onClick={reset}>
        {message.retry}
      </Button>
    </Container>
  );
}
