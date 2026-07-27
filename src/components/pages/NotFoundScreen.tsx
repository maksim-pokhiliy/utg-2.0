"use client";

import {
  Button,
  Container,
  SectionBand,
  Typography,
} from "@root/design-system";
import { useDictionary } from "@root/i18n";

import { NavLink } from "@root/components/layout/NavLink";

const KICKER = "/ 404";

export default function NotFoundScreen() {
  const dictionary = useDictionary();

  return (
    <>
      <SectionBand kicker={KICKER} title={dictionary.not_found.title} />

      <section className="pt-8 pb-24">
        <Container>
          <div className="flex max-w-[560px] flex-col items-start gap-6">
            <Typography
              variant="body"
              as="p"
              className="text-pretty text-ink-soft"
            >
              {dictionary.not_found.body}
            </Typography>

            <Button asChild variant="outline">
              <NavLink href="/category">{dictionary.not_found.cta}</NavLink>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
