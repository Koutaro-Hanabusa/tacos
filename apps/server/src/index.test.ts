import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  delete: vi.fn(),
  geocodeAddress: vi.fn(),
  get: vi.fn(),
  photoDelete: vi.fn(),
  photoPut: vi.fn(),
}));

vi.mock("drizzle-orm/d1", () => ({
  drizzle: vi.fn(() => ({})),
}));

vi.mock("@tacos/env/server", () => ({
  env: { CORS_ORIGIN: "http://localhost:3000" },
}));

vi.mock("@tacos/api/services/restaurant", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tacos/api/services/restaurant")>();

  class RestaurantApi {
    add = mocks.add;
    delete = mocks.delete;
    get = mocks.get;
  }

  return { ...actual, RestaurantApi };
});

vi.mock("./geocode", () => ({
  GeocodingError: class GeocodingError extends Error {},
  geocodeAddress: mocks.geocodeAddress,
}));

import app from "./index";

function bindings() {
  return {
    ADMIN_ACCESS_BYPASS: "true",
    ADMIN_EMAIL: "",
    CORS_ORIGIN: "http://localhost:3000",
    DB: {},
    PHOTOS: {
      delete: mocks.photoDelete,
      put: mocks.photoPut,
    },
  } as never;
}

function registrationForm(
  latitude = "35.683659",
  longitude = "139.754089",
  rate = "4.5",
  memo = "牛タンのタコスがよかった",
) {
  const form = new FormData();
  form.set("name", "テスト店");
  form.set("address", "東京都千代田区千代田1-1");
  form.set("latitude", latitude);
  form.set("longitude", longitude);
  form.set("rate", rate);
  form.set("memo", memo);
  form.set(
    "photo",
    new File([new Uint8Array([0xff, 0xd8, 0xff])], "restaurant.jpg", {
      type: "image/jpeg",
    }),
  );
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.photoDelete.mockResolvedValue(undefined);
  mocks.photoPut.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("管理者向け店舗 API", () => {
  it("住所を座標に変換する", async () => {
    mocks.geocodeAddress.mockResolvedValue({ latitude: 35.683659, longitude: 139.754089 });

    const response = await app.request(
      "http://localhost/api/admin/geocode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: "東京都千代田区千代田1-1" }),
      },
      bindings(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ latitude: 35.683659, longitude: 139.754089 });
    expect(mocks.geocodeAddress).toHaveBeenCalledWith("東京都千代田区千代田1-1");
  });

  it("登録時は検索済み座標を使い、再 geocode しない", async () => {
    mocks.add.mockResolvedValue({ id: 7 });
    mocks.get.mockResolvedValue({ id: 7, name: "テスト店" });

    const response = await app.request(
      "http://localhost/api/admin/restaurants",
      { method: "POST", body: registrationForm() },
      bindings(),
    );

    expect(response.status).toBe(201);
    expect(mocks.add).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "テスト店",
        address: "東京都千代田区千代田1-1",
        latitude: 35.683659,
        longitude: 139.754089,
        rate: 4.5,
        memo: "牛タンのタコスがよかった",
      }),
    );
    expect(mocks.geocodeAddress).not.toHaveBeenCalled();
  });

  it("登録時に範囲外の座標を拒否する", async () => {
    const response = await app.request(
      "http://localhost/api/admin/restaurants",
      { method: "POST", body: registrationForm("91") },
      bindings(),
    );

    expect(response.status).toBe(400);
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it("登録時に5点を超える評価を拒否する", async () => {
    const response = await app.request(
      "http://localhost/api/admin/restaurants",
      { method: "POST", body: registrationForm("35.683659", "139.754089", "5.5") },
      bindings(),
    );

    expect(response.status).toBe(400);
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it("店舗と写真を削除する", async () => {
    mocks.delete.mockResolvedValue({ id: 7, imageKey: "restaurants/7.jpg" });

    const response = await app.request(
      "http://localhost/api/admin/restaurants/7",
      { method: "DELETE" },
      bindings(),
    );

    expect(response.status).toBe(204);
    expect(mocks.delete).toHaveBeenCalledWith(7);
    expect(mocks.photoDelete).toHaveBeenCalledWith("restaurants/7.jpg");
  });

  it("写真 cleanup が失敗しても店舗の削除は成功扱いにする", async () => {
    mocks.delete.mockResolvedValue({ id: 7, imageKey: "restaurants/7.jpg" });
    mocks.photoDelete.mockRejectedValue(new Error("R2 unavailable"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await app.request(
      "http://localhost/api/admin/restaurants/7",
      { method: "DELETE" },
      bindings(),
    );

    expect(response.status).toBe(204);
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "restaurant_photo_cleanup_failed",
        restaurantId: 7,
      }),
    );
  });
});
