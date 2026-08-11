import type { Dictionary } from "@root/i18n";

import type { CheckoutFieldName } from "./fields";

export const NP_METHODS = ["np_branch", "np_postomat", "np_courier"] as const;

export type NpMethod = (typeof NP_METHODS)[number];

export type DeliverySource = "np_directory" | "manual";

export type DirectorySource = "directory" | "manual";

export const DEFAULT_NP_METHOD: NpMethod = "np_branch";

export const METHOD_LABEL_KEYS = {
  np_branch: "method_branch",
  np_postomat: "method_postomat",
  np_courier: "method_courier",
} as const satisfies Record<NpMethod, keyof Dictionary["cart"]>;

export const WAREHOUSE_LABEL_KEYS = {
  np_branch: "np_branch",
  np_postomat: "np_postomat",
} as const;

export interface SettlementChoice {
  ref: string;
  label: string;
  region?: string;
  warehouseCount: number | null;
  isCourierAllowed: boolean;
}

export interface WarehouseChoice {
  number: string;
  label: string;
}

export interface MethodAvailability {
  available: readonly NpMethod[];
  hasWarehouses: boolean;
  hasCourier: boolean;
}

export interface DeliveryValues {
  method: NpMethod;
  citySource: DirectorySource;
  warehouseSource: DirectorySource;
  cityQuery: string;
  warehouseQuery: string;
  cityChoice: SettlementChoice | null;
  warehouseChoice: WarehouseChoice | null;
}

export const INITIAL_DELIVERY: DeliveryValues = {
  method: DEFAULT_NP_METHOD,
  citySource: "directory",
  warehouseSource: "directory",
  cityQuery: "",
  warehouseQuery: "",
  cityChoice: null,
  warehouseChoice: null,
};

const WAREHOUSE_METHODS: readonly NpMethod[] = ["np_branch", "np_postomat"];

const REGION_SEPARATOR = ", ";

const OPTION_ID_SEPARATOR = "::";

export const composeOptionId = (index: number, ref: string): string =>
  `${index}${OPTION_ID_SEPARATOR}${ref}`;

export const isNpMethod = (value: string): value is NpMethod =>
  NP_METHODS.some((method) => method === value);

export const isWarehouseMethod = (method: NpMethod): boolean =>
  WAREHOUSE_METHODS.includes(method);

const UNCONSTRAINED_AVAILABILITY: MethodAvailability = {
  available: NP_METHODS,
  hasWarehouses: true,
  hasCourier: true,
};

export const deriveAvailability = (
  settlement: SettlementChoice | null
): MethodAvailability => {
  if (settlement === null) {
    return UNCONSTRAINED_AVAILABILITY;
  }

  const hasWarehouses = settlement.warehouseCount !== 0;
  const hasCourier = settlement.isCourierAllowed;
  const available = NP_METHODS.filter((method) =>
    isWarehouseMethod(method) ? hasWarehouses : hasCourier
  );

  return available.length === 0
    ? UNCONSTRAINED_AVAILABILITY
    : { available, hasWarehouses, hasCourier };
};

export const isMethodAvailable = (
  availability: MethodAvailability,
  method: NpMethod
): boolean => availability.available.includes(method);

export const requiredDeliveryFields = (
  method: NpMethod
): readonly CheckoutFieldName[] =>
  isWarehouseMethod(method)
    ? ["np_city", "np_warehouse"]
    : ["np_city", "street", "building"];

export const composeDeliveryCity = (
  choice: SettlementChoice | null,
  typed: string
): string => {
  if (choice === null) {
    return typed;
  }

  return choice.region === undefined
    ? choice.label
    : `${choice.label}${REGION_SEPARATOR}${choice.region}`;
};

interface DeliverySourceInput {
  method: NpMethod;
  cityChoice: SettlementChoice | null;
  warehouseChoice: WarehouseChoice | null;
}

export const resolveDeliverySource = ({
  method,
  cityChoice,
  warehouseChoice,
}: DeliverySourceInput): DeliverySource => {
  if (cityChoice === null) {
    return "manual";
  }

  if (!isWarehouseMethod(method)) {
    return "np_directory";
  }

  return warehouseChoice === null ? "manual" : "np_directory";
};
