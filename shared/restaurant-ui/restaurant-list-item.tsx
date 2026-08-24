import { useState } from "react";

import type { RestaurantListItemProps } from "./types";
import { safeGoogleMapsUrl, safeHttpUrl } from "./utils/restaurant";

export function RestaurantListItem({
  restaurant,
  selected,
  onSelect,
  onOpenLink,
}: RestaurantListItemProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = safeHttpUrl(restaurant.photoUrl);
  const mapsUrl = safeGoogleMapsUrl(restaurant.googleMapsUrl);

  return (
    <article
      className={`place group w-full border transition-colors ${
        selected
          ? "border-taco-roja bg-taco-surface-raised"
          : "border-taco-border/60 bg-taco-surface/70 hover:border-taco-roja/70 hover:bg-taco-surface-raised"
      }`}
      data-id={restaurant.id}
    >
      <button
        aria-pressed={selected}
        className="place-select flex w-full gap-3 p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-taco-roja-strong"
        onClick={() => onSelect(restaurant.id)}
        type="button"
      >
        <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-taco-tortilla/30 bg-taco-tortilla/20 font-display text-xl font-bold text-taco-ink">
          {imageUrl && !imageFailed ? (
            <img
              alt={`${restaurant.name || "名前のないレストラン"}の写真`}
              className="size-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
              src={imageUrl}
            />
          ) : (
            <span aria-hidden="true">T</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg leading-tight font-bold tracking-[-0.03em]">
            {restaurant.name || "名前のないレストラン"}
          </span>
          <span className="mt-2 flex gap-1.5 text-xs leading-relaxed text-taco-muted">
            <svg
              aria-hidden="true"
              className="mt-0.5 size-3 shrink-0 text-taco-verde"
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
        </span>
      </button>

      {mapsUrl ? (
        <a
          className="mx-3 mb-3 inline-flex min-h-8 items-center border border-taco-tortilla/60 bg-taco-paper-bright px-2.5 text-[0.68rem] font-bold text-taco-ink-soft no-underline transition-colors hover:bg-taco-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taco-roja-strong"
          href={mapsUrl}
          onClick={(event) => {
            if (!onOpenLink) return;
            event.preventDefault();
            onOpenLink(mapsUrl);
          }}
          rel="noopener noreferrer"
          target="_blank"
        >
          Google Mapsで開く ↗
        </a>
      ) : null}
    </article>
  );
}
