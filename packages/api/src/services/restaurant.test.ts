import { describe, expect, it } from "vite-plus/test";
import {
  addRestaurantInput,
  googleMapsUrl,
  registerRestaurantInput,
  updateRestaurantInput,
} from "./restaurant";

describe("restaurant input", () => {
  it("Google Maps は店名と住所で検索する", () => {
    const url = new URL(googleMapsUrl("タコス屋", "東京都渋谷区神宮前1-2-3"));

    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe("タコス屋, 東京都渋谷区神宮前1-2-3");
  });

  it("登録 input は評価とメモを受け取る", () => {
    const input = registerRestaurantInput.parse({
      name: "テスト店",
      address: "東京都千代田区千代田1-1",
      rate: 4.5,
      memo: "牛タンがよかった",
    });

    expect(input).toEqual({
      name: "テスト店",
      address: "東京都千代田区千代田1-1",
      rate: 4.5,
      memo: "牛タンがよかった",
    });
  });

  it("評価は0〜5の小数を受け付ける", () => {
    for (const rate of [-0.1, 5.5]) {
      expect(
        registerRestaurantInput.safeParse({
          name: "テスト店",
          address: "東京都千代田区千代田1-1",
          rate,
        }).success,
      ).toBe(false);
    }

    expect(
      registerRestaurantInput.safeParse({
        name: "テスト店",
        address: "東京都千代田区千代田1-1",
        rate: 0,
      }).success,
    ).toBe(true);

    expect(
      registerRestaurantInput.safeParse({
        name: "テスト店",
        address: "東京都千代田区千代田1-1",
        rate: 3.25,
      }).success,
    ).toBe(true);
  });

  it("保存 input は位置情報と画像キーを必須にする", () => {
    expect(
      addRestaurantInput.safeParse({
        name: "テスト店",
        address: "東京都千代田区千代田1-1",
      }).success,
    ).toBe(false);

    expect(
      addRestaurantInput.safeParse({
        name: "テスト店",
        address: "東京都千代田区千代田1-1",
        rate: 4.5,
        latitude: 35.683659,
        longitude: 139.754089,
        imageKey: "restaurants/example.webp",
      }).success,
    ).toBe(true);
  });

  it("更新 input は写真なしで受け付ける", () => {
    expect(
      updateRestaurantInput.safeParse({
        name: "更新店",
        address: "東京都渋谷区神宮前2-2",
        rate: 3.5,
        latitude: 35.67,
        longitude: 139.7,
        memo: "更新したメモ",
      }).success,
    ).toBe(true);
  });
});
