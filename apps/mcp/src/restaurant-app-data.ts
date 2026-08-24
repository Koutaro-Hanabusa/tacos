import type { RestaurantViewData, RestaurantViewStatus } from "../../../shared/restaurant-ui/types";
import { textValue } from "../../../shared/restaurant-ui/utils/restaurant";

export interface RestaurantAppViewState {
  status: RestaurantViewStatus;
  restaurants: RestaurantViewData[];
  selectedId?: number;
  errorMessage?: string;
}

export const initialRestaurantAppView: RestaurantAppViewState = {
  status: "loading",
  restaurants: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function restaurant(value: unknown): RestaurantViewData | null {
  if (!isRecord(value)) return null;

  const id = Number(value.id);
  const latitude = Number(value.latitude);
  const longitude = Number(value.longitude);
  const rawRate = value.rate === null || value.rate === undefined ? null : Number(value.rate);
  const rate =
    rawRate !== null && Number.isFinite(rawRate) && rawRate >= 0.5 && rawRate <= 5
      ? Math.round(rawRate * 2) / 2
      : null;
  if (!Number.isInteger(id) || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id,
    name: textValue(value.name),
    address: textValue(value.address),
    latitude,
    longitude,
    rate,
    memo: value.memo === null || value.memo === undefined ? null : textValue(value.memo),
    googleMapsUrl: textValue(value.googleMapsUrl),
    photoUrl: textValue(value.photoUrl),
  };
}

function resultPayload(result: unknown) {
  if (isRecord(result) && isRecord(result.structuredContent)) {
    return result.structuredContent;
  }

  if (!isRecord(result) || !Array.isArray(result.content)) {
    return { restaurants: [] };
  }

  const textContent = result.content.find(
    (item) => isRecord(item) && item.type === "text" && typeof item.text === "string",
  );
  if (!isRecord(textContent)) return { restaurants: [] };

  try {
    const parsed: unknown = JSON.parse(textContent.text as string);
    return Array.isArray(parsed) ? { restaurants: parsed } : parsed;
  } catch {
    return { restaurants: [] };
  }
}

export function normalizeRestaurantResult(result: unknown) {
  const payload = resultPayload(result);
  if (!isRecord(payload) || !Array.isArray(payload.restaurants)) return [];

  return payload.restaurants.flatMap((value) => {
    const normalized = restaurant(value);
    return normalized ? [normalized] : [];
  });
}

export function restaurantResultError(result: unknown) {
  if (!isRecord(result) || !Array.isArray(result.content)) {
    return "検索に失敗しました。";
  }

  const textContent = result.content.find(
    (item) => isRecord(item) && item.type === "text" && typeof item.text === "string",
  );
  return isRecord(textContent) ? textValue(textContent.text) : "検索に失敗しました。";
}
