"use client";

import { useMemo, type ReactElement } from "react";

import { Typography, type ComboboxOption } from "@root/design-system";
import { useDictionary } from "@root/i18n";

import { CheckoutCourierFields } from "./CheckoutCourierFields";
import { CheckoutDirectoryField } from "./CheckoutDirectoryField";
import { CheckoutMethodChips } from "./CheckoutMethodChips";
import {
  WAREHOUSE_LABEL_KEYS,
  composeOptionId,
  isWarehouseMethod,
  type NpMethod,
} from "./delivery";
import type { CheckoutFieldName, CheckoutFormValues } from "./fields";
import type { NpDelivery } from "./useNpDelivery";
import type { CheckoutErrors } from "./validation";

const HINT_ID = "np-fallback-hint";

const HINT_CLASS = "max-w-[55ch] text-pretty text-ink-soft";

const HINT_SILENT_CLASS = "sr-only";

interface CheckoutNpDeliveryFieldsProps {
  delivery: NpDelivery;
  values: CheckoutFormValues;
  errors: CheckoutErrors;
  isPending: boolean;
  onValueChange: (name: CheckoutFieldName, value: string) => void;
}

const warehouseLabelKey = (method: NpMethod) =>
  method === "np_postomat"
    ? WAREHOUSE_LABEL_KEYS.np_postomat
    : WAREHOUSE_LABEL_KEYS.np_branch;

export function CheckoutNpDeliveryFields({
  delivery,
  values,
  errors,
  isPending,
  onValueChange,
}: CheckoutNpDeliveryFieldsProps): ReactElement {
  const dictionary = useDictionary();

  const cityOptions = useMemo<readonly ComboboxOption[]>(
    () =>
      delivery.city.options.map((settlement, index) => ({
        id: composeOptionId(index, settlement.ref),
        label: settlement.label,
        meta: settlement.region,
      })),
    [delivery.city.options]
  );

  const warehouseOptions = useMemo<readonly ComboboxOption[]>(
    () =>
      delivery.warehouse.options.map((warehouse, index) => ({
        id: composeOptionId(index, warehouse.number),
        label: warehouse.label,
      })),
    [delivery.warehouse.options]
  );

  const isWarehouseVisible = isWarehouseMethod(delivery.method);
  const isCityManual = delivery.city.source === "manual";
  const isWarehouseManual = delivery.warehouse.source === "manual";

  const hint = isCityManual
    ? dictionary.cart.np_fallback_hint
    : isWarehouseManual
      ? dictionary.cart.np_fallback_hint_warehouse
      : null;

  const emptyLabel = (isThrottled: boolean): string =>
    isThrottled ? dictionary.cart.np_throttled : dictionary.cart.np_empty;

  const clearWarehouseField = (): void => {
    onValueChange("np_warehouse", "");
  };

  const hasCityText = values.np_city.trim() !== "";
  const canQueryWarehouses = delivery.cityChoice !== null;
  const warehouseMode =
    isWarehouseManual || !canQueryWarehouses ? "manual" : "directory";

  return (
    <>
      <CheckoutMethodChips
        method={delivery.method}
        availability={delivery.availability}
        isPending={isPending}
        onMethodChange={(next) => {
          clearWarehouseField();
          delivery.selectMethod(next);
        }}
      />

      <Typography
        variant="small"
        as="p"
        id={HINT_ID}
        aria-live="polite"
        className={hint === null ? HINT_SILENT_CLASS : HINT_CLASS}
      >
        {hint}
      </Typography>

      <CheckoutDirectoryField
        name="np_city"
        label={dictionary.cart.city}
        placeholder={dictionary.cart.city_placeholder}
        value={values.np_city}
        source={delivery.city.source}
        options={cityOptions}
        emptyLabel={emptyLabel(delivery.city.isThrottled)}
        isLoading={delivery.city.isLoading}
        describedBy={hint === null ? undefined : HINT_ID}
        error={errors.np_city}
        disabled={isPending}
        onValueChange={(name, next) => {
          onValueChange(name, next);

          if (delivery.cityChoice !== null) {
            clearWarehouseField();
            delivery.clearCity();
          }
        }}
        onSearch={delivery.searchCity}
        onSelect={(option) => {
          const settlement = delivery.city.options.find(
            (row, index) => composeOptionId(index, row.ref) === option.id
          );

          onValueChange("np_city", option.label);
          clearWarehouseField();

          if (settlement !== undefined) {
            delivery.selectCity(settlement);
          }
        }}
      />

      {isWarehouseVisible ? (
        <CheckoutDirectoryField
          name="np_warehouse"
          label={
            warehouseMode === "manual"
              ? dictionary.cart.np_warehouse_fallback
              : dictionary.cart[warehouseLabelKey(delivery.method)]
          }
          placeholder={dictionary.cart.np_warehouse_placeholder}
          value={values.np_warehouse}
          source={warehouseMode}
          options={warehouseOptions}
          emptyLabel={emptyLabel(delivery.warehouse.isThrottled)}
          isLoading={delivery.warehouse.isLoading}
          describedBy={hint === null ? undefined : HINT_ID}
          error={errors.np_warehouse}
          disabled={isPending || !hasCityText}
          onValueChange={(name, next) => {
            onValueChange(name, next);
            delivery.clearWarehouse();
          }}
          onSearch={delivery.searchWarehouse}
          onSelect={(option) => {
            const warehouse = delivery.warehouse.options.find(
              (row, index) => composeOptionId(index, row.number) === option.id
            );

            onValueChange("np_warehouse", option.label);

            if (warehouse !== undefined) {
              delivery.selectWarehouse(warehouse);
            }
          }}
        />
      ) : (
        <CheckoutCourierFields
          values={values}
          errors={errors}
          isPending={isPending}
          onValueChange={onValueChange}
        />
      )}
    </>
  );
}
