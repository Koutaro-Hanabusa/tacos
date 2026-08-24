import { ImagePlus, LoaderCircle, MapPin, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRestaurantForm } from "@/features/restaurants/hooks/use-restaurant-form";

interface Props {
  onRegistered: () => Promise<void> | void;
}

function RequiredBadge() {
  return (
    <span className="ml-2 inline-flex items-center border border-taco-roja/50 bg-taco-roja/10 px-1.5 py-0.5 text-xs font-semibold leading-none text-taco-roja-strong">
      必須
    </span>
  );
}

export function RestaurantForm({ onRegistered }: Props) {
  const form = useRestaurantForm({ onRegistered });
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(form.photo);
    setPhotoPreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [form.photo]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void form.register();
  }

  return (
    <section className="overflow-hidden rounded-lg border border-taco-border bg-taco-surface">
      <form className="p-5 font-sans text-base sm:p-7" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-5 border-b border-taco-border/60 pb-5">
          <div>
            <h2 className="mt-1 text-3xl font-extrabold tracking-[-0.03em]">お店を登録</h2>
          </div>
          <span className="grid size-9 place-items-center border border-taco-lime/60 bg-taco-lime text-taco-ink">
            <MapPin className="size-4" />
          </span>
        </div>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label
              className="text-sm font-semibold tracking-normal text-taco-ink-soft"
              htmlFor="restaurant-name"
            >
              店名 <RequiredBadge />
            </Label>
            <Input
              autoComplete="organization"
              className="h-12 border-taco-border bg-taco-paper-bright px-3 text-base placeholder:text-taco-muted"
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
              className="text-sm font-semibold tracking-normal text-taco-ink-soft"
              htmlFor="restaurant-address"
            >
              住所 <RequiredBadge />
            </Label>
            <div className="flex gap-2">
              <Input
                autoComplete="street-address"
                className="h-12 border-taco-border bg-taco-paper-bright px-3 text-base placeholder:text-taco-muted"
                id="restaurant-address"
                maxLength={300}
                onChange={(event) => form.changeAddress(event.target.value)}
                placeholder="例: 東京都渋谷区神宮前 1-2-3"
                required
                value={form.address}
              />
              <Button
                className="h-12 shrink-0 text-sm"
                disabled={form.isGeocoding || !form.normalizedAddress}
                onClick={form.geocode}
                type="button"
                variant="secondary"
              >
                {form.isGeocoding ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Search className="size-3.5" />
                )}
                {form.isGeocoding ? "検索中" : "座標を検索"}
              </Button>
            </div>
            <p className="text-sm leading-relaxed text-taco-muted">
              番地まで入れると、地図上の位置が安定します。
            </p>
            <div
              aria-live="polite"
              className="rounded-sm border border-dashed border-taco-border bg-taco-surface-raised px-3 py-3"
            >
              {form.coordinates ? (
                <>
                  <p className="text-sm font-semibold tracking-wide text-taco-ink-soft">
                    確認した位置
                  </p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-taco-muted">緯度</dt>
                      <dd className="mt-0.5 font-mono text-sm font-semibold">
                        {form.coordinates.latitude.toFixed(6)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-taco-muted">経度</dt>
                      <dd className="mt-0.5 font-mono text-sm font-semibold">
                        {form.coordinates.longitude.toFixed(6)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-sm leading-relaxed text-taco-muted">
                    この位置で登録します。住所を変更すると、もう一度検索が必要です。
                  </p>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-taco-muted">
                  住所を検索すると、登録前に緯度と経度を確認できます。
                </p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label
                className="text-sm font-semibold tracking-normal text-taco-ink-soft"
                htmlFor="restaurant-rate"
              >
                評価 <RequiredBadge />
              </Label>
              <div className="inline-flex min-h-14 items-center gap-4">
                <Input
                  aria-label="評価"
                  className="h-12 w-24 border-taco-border bg-taco-surface-raised text-center font-mono text-xl font-bold"
                  id="restaurant-rate"
                  inputMode="decimal"
                  onChange={(event) => form.setRateInput(event.target.value)}
                  placeholder="5"
                  required
                  type="text"
                  value={form.rateInput}
                />
                <span className="text-sm font-semibold text-taco-ink-soft">/ 5</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                className="text-sm font-semibold tracking-normal text-taco-ink-soft"
                htmlFor="restaurant-memo"
              >
                おいしいものメモ <span className="normal-case text-taco-muted">（任意）</span>
              </Label>
              <textarea
                className="min-h-12 w-full resize-y border border-taco-border bg-taco-paper-bright px-3 py-2.5 text-base text-taco-ink outline-none placeholder:text-taco-muted focus-visible:ring-2 focus-visible:ring-taco-roja-strong"
                id="restaurant-memo"
                maxLength={1000}
                onChange={(event) => form.setMemo(event.target.value)}
                placeholder="例: ケサディーヤが最高です"
                rows={3}
                value={form.memo}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              className="text-sm font-semibold tracking-normal text-taco-ink-soft"
              htmlFor="restaurant-photo"
            >
              写真 <RequiredBadge />
            </Label>
            <label
              className="group flex min-h-28 cursor-pointer items-center gap-4 rounded-md border border-dashed border-taco-tortilla/70 bg-taco-tortilla/20 px-4 py-4 transition-colors hover:bg-taco-tortilla/30"
              htmlFor="restaurant-photo"
            >
              <span className="grid size-10 shrink-0 place-items-center border border-taco-tortilla/60 bg-taco-surface text-taco-verde-strong">
                <ImagePlus className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base font-bold">
                  {form.photo ? form.photo.name : "端末から写真を選ぶ"}
                </span>
                <span className="mt-1 block text-sm text-taco-muted">
                  {form.photo ? "クリックして別の写真に変更" : "JPEG / PNG / WebP ・ 8 MB 以下"}
                </span>
              </span>
            </label>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              id="restaurant-photo"
              onChange={(event) => form.setPhoto(event.target.files?.[0] ?? null)}
              required
              type="file"
            />
            {photoPreviewUrl ? (
              <span className="size-24 shrink-0 overflow-hidden rounded-sm border border-taco-tortilla/60 bg-taco-surface">
                <img
                  alt="選択した写真のプレビュー"
                  className="size-full object-cover"
                  src={photoPreviewUrl}
                />
              </span>
            ) : null}
          </div>
        </div>

        <Button
          className="mt-7 h-12 w-full text-base font-bold"
          disabled={form.isRegistering || !form.coordinates}
          size="lg"
          type="submit"
        >
          {form.isRegistering ? <LoaderCircle className="size-4 animate-spin" /> : null}
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
