import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { ZodError } from "zod";

vi.mock("@tacos/env/web", () => ({
  env: { VITE_SERVER_URL: "https://api.example.test" },
}));

import {
  deleteRestaurant,
  geocodeAddress,
  listRestaurants,
  listRestaurantsPage,
  registerRestaurant,
} from "./client";

const fetchMock = vi.fn();

const restaurant = {
  id: 1,
  name: "Taquería El Sol",
  address: "東京都渋谷区神宮前 1-2-3",
  latitude: 35.671,
  longitude: 139.706,
  rate: 4.5,
  memo: "カルニタスがよかった",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=35.671%2C139.706",
  photoUrl: "https://api.example.test/photos/1",
  createdAt: null,
  updatedAt: null,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function photo() {
  return new File(["image"], "tacos.webp", { type: "image/webp" });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("restaurant API client", () => {
  it("登録済みのお店を検証して返す", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ restaurants: [restaurant] }));

    await expect(listRestaurants()).resolves.toEqual([restaurant]);
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/api/restaurants", {
      headers: { Accept: "application/json" },
    });
  });

  it("指定したページの店舗と総件数を返す", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ restaurants: [restaurant], total: 21 }));

    await expect(listRestaurantsPage({ limit: 10, offset: 10 })).resolves.toEqual({
      restaurants: [restaurant],
      total: 21,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/restaurants?limit=10&offset=10",
      { headers: { Accept: "application/json" } },
    );
  });

  it("住所検索の座標を検証して返す", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ latitude: 35.671, longitude: 139.706 }));

    await expect(geocodeAddress("東京都渋谷区神宮前 1-2-3")).resolves.toEqual({
      latitude: 35.671,
      longitude: 139.706,
    });
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/api/admin/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: "東京都渋谷区神宮前 1-2-3" }),
      credentials: "include",
    });
  });

  it("住所検索の API エラー文言をそのまま返す", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { error: "住所から位置を特定できませんでした。番地まで含めて入力してください。" },
        422,
      ),
    );

    await expect(geocodeAddress("存在しない住所")).rejects.toThrow(
      "住所から位置を特定できませんでした。番地まで含めて入力してください。",
    );
  });

  it("確認した座標を含む登録レスポンスを検証して返す", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ restaurant }, 201));

    await expect(
      registerRestaurant({
        name: restaurant.name,
        address: restaurant.address,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        rate: restaurant.rate,
        memo: restaurant.memo ?? "",
        photo: photo(),
      }),
    ).resolves.toEqual(restaurant);

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const formData = options.body as FormData;
    expect(formData.get("latitude")).toBe("35.671");
    expect(formData.get("longitude")).toBe("139.706");
    expect(formData.get("rate")).toBe("4.5");
    expect(formData.get("memo")).toBe("カルニタスがよかった");
  });

  it("不正な登録成功レスポンスを受け入れない", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ restaurant: { id: "1" } }, 201));

    await expect(
      registerRestaurant({
        name: restaurant.name,
        address: restaurant.address,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        rate: restaurant.rate,
        memo: restaurant.memo ?? "",
        photo: photo(),
      }),
    ).rejects.toBeInstanceOf(ZodError);
  });

  it("削除は認証情報付き DELETE で 204 を成功として扱う", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(deleteRestaurant(restaurant.id)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/api/admin/restaurants/1", {
      method: "DELETE",
      credentials: "include",
    });
  });
});
