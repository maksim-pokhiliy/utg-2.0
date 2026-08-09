import type { Dictionary } from "@root/i18n";

export const cartQuantityLabel = (
  dictionary: Dictionary,
  title: string
): string => `${dictionary.shared.quantity}: ${title}`;

export const cartRemoveLabel = (
  dictionary: Dictionary,
  title: string
): string => `${dictionary.cart.remove_confirm}: ${title}`;
