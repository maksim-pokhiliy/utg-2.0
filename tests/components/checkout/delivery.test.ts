import { describe, expect, it } from "vitest";

import {
  INITIAL_DELIVERY,
  NP_METHODS,
  composeDeliveryCity,
  deriveAvailability,
  isNpMethod,
  isWarehouseMethod,
  requiredDeliveryFields,
  resolveDeliverySource,
  type NpMethod,
  type SettlementChoice,
  type WarehouseChoice,
} from "@root/components/checkout/delivery";
import {
  FIELD_ORDER,
  INITIAL_FORM,
  type CheckoutFieldName,
} from "@root/components/checkout/fields";

const BRANCH_METHOD: NpMethod = "np_branch";
const POSTOMAT_METHOD: NpMethod = "np_postomat";
const COURIER_METHOD: NpMethod = "np_courier";

const ALL_METHODS: readonly NpMethod[] = [
  BRANCH_METHOD,
  POSTOMAT_METHOD,
  COURIER_METHOD,
];

const WAREHOUSE_METHODS: readonly NpMethod[] = [BRANCH_METHOD, POSTOMAT_METHOD];

const COURIER_ONLY: readonly NpMethod[] = [COURIER_METHOD];

const NON_METHOD_VALUES: readonly string[] = [
  "",
  " ",
  "branch",
  "postomat",
  "courier",
  "np_Branch",
  "NP_COURIER",
  "np_branch ",
  "generic",
  "np_courier_express",
];

const DIRECTORY_SOURCE = "np_directory";
const MANUAL_SOURCE = "manual";

const CITY_REF = "8d5a980d-391c-11dd-90d9-001a92567626";
const CITY_LABEL = "с. Київець";
const CITY_REGION = "Миколаївський р-н, Львівська обл.";
const CITY_PRESENT = "с. Київець, Миколаївський р-н, Львівська обл.";
const REGIONLESS_CITY_LABEL = "м. Київ";
const TYPED_CITY = "київець біля Львова";

const WAREHOUSE_NUMBER = "1";
const WAREHOUSE_LABEL = "Відділення №1: вул. Городоцька, 359";

const KYIV_WAREHOUSE_COUNT = 12_298;
const NO_WAREHOUSES = 0;
const UNKNOWN_WAREHOUSE_COUNT = null;

const NOTHING_CHOSEN = null;
const EMPTY_TEXT = "";

const BRANCH_REQUIRED_FIELDS: readonly CheckoutFieldName[] = [
  "np_city",
  "np_warehouse",
];

const COURIER_REQUIRED_FIELDS: readonly CheckoutFieldName[] = [
  "np_city",
  "street",
  "building",
];

interface AvailabilityCase {
  warehouseCount: number | null;
  isCourierAllowed: boolean;
  available: readonly NpMethod[];
  hasWarehouses: boolean;
  hasCourier: boolean;
}

const AVAILABILITY_TABLE: readonly AvailabilityCase[] = [
  {
    warehouseCount: KYIV_WAREHOUSE_COUNT,
    isCourierAllowed: true,
    available: ALL_METHODS,
    hasWarehouses: true,
    hasCourier: true,
  },
  {
    warehouseCount: KYIV_WAREHOUSE_COUNT,
    isCourierAllowed: false,
    available: WAREHOUSE_METHODS,
    hasWarehouses: true,
    hasCourier: false,
  },
  {
    warehouseCount: UNKNOWN_WAREHOUSE_COUNT,
    isCourierAllowed: true,
    available: ALL_METHODS,
    hasWarehouses: true,
    hasCourier: true,
  },
  {
    warehouseCount: UNKNOWN_WAREHOUSE_COUNT,
    isCourierAllowed: false,
    available: WAREHOUSE_METHODS,
    hasWarehouses: true,
    hasCourier: false,
  },
  {
    warehouseCount: NO_WAREHOUSES,
    isCourierAllowed: true,
    available: COURIER_ONLY,
    hasWarehouses: false,
    hasCourier: true,
  },
  {
    warehouseCount: NO_WAREHOUSES,
    isCourierAllowed: false,
    available: ALL_METHODS,
    hasWarehouses: true,
    hasCourier: true,
  },
];

const settlementChoice = (
  overrides: Partial<SettlementChoice> = {}
): SettlementChoice => ({
  ref: CITY_REF,
  label: CITY_LABEL,
  region: CITY_REGION,
  warehouseCount: KYIV_WAREHOUSE_COUNT,
  isCourierAllowed: true,
  ...overrides,
});

const warehouseChoice = (
  overrides: Partial<WarehouseChoice> = {}
): WarehouseChoice => ({
  number: WAREHOUSE_NUMBER,
  label: WAREHOUSE_LABEL,
  ...overrides,
});

describe("NP_METHODS", () => {
  it("pins the three Нова Пошта methods requirements.md §2 names, in the order the chips offer them", () => {
    expect([...NP_METHODS]).toEqual([...ALL_METHODS]);
  });
});

describe("isNpMethod", () => {
  it("accepts every wire value the method chips can produce", () => {
    for (const method of ALL_METHODS) {
      expect(isNpMethod(method), method).toBe(true);
    }
  });

  it("refuses anything the chips never offer, casing and padding included", () => {
    for (const value of NON_METHOD_VALUES) {
      expect(isNpMethod(value), value).toBe(false);
    }
  });
});

describe("isWarehouseMethod", () => {
  it("counts the branch and the postomat as warehouse methods", () => {
    for (const method of WAREHOUSE_METHODS) {
      expect(isWarehouseMethod(method), method).toBe(true);
    }
  });

  it("leaves the courier out, because it delivers to a street rather than to a point", () => {
    expect(isWarehouseMethod(COURIER_METHOD)).toBe(false);
  });
});

describe("INITIAL_DELIVERY", () => {
  it("opens the form on the branch method, the one most volunteer orders use", () => {
    expect(INITIAL_DELIVERY.method).toBe(BRANCH_METHOD);
  });

  it("starts both fields on the directory, so a working key is used before free text is offered", () => {
    expect(INITIAL_DELIVERY.citySource).toBe("directory");
    expect(INITIAL_DELIVERY.warehouseSource).toBe("directory");
  });

  it("starts with nothing typed and nothing chosen", () => {
    expect(INITIAL_DELIVERY.cityQuery).toBe(EMPTY_TEXT);
    expect(INITIAL_DELIVERY.warehouseQuery).toBe(EMPTY_TEXT);
    expect(INITIAL_DELIVERY.cityChoice).toBeNull();
    expect(INITIAL_DELIVERY.warehouseChoice).toBeNull();
  });
});

describe("deriveAvailability before the buyer has chosen a settlement", () => {
  it("offers all three methods, because nothing is known yet that could rule one out", () => {
    const availability = deriveAvailability(NOTHING_CHOSEN);

    expect([...availability.available]).toEqual([...ALL_METHODS]);
    expect(availability.hasWarehouses).toBe(true);
    expect(availability.hasCourier).toBe(true);
  });
});

describe("deriveAvailability against what the settlement reports", () => {
  it.each(AVAILABILITY_TABLE)(
    "offers $available.length of the three methods for a settlement reporting $warehouseCount warehouses and courier permission $isCourierAllowed",
    ({ warehouseCount, isCourierAllowed, available }) => {
      const availability = deriveAvailability(
        settlementChoice({ warehouseCount, isCourierAllowed })
      );

      expect([...availability.available]).toEqual([...available]);
    }
  );

  it.each(AVAILABILITY_TABLE)(
    "reports hasWarehouses $hasWarehouses and hasCourier $hasCourier for a settlement of $warehouseCount warehouses and courier permission $isCourierAllowed",
    ({ warehouseCount, isCourierAllowed, hasWarehouses, hasCourier }) => {
      const availability = deriveAvailability(
        settlementChoice({ warehouseCount, isCourierAllowed })
      );

      expect(availability.hasWarehouses).toBe(hasWarehouses);
      expect(availability.hasCourier).toBe(hasCourier);
    }
  );

  it("treats an unknown warehouse count as warehouses present, never as an empty village", () => {
    const availability = deriveAvailability(
      settlementChoice({ warehouseCount: UNKNOWN_WAREHOUSE_COUNT })
    );

    expect(availability.hasWarehouses).toBe(true);
    expect(availability.available).toContain(BRANCH_METHOD);
    expect(availability.available).toContain(POSTOMAT_METHOD);
  });

  it("drops the branch and the postomat for a settlement that reports no warehouses at all", () => {
    const availability = deriveAvailability(
      settlementChoice({ warehouseCount: NO_WAREHOUSES })
    );

    expect([...availability.available]).toEqual([...COURIER_ONLY]);
  });

  it("drops the courier where Нова Пошта does not deliver to the door", () => {
    const availability = deriveAvailability(
      settlementChoice({ isCourierAllowed: false })
    );

    expect([...availability.available]).toEqual([...WAREHOUSE_METHODS]);
  });

  it("never returns an empty set: a settlement with no warehouses and no courier falls open to all three methods rather than to a form the buyer cannot submit", () => {
    const availability = deriveAvailability(
      settlementChoice({
        warehouseCount: NO_WAREHOUSES,
        isCourierAllowed: false,
      })
    );

    expect(availability.available).not.toHaveLength(0);
    expect([...availability.available]).toEqual([...ALL_METHODS]);
    expect(availability.hasWarehouses).toBe(true);
    expect(availability.hasCourier).toBe(true);
  });

  it("leaves no reachable settlement shape without a selectable method", () => {
    for (const { warehouseCount, isCourierAllowed } of AVAILABILITY_TABLE) {
      const availability = deriveAvailability(
        settlementChoice({ warehouseCount, isCourierAllowed })
      );

      expect(
        availability.available.length,
        `${warehouseCount}`
      ).toBeGreaterThan(0);
    }
  });
});

describe("resolveDeliverySource for a warehouse method", () => {
  it("reports the directory when both the settlement and the warehouse were picked from it", () => {
    for (const method of WAREHOUSE_METHODS) {
      const source = resolveDeliverySource({
        method,
        cityChoice: settlementChoice(),
        warehouseChoice: warehouseChoice(),
      });

      expect(source, method).toBe(DIRECTORY_SOURCE);
    }
  });

  it("reports manual when the settlement came from the directory but the warehouse was typed by hand", () => {
    const source = resolveDeliverySource({
      method: BRANCH_METHOD,
      cityChoice: settlementChoice(),
      warehouseChoice: NOTHING_CHOSEN,
    });

    expect(source).toBe(MANUAL_SOURCE);
  });

  it("reports manual once the settlement itself was typed by hand, whatever the warehouse says", () => {
    const source = resolveDeliverySource({
      method: POSTOMAT_METHOD,
      cityChoice: NOTHING_CHOSEN,
      warehouseChoice: warehouseChoice(),
    });

    expect(source).toBe(MANUAL_SOURCE);
  });
});

describe("resolveDeliverySource for the courier", () => {
  it("reports the directory on a picked settlement, because the street is free text by design and cannot come from the directory", () => {
    const source = resolveDeliverySource({
      method: COURIER_METHOD,
      cityChoice: settlementChoice(),
      warehouseChoice: NOTHING_CHOSEN,
    });

    expect(source).toBe(DIRECTORY_SOURCE);
  });

  it("reports manual once the settlement was typed by hand", () => {
    const source = resolveDeliverySource({
      method: COURIER_METHOD,
      cityChoice: NOTHING_CHOSEN,
      warehouseChoice: NOTHING_CHOSEN,
    });

    expect(source).toBe(MANUAL_SOURCE);
  });
});

describe("composeDeliveryCity", () => {
  it("rejoins the region onto the label, so the operator keeps the raion that tells two same-named villages apart", () => {
    expect(composeDeliveryCity(settlementChoice(), EMPTY_TEXT)).toBe(
      CITY_PRESENT
    );
  });

  it("sends the bare label for a settlement the directory gave no region for", () => {
    const choice = settlementChoice({
      label: REGIONLESS_CITY_LABEL,
      region: undefined,
    });

    expect(composeDeliveryCity(choice, EMPTY_TEXT)).toBe(REGIONLESS_CITY_LABEL);
  });

  it("prefers the directory string over anything left in the text input", () => {
    expect(composeDeliveryCity(settlementChoice(), TYPED_CITY)).toBe(
      CITY_PRESENT
    );
  });

  it("sends the typed text verbatim when nothing was picked from the directory", () => {
    expect(composeDeliveryCity(NOTHING_CHOSEN, TYPED_CITY)).toBe(TYPED_CITY);
  });

  it("passes an empty city through instead of inventing one", () => {
    expect(composeDeliveryCity(NOTHING_CHOSEN, EMPTY_TEXT)).toBe(EMPTY_TEXT);
  });
});

describe("requiredDeliveryFields", () => {
  it("asks a warehouse method for the settlement and the warehouse", () => {
    for (const method of WAREHOUSE_METHODS) {
      expect([...requiredDeliveryFields(method)], method).toEqual([
        ...BRANCH_REQUIRED_FIELDS,
      ]);
    }
  });

  it("asks the courier for the settlement, the street and the building", () => {
    expect([...requiredDeliveryFields(COURIER_METHOD)]).toEqual([
      ...COURIER_REQUIRED_FIELDS,
    ]);
  });

  it("never demands the apartment, which §3 keeps optional everywhere", () => {
    for (const method of ALL_METHODS) {
      expect(requiredDeliveryFields(method), method).not.toContain("apartment");
    }
  });

  it("never demands a warehouse of the courier nor a street of a warehouse method", () => {
    expect(requiredDeliveryFields(COURIER_METHOD)).not.toContain(
      "np_warehouse"
    );
    expect(requiredDeliveryFields(BRANCH_METHOD)).not.toContain("street");
    expect(requiredDeliveryFields(BRANCH_METHOD)).not.toContain("building");
  });

  it("names only fields the form actually renders, so no method can require an unreachable input", () => {
    const formKeys = Object.keys(INITIAL_FORM);

    for (const method of ALL_METHODS) {
      for (const name of requiredDeliveryFields(method)) {
        expect(formKeys, name).toContain(name);
      }
    }
  });

  it("returns the fields in rendered order, so focus after a failed submit walks down the form", () => {
    for (const method of ALL_METHODS) {
      const positions = requiredDeliveryFields(method).map((name) =>
        FIELD_ORDER.indexOf(name)
      );

      expect(positions, method).toEqual([...positions].sort((a, b) => a - b));
    }
  });
});
