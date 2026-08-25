import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  count: vi.fn(),
  delete: vi.fn(),
  geocodeAddress: vi.fn(),
  get: vi.fn(),
  getRecord: vi.fn(),
  list: vi.fn(),
  photoDelete: vi.fn(),
  photoPut: vi.fn(),
  update: vi.fn(),
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
    count = mocks.count;
    delete = mocks.delete;
    get = mocks.get;
    getRecord = mocks.getRecord;
    list = mocks.list;
    update = mocks.update;
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

function updateForm() {
  const form = new FormData();
  form.set("name", "更新店");
  form.set("address", "東京都渋谷区神宮前2-2");
  form.set("latitude", "35.67");
  form.set("longitude", "139.7");
  form.set("rate", "3.5");
  form.set("memo", "更新したメモ");
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.photoDelete.mockResolvedValue(undefined);
  mocks.photoPut.mockResolvedValue(undefined);
  mocks.list.mockResolvedValue([]);
  mocks.count.mockResolvedValue(0);
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

  it("登録時に0点の評価を受け付ける", async () => {
    mocks.add.mockResolvedValue({ id: 7 });
    mocks.get.mockResolvedValue({ id: 7, name: "テスト店" });

    const response = await app.request(
      "http://localhost/api/admin/restaurants",
      { method: "POST", body: registrationForm("35.683659", "139.754089", "0") },
      bindings(),
    );

    expect(response.status).toBe(201);
    expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ rate: 0 }));
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

  it("店舗情報を更新する", async () => {
    mocks.getRecord.mockResolvedValue({ id: 7, imageKey: "restaurants/7.jpg" });
    mocks.update.mockResolvedValue({ id: 7, name: "更新店" });

    const response = await app.request(
      "http://localhost/api/admin/restaurants/7",
      { method: "PATCH", body: updateForm() },
      bindings(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ restaurant: { id: 7, name: "更新店" } });
    expect(mocks.update).toHaveBeenCalledWith(7, {
      address: "東京都渋谷区神宮前2-2",
      latitude: 35.67,
      longitude: 139.7,
      memo: "更新したメモ",
      name: "更新店",
      rate: 3.5,
    });
    expect(mocks.photoPut).not.toHaveBeenCalled();
  });

  it("写真を差し替えて旧写真を削除する", async () => {
    mocks.getRecord.mockResolvedValue({ id: 7, imageKey: "restaurants/old.jpg" });
    mocks.update.mockResolvedValue({ id: 7, name: "更新店" });
    const form = updateForm();
    form.set(
      "photo",
      new File([new Uint8Array([0xff, 0xd8, 0xff])], "new.jpg", { type: "image/jpeg" }),
    );

    const response = await app.request(
      "http://localhost/api/admin/restaurants/7",
      { method: "PATCH", body: form },
      bindings(),
    );

    expect(response.status).toBe(200);
    expect(mocks.photoPut).toHaveBeenCalledWith(
      expect.stringMatching(/^restaurants\/.+\.jpg$/),
      expect.any(Uint8Array),
      expect.objectContaining({
        httpMetadata: expect.objectContaining({ contentType: "image/jpeg" }),
      }),
    );
    expect(mocks.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ imageKey: expect.stringMatching(/^restaurants\/.+\.jpg$/) }),
    );
    expect(mocks.photoDelete).toHaveBeenCalledWith("restaurants/old.jpg");
  });
});

describe("公開レストラン API", () => {
  it("limit と offset を使い、総件数を返す", async () => {
    mocks.list.mockResolvedValue([{ id: 7 }]);
    mocks.count.mockResolvedValue(21);

    const response = await app.request(
      "http://localhost/api/restaurants?limit=10&offset=10",
      {},
      bindings(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ restaurants: [{ id: 7 }], total: 21 });
    expect(mocks.list).toHaveBeenCalledWith({ limit: 10, offset: 10 });
    expect(mocks.count).toHaveBeenCalledOnce();
  });
});
