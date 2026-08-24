import { describe, expect, test } from "vite-plus/test";

import { normalizeRestaurantResult, restaurantResultError } from "./restaurant-app-data";

const restaurant = {
  id: "42",
  name: "La Taqueria",
  address: "東京都渋谷区",
  latitude: "35.66",
  longitude: 139.7,
  rate: 4.5,
  memo: "牛タンのタコス",
  googleMapsUrl: "https://www.google.com/maps/place/La+Taqueria",
  photoUrl: "https://example.com/taco.jpg",
};

describe("restaurant app data", () => {
  test("normalizes structured restaurant results and ignores invalid rows", () => {
    expect(
      normalizeRestaurantResult({
        structuredContent: {
          restaurants: [restaurant, { id: "invalid", latitude: 0, longitude: 0 }],
        },
      }),
    ).toEqual([
      {
        id: 42,
        name: "La Taqueria",
        address: "東京都渋谷区",
        latitude: 35.66,
        longitude: 139.7,
        rate: 4.5,
        memo: "牛タンのタコス",
        googleMapsUrl: "https://www.google.com/maps/place/La+Taqueria",
        photoUrl: "https://example.com/taco.jpg",
      },
    ]);
  });

  test("supports the text JSON fallback", () => {
    expect(
      normalizeRestaurantResult({
        content: [{ type: "text", text: JSON.stringify([restaurant]) }],
      }),
    ).toHaveLength(1);
  });

  test("extracts an MCP error message", () => {
    expect(
      restaurantResultError({ content: [{ type: "text", text: "検索APIが応答しませんでした。" }] }),
    ).toBe("検索APIが応答しませんでした。");
    expect(restaurantResultError({})).toBe("検索に失敗しました。");
  });
});
