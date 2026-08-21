import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImagePlus, LoaderCircle, LockKeyhole, MapPin, Save, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteRestaurant,
  geocodeAddress,
  listRestaurants,
  registerRestaurant,
  type Coordinates,
  type Restaurant,
} from "@/lib/restaurants";

export const Route = createFileRoute("/admin")({
  component: AdminComponent,
});

type GeocodedAddress = Coordinates & { address: string };

function AdminComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const addressRef = useRef(address);
  const [photo, setPhoto] = useState<File | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<GeocodedAddress | null>(null);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const normalizedAddress = address.trim();
  const coordinates = geocodedAddress?.address === normalizedAddress ? geocodedAddress : null;
  const restaurantsQuery = useQuery({
    queryKey: ["restaurants"],
    queryFn: listRestaurants,
  });
  const restaurants = restaurantsQuery.data ?? [];
  const geocoding = useMutation({
    mutationFn: geocodeAddress,
    onSuccess: (position, searchedAddress) => {
      if (searchedAddress !== addressRef.current.trim()) return;

      setGeocodedAddress({ ...position, address: searchedAddress });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "住所の検索に失敗しました。");
    },
  });
  const registration = useMutation({
    mutationFn: registerRestaurant,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("店を地図に追加しました。");
      await navigate({ to: "/" });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "登録に失敗しました。");
    },
  });
  const deletion = useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      setRestaurantToDelete(null);
      toast.success("店を一覧から削除しました。");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "削除に失敗しました。");
    },
  });

  function handleAddressChange(nextAddress: string) {
    addressRef.current = nextAddress;
    setAddress(nextAddress);
    setGeocodedAddress(null);
  }

  function handleGeocode() {
    if (!normalizedAddress) {
      toast.error("住所を入力してから検索してください。");
      return;
    }

    geocoding.mutate(normalizedAddress);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!coordinates) {
      toast.error("住所を検索して、位置を確認してください。");
      return;
    }
    if (!photo) {
      toast.error("写真を1枚選んでください。");
      return;
    }

    registration.mutate({
      name,
      address: normalizedAddress,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      photo,
    });
  }

  return (
    <main className="min-h-0 overflow-y-auto bg-[#f8ead1] px-4 py-7 text-[#30170d] dark:bg-[#1b0c07] dark:text-[#fff0d7] sm:px-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <section className="pt-2 lg:pt-12">
          <Link
            className="font-mono text-[0.68rem] font-bold tracking-[0.16em] text-[#a84322] uppercase hover:underline dark:text-[#ff956b]"
            to="/"
          >
            ← 地図に戻る
          </Link>
          <p className="mt-10 font-mono text-[0.68rem] font-bold tracking-[0.2em] text-[#b54220] uppercase dark:text-[#ff956b]">
            Owner&apos;s notebook / 02
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold leading-[0.88] tracking-[-0.075em] sm:text-6xl">
            好きな店を、
            <br />
            残していく。
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#70432c] dark:text-[#e1ae8a]">
            店名、番地まで含めた住所、写真を記録します。位置は住所から調べて保存するので、次からは地図をすぐ開けます。
          </p>
          <div className="mt-8 flex max-w-sm gap-3 border-l-2 border-[#b54220] bg-[#f2c85d]/25 px-4 py-3 text-xs leading-relaxed text-[#70432c] dark:bg-[#b54220]/15 dark:text-[#f4bb94]">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[#a84322] dark:text-[#ff956b]" />
            <p>
              {import.meta.env.DEV
                ? "ローカル開発では Cloudflare Access なしで登録できます。"
                : "この画面と登録 API は Cloudflare Access の本人認証を通ったメールだけが使えます。"}
            </p>
          </div>
        </section>

        <div className="space-y-5">
          <section className="border border-[#b86536]/55 bg-[#fff4dc] p-1 shadow-[8px_8px_0_rgb(116_45_19_/_0.28)] dark:border-[#8d4b2d] dark:bg-[#2a120a] dark:shadow-[8px_8px_0_rgb(0_0_0_/_0.38)]">
            <form className="border border-[#d39a60]/45 p-5 sm:p-7" onSubmit={handleSubmit}>
              <div className="flex items-start justify-between gap-5 border-b border-[#d39a60]/45 pb-5 dark:border-[#754128]">
                <div>
                  <p className="font-mono text-[0.65rem] font-bold tracking-[0.16em] text-[#a84322] uppercase dark:text-[#ff956b]">
                    New place
                  </p>
                  <h2 className="mt-1 font-serif text-3xl font-bold tracking-[-0.05em]">
                    お店を登録
                  </h2>
                </div>
                <span className="grid size-9 place-items-center border border-[#b86536]/45 bg-[#f2bd48] text-[#56210e] shadow-[2px_2px_0_rgb(87_32_13_/_0.25)]">
                  <MapPin className="size-4" />
                </span>
              </div>

              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label
                    className="font-mono text-[0.67rem] font-bold tracking-[0.12em] text-[#7f351c] uppercase dark:text-[#f3ac84]"
                    htmlFor="restaurant-name"
                  >
                    店名 <span aria-hidden="true">*</span>
                  </Label>
                  <Input
                    autoComplete="organization"
                    className="h-11 border-[#bd7141]/55 bg-[#fff9ec] px-3 text-sm shadow-[inset_2px_2px_0_rgb(114_43_18_/_0.06)] placeholder:text-[#95664e] dark:bg-[#190904] dark:placeholder:text-[#a66e55]"
                    id="restaurant-name"
                    maxLength={120}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="例: Taquería El Sol"
                    required
                    value={name}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    className="font-mono text-[0.67rem] font-bold tracking-[0.12em] text-[#7f351c] uppercase dark:text-[#f3ac84]"
                    htmlFor="restaurant-address"
                  >
                    住所 <span aria-hidden="true">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      autoComplete="street-address"
                      className="h-11 border-[#bd7141]/55 bg-[#fff9ec] px-3 text-sm shadow-[inset_2px_2px_0_rgb(114_43_18_/_0.06)] placeholder:text-[#95664e] dark:bg-[#190904] dark:placeholder:text-[#a66e55]"
                      id="restaurant-address"
                      maxLength={300}
                      onChange={(event) => handleAddressChange(event.target.value)}
                      placeholder="例: 東京都渋谷区神宮前 1-2-3"
                      required
                      value={address}
                    />
                    <Button
                      className="h-11 shrink-0 border-[#b86536]/60 bg-[#fff9ec] text-[#7f351c] shadow-[2px_2px_0_rgb(87_32_13_/_0.18)] hover:bg-[#f8e3b6] dark:bg-[#34150a] dark:text-[#ffb18a] dark:hover:bg-[#4a1c0d]"
                      disabled={geocoding.isPending || !normalizedAddress}
                      onClick={handleGeocode}
                      type="button"
                      variant="outline"
                    >
                      {geocoding.isPending ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Search className="size-3.5" />
                      )}
                      {geocoding.isPending ? "検索中" : "座標を検索"}
                    </Button>
                  </div>
                  <p className="text-[0.68rem] leading-relaxed text-[#80513a] dark:text-[#c88f70]">
                    番地まで入れると、地図上の位置が安定します。
                  </p>
                  <div
                    aria-live="polite"
                    className="border border-dashed border-[#b86536]/50 bg-[#f4d986]/20 px-3 py-3 dark:border-[#8d4b2d] dark:bg-[#b54220]/10"
                  >
                    {coordinates ? (
                      <>
                        <p className="font-mono text-[0.63rem] font-bold tracking-[0.12em] text-[#a84322] uppercase dark:text-[#ff956b]">
                          確認した位置
                        </p>
                        <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <dt className="text-[#80513a] dark:text-[#c88f70]">緯度</dt>
                            <dd className="mt-0.5 font-mono font-bold">
                              {coordinates.latitude.toFixed(6)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[#80513a] dark:text-[#c88f70]">経度</dt>
                            <dd className="mt-0.5 font-mono font-bold">
                              {coordinates.longitude.toFixed(6)}
                            </dd>
                          </div>
                        </dl>
                        <p className="mt-2 text-[0.68rem] leading-relaxed text-[#80513a] dark:text-[#c88f70]">
                          この位置で登録します。住所を変更すると、もう一度検索が必要です。
                        </p>
                      </>
                    ) : (
                      <p className="text-[0.68rem] leading-relaxed text-[#80513a] dark:text-[#c88f70]">
                        住所を検索すると、登録前に緯度と経度を確認できます。
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    className="font-mono text-[0.67rem] font-bold tracking-[0.12em] text-[#7f351c] uppercase dark:text-[#f3ac84]"
                    htmlFor="restaurant-photo"
                  >
                    写真 <span aria-hidden="true">*</span>
                  </Label>
                  <label
                    className="group flex min-h-28 cursor-pointer items-center gap-4 border border-dashed border-[#b86536]/65 bg-[#f7d983]/20 px-4 py-4 transition-colors hover:bg-[#f7d983]/35 dark:bg-[#b54220]/10 dark:hover:bg-[#b54220]/20"
                    htmlFor="restaurant-photo"
                  >
                    <span className="grid size-10 shrink-0 place-items-center border border-[#b86536]/50 bg-[#fff5df] text-[#a84322] shadow-[2px_2px_0_rgb(87_32_13_/_0.2)] dark:bg-[#34150a] dark:text-[#ff956b]">
                      <ImagePlus className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">
                        {photo ? photo.name : "端末から写真を選ぶ"}
                      </span>
                      <span className="mt-1 block text-xs text-[#80513a] dark:text-[#c88f70]">
                        JPEG / PNG / WebP ・ 8 MB 以下
                      </span>
                    </span>
                  </label>
                  <Input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    id="restaurant-photo"
                    onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
                    required
                    type="file"
                  />
                </div>
              </div>

              <Button
                className="mt-7 h-11 w-full border-[#a84322] bg-[#b94825] font-bold text-[#fff7e8] shadow-[3px_3px_0_#6a250f] hover:bg-[#a84322] dark:bg-[#e66539] dark:text-[#280d05] dark:hover:bg-[#f2794d]"
                disabled={registration.isPending || !coordinates}
                size="lg"
                type="submit"
              >
                {registration.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {registration.isPending
                  ? "保存中…"
                  : coordinates
                    ? "この店を地図に残す"
                    : "住所を検索して位置を確認"}
              </Button>
            </form>
          </section>
          <section className="border border-[#b86536]/55 bg-[#fff4dc] p-1 shadow-[8px_8px_0_rgb(116_45_19_/_0.28)] dark:border-[#8d4b2d] dark:bg-[#2a120a] dark:shadow-[8px_8px_0_rgb(0_0_0_/_0.38)]">
            <div className="border border-[#d39a60]/45 p-5 sm:p-7">
              <div className="flex items-start justify-between gap-5 border-b border-[#d39a60]/45 pb-5 dark:border-[#754128]">
                <div>
                  <p className="font-mono text-[0.65rem] font-bold tracking-[0.16em] text-[#a84322] uppercase dark:text-[#ff956b]">
                    Saved places
                  </p>
                  <h2 className="mt-1 font-serif text-3xl font-bold tracking-[-0.05em]">
                    登録済みのお店
                  </h2>
                </div>
                <span className="border border-[#b86536]/45 bg-[#f2bd48] px-2 py-1 font-mono text-xs font-bold text-[#56210e] shadow-[2px_2px_0_rgb(87_32_13_/_0.25)]">
                  {restaurants.length}
                </span>
              </div>

              <div className="mt-5">
                {restaurantsQuery.isPending ? (
                  <div className="grid min-h-24 place-items-center text-[#8c573c] dark:text-[#d99c7a]">
                    <LoaderCircle
                      className="size-5 animate-spin"
                      aria-label="登録済みの店を読み込み中"
                    />
                  </div>
                ) : null}

                {restaurantsQuery.isError ? (
                  <p className="border border-dashed border-[#b54220]/50 p-3 text-xs leading-relaxed text-[#8a321b] dark:text-[#ffb192]">
                    {(restaurantsQuery.error as Error).message}
                  </p>
                ) : null}

                {!restaurantsQuery.isPending &&
                !restaurantsQuery.isError &&
                restaurants.length === 0 ? (
                  <p className="border border-dashed border-[#b86536]/50 px-4 py-6 text-center text-xs leading-relaxed text-[#80513a] dark:text-[#c88f70]">
                    まだ登録済みのお店はありません。
                  </p>
                ) : null}

                <ul className="space-y-2">
                  {restaurants.map((restaurant) => {
                    const isDeleteConfirmationOpen = restaurantToDelete?.id === restaurant.id;

                    return (
                      <li
                        className="border border-[#b86536]/45 bg-[#fff9ec]/60 p-3 dark:border-[#754128] dark:bg-[#190904]/45"
                        key={restaurant.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-serif text-lg font-bold leading-tight tracking-[-0.03em]">
                              {restaurant.name}
                            </h3>
                            <p className="mt-1 flex gap-1.5 text-xs leading-relaxed text-[#70432c] dark:text-[#e1ae8a]">
                              <MapPin className="mt-0.5 size-3 shrink-0 text-[#b54220] dark:text-[#ff956b]" />
                              <span>{restaurant.address}</span>
                            </p>
                          </div>
                          {!isDeleteConfirmationOpen ? (
                            <Button
                              aria-label={`${restaurant.name}を削除する`}
                              className="h-8 shrink-0 border-[#b54220]/55 bg-transparent px-2 text-[#a84322] hover:bg-[#b54220]/10 dark:text-[#ff956b] dark:hover:bg-[#b54220]/20"
                              disabled={deletion.isPending}
                              onClick={() => setRestaurantToDelete(restaurant)}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <Trash2 className="size-3.5" />
                              削除
                            </Button>
                          ) : null}
                        </div>

                        {isDeleteConfirmationOpen ? (
                          <div
                            className="mt-3 border-l-2 border-[#b54220] bg-[#f2c85d]/20 px-3 py-3 text-xs dark:bg-[#b54220]/15"
                            role="alert"
                          >
                            <p className="font-bold">{restaurant.name}を削除しますか？</p>
                            <p className="mt-1 leading-relaxed text-[#70432c] dark:text-[#e1ae8a]">
                              削除すると、このお店と写真は一覧から取り除かれます。
                            </p>
                            <div className="mt-3 flex justify-end gap-2">
                              <Button
                                className="border-[#b86536]/55 bg-transparent text-[#70432c] hover:bg-[#f2c85d]/25 dark:text-[#e1ae8a] dark:hover:bg-[#b54220]/20"
                                disabled={deletion.isPending}
                                onClick={() => setRestaurantToDelete(null)}
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                キャンセル
                              </Button>
                              <Button
                                className="border-[#9e2f1d] bg-[#b54220] text-[#fff7e8] shadow-[2px_2px_0_#6a250f] hover:bg-[#9e2f1d] dark:bg-[#e66539] dark:text-[#280d05] dark:hover:bg-[#f2794d]"
                                disabled={deletion.isPending}
                                onClick={() => deletion.mutate(restaurant.id)}
                                size="sm"
                                type="button"
                              >
                                {deletion.isPending ? (
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                                削除する
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
