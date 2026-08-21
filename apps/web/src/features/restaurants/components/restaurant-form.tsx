import { ImagePlus, LoaderCircle, MapPin, Save, Search } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRestaurantForm } from "@/features/restaurants/hooks/use-restaurant-form";

interface Props {
  onRegistered: () => Promise<void> | void;
}

export function RestaurantForm({ onRegistered }: Props) {
  const form = useRestaurantForm({ onRegistered });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void form.register();
  }

  return (
    <section className="border border-[#b86536]/55 bg-[#fff4dc] p-1 shadow-[8px_8px_0_rgb(116_45_19_/_0.28)] dark:border-[#8d4b2d] dark:bg-[#2a120a] dark:shadow-[8px_8px_0_rgb(0_0_0_/_0.38)]">
      <form className="border border-[#d39a60]/45 p-5 sm:p-7" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-5 border-b border-[#d39a60]/45 pb-5 dark:border-[#754128]">
          <div>
            <p className="font-mono text-[0.65rem] font-bold tracking-[0.16em] text-[#a84322] uppercase dark:text-[#ff956b]">
              New place
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-[-0.05em]">お店を登録</h2>
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
              onChange={(event) => form.setName(event.target.value)}
              placeholder="例: Taquería El Sol"
              required
              value={form.name}
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
                onChange={(event) => form.changeAddress(event.target.value)}
                placeholder="例: 東京都渋谷区神宮前 1-2-3"
                required
                value={form.address}
              />
              <Button
                className="h-11 shrink-0 border-[#b86536]/60 bg-[#fff9ec] text-[#7f351c] shadow-[2px_2px_0_rgb(87_32_13_/_0.18)] hover:bg-[#f8e3b6] dark:bg-[#34150a] dark:text-[#ffb18a] dark:hover:bg-[#4a1c0d]"
                disabled={form.isGeocoding || !form.normalizedAddress}
                onClick={form.geocode}
                type="button"
                variant="outline"
              >
                {form.isGeocoding ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Search className="size-3.5" />
                )}
                {form.isGeocoding ? "検索中" : "座標を検索"}
              </Button>
            </div>
            <p className="text-[0.68rem] leading-relaxed text-[#80513a] dark:text-[#c88f70]">
              番地まで入れると、地図上の位置が安定します。
            </p>
            <div
              aria-live="polite"
              className="border border-dashed border-[#b86536]/50 bg-[#f4d986]/20 px-3 py-3 dark:border-[#8d4b2d] dark:bg-[#b54220]/10"
            >
              {form.coordinates ? (
                <>
                  <p className="font-mono text-[0.63rem] font-bold tracking-[0.12em] text-[#a84322] uppercase dark:text-[#ff956b]">
                    確認した位置
                  </p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-[#80513a] dark:text-[#c88f70]">緯度</dt>
                      <dd className="mt-0.5 font-mono font-bold">
                        {form.coordinates.latitude.toFixed(6)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#80513a] dark:text-[#c88f70]">経度</dt>
                      <dd className="mt-0.5 font-mono font-bold">
                        {form.coordinates.longitude.toFixed(6)}
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
                  {form.photo ? form.photo.name : "端末から写真を選ぶ"}
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
              onChange={(event) => form.setPhoto(event.target.files?.[0] ?? null)}
              required
              type="file"
            />
          </div>
        </div>

        <Button
          className="mt-7 h-11 w-full border-[#a84322] bg-[#b94825] font-bold text-[#fff7e8] shadow-[3px_3px_0_#6a250f] hover:bg-[#a84322] dark:bg-[#e66539] dark:text-[#280d05] dark:hover:bg-[#f2794d]"
          disabled={form.isRegistering || !form.coordinates}
          size="lg"
          type="submit"
        >
          {form.isRegistering ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {form.isRegistering
            ? "保存中…"
            : form.coordinates
              ? "この店を地図に残す"
              : "住所を検索して位置を確認"}
        </Button>
      </form>
    </section>
  );
}
