import { useEffect, useRef, useState } from "react";

import { Button } from "./button";
import type { RestaurantListItemProps } from "./types";
import { safeGoogleMapsUrl, safeHttpUrl } from "./utils/restaurant";

export function RestaurantListItem({
  restaurant,
  selected,
  onSelect,
  onOpenLink,
  onClose,
}: RestaurantListItemProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const photoPreviewDialogRef = useRef<HTMLDialogElement>(null);
  const imageUrl = safeHttpUrl(restaurant.photoUrl);
  const mapsUrl = safeGoogleMapsUrl(restaurant.googleMapsUrl);

  useEffect(() => {
    const dialog = photoPreviewDialogRef.current;
    if (!dialog) return;

    if (isPhotoPreviewOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isPhotoPreviewOpen && dialog.open) {
      dialog.close();
    }
  }, [isPhotoPreviewOpen]);

  return (
    <article
      className={`place group relative w-full overflow-hidden rounded-md border transition-colors ${
        selected
          ? "border-taco-roja bg-taco-surface-raised"
          : "border-taco-border/60 bg-taco-surface/70 hover:border-taco-roja/70 hover:bg-taco-surface-raised"
      }`}
      data-id={restaurant.id}
    >
      {onClose ? (
        <Button
          aria-label="選択を解除"
          className="absolute top-2 right-2 z-10 grid size-8 place-items-center rounded-full border border-taco-border bg-taco-paper-bright text-xl leading-none font-semibold text-taco-ink"
          onClick={onClose}
          type="button"
          unstyled
        >
          ×
        </Button>
      ) : null}

      <div className={`place-select flex w-full items-start gap-3 p-3 ${onClose ? "pr-12" : ""}`}>
        {imageUrl && !imageFailed ? (
          <Button
            aria-label={`写真を拡大: ${restaurant.name || "名前のないレストラン"}`}
            className="group relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-taco-tortilla/30 bg-taco-tortilla/20 p-0 font-display text-xl font-bold text-taco-ink"
            onClick={() => setIsPhotoPreviewOpen(true)}
            type="button"
            unstyled
          >
            <img
              alt={`${restaurant.name || "名前のないレストラン"}の写真`}
              className="size-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
              src={imageUrl}
            />
            <span className="absolute inset-x-0 bottom-0 bg-taco-ink/75 px-1 py-1 text-xs font-semibold text-taco-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              拡大
            </span>
          </Button>
        ) : (
          <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-taco-tortilla/30 bg-taco-tortilla/20 font-display text-xl font-bold text-taco-ink">
            <span aria-hidden="true">T</span>
          </span>
        )}
        <Button
          aria-pressed={selected}
          className="min-w-0 flex-1 flex-col items-start justify-start p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-taco-roja-strong"
          onClick={() => onSelect(restaurant.id)}
          type="button"
          unstyled
        >
          <span className="min-w-0 flex-1">
            <span className="block text-lg leading-tight font-bold tracking-[-0.02em]">
              {restaurant.name || "名前のないレストラン"}
            </span>
            <span className="mt-2 flex gap-1.5 text-sm leading-relaxed text-taco-muted">
              <svg
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0 text-taco-verde"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20 10c0 5-5.5 10.5-7.4 12.3a.9.9 0 0 1-1.2 0C9.5 20.5 4 15 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{restaurant.address}</span>
            </span>
            {restaurant.rate !== null ? (
              <span className="mt-2 flex items-center gap-2 text-sm text-taco-ink-soft">
                <span className="font-mono font-bold">{restaurant.rate} / 5</span>
              </span>
            ) : null}
            {restaurant.memo ? (
              <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-taco-ink-soft">
                {restaurant.memo}
              </span>
            ) : null}
          </span>
        </Button>
      </div>

      {imageUrl && !imageFailed ? (
        <dialog
          ref={photoPreviewDialogRef}
          aria-label="選択した写真のプレビュー"
          className="relative m-auto max-h-[70vh] max-w-[70vw] overflow-visible border-0 bg-transparent p-0 backdrop:bg-taco-ink/75"
          onClose={() => setIsPhotoPreviewOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
        >
          <img
            alt={`${restaurant.name || "名前のないレストラン"}の拡大プレビュー`}
            className="max-h-[70vh] max-w-[70vw] object-contain"
            src={imageUrl}
          />
          <Button
            aria-label="写真プレビューを閉じる"
            className="absolute top-2 right-2 z-10 grid size-10 place-items-center rounded-full border border-taco-border bg-taco-paper-bright text-2xl leading-none font-semibold text-taco-ink"
            onClick={() => photoPreviewDialogRef.current?.close()}
            type="button"
            unstyled
          >
            ×
          </Button>
        </dialog>
      ) : null}

      {mapsUrl ? (
        <a
          className="mx-3 mb-3 inline-flex min-h-9 items-center gap-1.5 border border-taco-tortilla/60 bg-taco-paper-bright px-2.5 text-sm font-semibold text-taco-ink-soft no-underline transition-colors hover:bg-taco-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taco-roja-strong"
          href={mapsUrl}
          onClick={(event) => {
            if (!onOpenLink) return;
            event.preventDefault();
            onOpenLink(mapsUrl);
          }}
          rel="noopener noreferrer"
          target="_blank"
        >
          Google Mapsで開く
          <svg
            aria-hidden="true"
            className="size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <path d="M14 3h7v7" />
            <path d="M10 14 21 3" />
            <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
          </svg>
        </a>
      ) : null}
    </article>
  );
}
