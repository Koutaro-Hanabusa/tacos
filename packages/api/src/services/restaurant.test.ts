import { describe, expect, it } from "vite-plus/test";
import { addRestaurantInput, registerRestaurantInput } from "./restaurant";

describe("restaurant input", () => {
  it("登録 input は店名と住所だけを受け取る", () => {
    const input = registerRestaurantInput.parse({
      name: "テスト店",
      address: "東京都千代田区千代田1-1",
    });

    expect(input).toEqual({
      name: "テスト店",
      address: "東京都千代田区千代田1-1",
    });
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
        latitude: 35.683659,
        longitude: 139.754089,
        imageKey: "restaurants/example.webp",
      }).success,
    ).toBe(true);
  });
});
