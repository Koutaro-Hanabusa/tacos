import { describe, expect, it } from "vite-plus/test";
import { GeocodingError, geocodeAddress } from "./geocode";

describe("geocodeAddress", () => {
  it("国土地理院の GeoJSON を緯度・経度に対応付ける", async () => {
    const position = await geocodeAddress(
      "東京都千代田区千代田1-1",
      async () =>
        new Response(JSON.stringify([{ geometry: { coordinates: [139.7528, 35.6852] } }])),
    );

    expect(position).toEqual({ latitude: 35.6852, longitude: 139.7528 });
  });

  it("候補がない住所は登録前に失敗させる", async () => {
    await expect(
      geocodeAddress("存在しない住所", async () => new Response(JSON.stringify([]))),
    ).rejects.toBeInstanceOf(GeocodingError);
  });
});
