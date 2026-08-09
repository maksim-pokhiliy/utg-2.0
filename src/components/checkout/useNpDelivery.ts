"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_NP_METHOD,
  deriveAvailability,
  isMethodAvailable,
  type DirectorySource,
  type MethodAvailability,
  type NpMethod,
  type SettlementChoice,
  type WarehouseChoice,
} from "./delivery";
import {
  fetchSettlements,
  fetchWarehouses,
  type DirectoryResult,
} from "./directoryClient";

const MIN_SETTLEMENT_QUERY_LENGTH = 2;

const WAREHOUSE_METHOD_PARAMS = {
  np_branch: "branch",
  np_postomat: "postomat",
} as const;

type WarehouseMethodParam =
  (typeof WAREHOUSE_METHOD_PARAMS)[keyof typeof WAREHOUSE_METHOD_PARAMS];

interface DirectoryChannel<T> {
  options: readonly T[];
  isLoading: boolean;
  source: DirectorySource;
}

export interface NpDelivery {
  method: NpMethod;
  availability: MethodAvailability;
  cityChoice: SettlementChoice | null;
  warehouseChoice: WarehouseChoice | null;
  city: DirectoryChannel<SettlementChoice>;
  warehouse: DirectoryChannel<WarehouseChoice>;
  selectMethod: (method: NpMethod) => void;
  searchCity: (query: string) => void;
  selectCity: (settlement: SettlementChoice) => void;
  clearCity: () => void;
  searchWarehouse: (query: string) => void;
  selectWarehouse: (warehouse: WarehouseChoice) => void;
  clearWarehouse: () => void;
}

const readWarehouseParam = (method: NpMethod): WarehouseMethodParam | null =>
  method === "np_branch" || method === "np_postomat"
    ? WAREHOUSE_METHOD_PARAMS[method]
    : null;

const startRequest = (
  abortRef: { current: AbortController | null },
  requestRef: { current: number }
): { controller: AbortController; requestId: number } => {
  abortRef.current?.abort();

  const controller = new AbortController();

  abortRef.current = controller;
  requestRef.current += 1;

  return { controller, requestId: requestRef.current };
};

export function useNpDelivery(): NpDelivery {
  const [method, setMethod] = useState<NpMethod>(DEFAULT_NP_METHOD);
  const [cityChoice, setCityChoice] = useState<SettlementChoice | null>(null);
  const [warehouseChoice, setWarehouseChoice] =
    useState<WarehouseChoice | null>(null);

  const [cityOptions, setCityOptions] = useState<readonly SettlementChoice[]>(
    []
  );
  const [warehouseOptions, setWarehouseOptions] = useState<
    readonly WarehouseChoice[]
  >([]);

  const [isCityLoading, setIsCityLoading] = useState(false);
  const [isWarehouseLoading, setIsWarehouseLoading] = useState(false);

  const [citySource, setCitySource] = useState<DirectorySource>("directory");
  const [warehouseSource, setWarehouseSource] =
    useState<DirectorySource>("directory");

  const cityAbortRef = useRef<AbortController | null>(null);
  const warehouseAbortRef = useRef<AbortController | null>(null);
  const cityRequestRef = useRef(0);
  const warehouseRequestRef = useRef(0);

  useEffect(
    () => () => {
      cityAbortRef.current?.abort();
      warehouseAbortRef.current?.abort();
    },
    []
  );

  const searchCity = useCallback(
    (query: string): void => {
      setIsCityLoading(true);

      if (query.trim().length < MIN_SETTLEMENT_QUERY_LENGTH) {
        setCityOptions([]);
        setIsCityLoading(false);

        return;
      }

      if (cityChoice !== null && query === cityChoice.label) {
        setCityOptions((previous) => [...previous]);
        setIsCityLoading(false);

        return;
      }

      const { controller, requestId } = startRequest(
        cityAbortRef,
        cityRequestRef
      );

      void fetchSettlements(query, controller.signal).then(
        (result: DirectoryResult<SettlementChoice>) => {
          if (
            requestId !== cityRequestRef.current ||
            result.kind === "aborted"
          ) {
            return;
          }

          if (result.kind === "down") {
            setCitySource("manual");
            setWarehouseSource("manual");
            setCityOptions([]);
            setIsCityLoading(false);

            return;
          }

          setCityOptions(result.kind === "ok" ? [...result.items] : []);
          setIsCityLoading(false);
        }
      );
    },
    [cityChoice]
  );

  const searchWarehouse = useCallback(
    (query: string): void => {
      setIsWarehouseLoading(true);

      const methodParam = readWarehouseParam(method);

      if (cityChoice === null || methodParam === null) {
        setWarehouseOptions([]);
        setIsWarehouseLoading(false);

        return;
      }

      if (warehouseChoice !== null && query === warehouseChoice.label) {
        setWarehouseOptions((previous) => [...previous]);
        setIsWarehouseLoading(false);

        return;
      }

      const { controller, requestId } = startRequest(
        warehouseAbortRef,
        warehouseRequestRef
      );

      void fetchWarehouses(
        cityChoice.ref,
        methodParam,
        query,
        controller.signal
      ).then((result: DirectoryResult<WarehouseChoice>) => {
        if (
          requestId !== warehouseRequestRef.current ||
          result.kind === "aborted"
        ) {
          return;
        }

        if (result.kind === "down") {
          setWarehouseSource("manual");
          setWarehouseOptions([]);
          setIsWarehouseLoading(false);

          return;
        }

        setWarehouseOptions(result.kind === "ok" ? [...result.items] : []);
        setIsWarehouseLoading(false);
      });
    },
    [cityChoice, method, warehouseChoice]
  );

  const resetWarehouse = useCallback((): void => {
    warehouseAbortRef.current?.abort();
    warehouseRequestRef.current += 1;
    setWarehouseChoice(null);
    setWarehouseOptions([]);
    setIsWarehouseLoading(false);
  }, []);

  const availability = useMemo(
    () => deriveAvailability(cityChoice),
    [cityChoice]
  );

  const selectMethod = useCallback(
    (next: NpMethod): void => {
      setMethod(next);
      resetWarehouse();
    },
    [resetWarehouse]
  );

  const selectCity = useCallback(
    (settlement: SettlementChoice): void => {
      setCityChoice(settlement);
      resetWarehouse();

      const nextAvailability = deriveAvailability(settlement);

      setMethod((current) =>
        isMethodAvailable(nextAvailability, current)
          ? current
          : nextAvailability.available[0]
      );
    },
    [resetWarehouse]
  );

  const clearCity = useCallback((): void => {
    if (cityChoice === null) {
      return;
    }

    setCityChoice(null);
    resetWarehouse();
  }, [cityChoice, resetWarehouse]);

  const clearWarehouse = useCallback((): void => {
    setWarehouseChoice((current) => (current === null ? current : null));
  }, []);

  return {
    method,
    availability,
    cityChoice,
    warehouseChoice,
    city: {
      options: cityOptions,
      isLoading: isCityLoading,
      source: citySource,
    },
    warehouse: {
      options: warehouseOptions,
      isLoading: isWarehouseLoading,
      source: warehouseSource,
    },
    selectMethod,
    searchCity,
    selectCity,
    clearCity,
    searchWarehouse,
    selectWarehouse: setWarehouseChoice,
    clearWarehouse,
  };
}
