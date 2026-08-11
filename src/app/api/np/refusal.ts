export const CARRIER_REFUSED: unique symbol = Symbol("carrier refused");

export type CarrierRefused = typeof CARRIER_REFUSED;

export const isCarrierRefused = <T>(
  value: T | CarrierRefused
): value is CarrierRefused => value === CARRIER_REFUSED;
