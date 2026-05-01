export const ORDER_ID_PREFIX = "SS";

export const ORDER_STATUS_FLOW_DELIVERY = [
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
] as const;

export const ORDER_STATUS_FLOW_PICKUP = [
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "COLLECTED"
] as const;

export type Locale = "en" | "ar";
