import { z } from "zod";

const ADDRESS_SEARCH_ENDPOINT = "https://msearch.gsi.go.jp/address-search/AddressSearch";

const addressSearchResponse = z.array(
  z.object({
    geometry: z.object({
      coordinates: z.tuple([z.number(), z.number()]),
    }),
  }),
);

export class GeocodingError extends Error {}

export async function geocodeAddress(address: string, fetcher: typeof fetch = fetch) {
  const url = new URL(ADDRESS_SEARCH_ENDPOINT);
  url.searchParams.set("q", address);

  let response: Response;
  try {
    response = await fetcher(url, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new GeocodingError("住所検索サービスに接続できませんでした。もう一度試してください。");
  }

  if (!response.ok) {
    throw new GeocodingError("住所検索サービスが応答しませんでした。もう一度試してください。");
  }

  const result = addressSearchResponse.safeParse(await response.json());
  const coordinates = result.success ? result.data[0]?.geometry.coordinates : undefined;
  if (!coordinates) {
    throw new GeocodingError(
      "住所から位置を特定できませんでした。番地まで含めて入力してください。",
    );
  }

  const [longitude, latitude] = coordinates;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new GeocodingError("住所検索サービスから有効な位置情報を取得できませんでした。");
  }

  return { latitude, longitude };
}
