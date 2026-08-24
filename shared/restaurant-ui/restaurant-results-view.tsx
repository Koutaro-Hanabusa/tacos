import { useMemo } from "react";

import { RestaurantListItem } from "./restaurant-list-item";
import { RestaurantMap } from "./restaurant-map";
import { toRestaurantMarkers } from "./utils/restaurant-markers";
import type { RestaurantResultsViewProps } from "./types";

export function RestaurantResultsView({
  restaurants,
  selectedId,
  onSelect,
  title,
  description,
  emptyTitle,
  emptyDescription,
  status = "ready",
  errorMessage,
  embedded = false,
  onOpenLink,
}: RestaurantResultsViewProps) {
  const markers = useMemo(() => toRestaurantMarkers(restaurants), [restaurants]);

  const mainClassName = embedded
    ? "grid h-[40rem] min-w-0 grid-rows-[minmax(18rem,1fr)_22rem] overflow-hidden bg-taco-paper md:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.6fr)] md:grid-rows-1"
    : "grid h-full min-h-0 bg-taco-paper text-taco-ink lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.7fr)]";

  return (
    <main className={mainClassName}>
      <aside className="flex min-h-0 flex-col border-b border-taco-border/60 bg-taco-surface md:border-r md:border-b-0">
        <header className="border-b border-taco-border/60 px-5 py-5">
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="m-0 font-display text-3xl leading-none font-bold tracking-[-0.055em]">
                {title}
              </h1>
              <p className="mt-3 mb-0 text-xs leading-relaxed text-taco-muted">{description}</p>
            </div>
            <span
              aria-label={status === "ready" ? `${restaurants.length}件のレストラン` : undefined}
              className="border border-taco-lime/60 bg-taco-lime px-2 py-1 font-mono text-xs font-bold text-taco-ink"
            >
              {status === "ready" ? restaurants.length : "—"}
            </span>
          </div>
        </header>

        <div
          aria-label="検索結果のレストラン"
          className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3"
        >
          {status === "loading" ? (
            <p className="m-0 grid min-h-52 place-items-center border border-dashed border-taco-border/70 px-7 text-center font-display text-xl font-bold">
              検索結果を待っています。
            </p>
          ) : null}

          {status === "error" ? (
            <p className="m-0 border border-dashed border-taco-roja/60 bg-taco-paper-bright/70 px-3 py-3 text-xs leading-relaxed text-taco-roja-strong">
              {errorMessage || "検索結果を取得できませんでした。"}
            </p>
          ) : null}

          {status === "ready" && restaurants.length === 0 ? (
            <div className="grid min-h-52 place-items-center border border-dashed border-taco-border/70 px-7 text-center">
              <div>
                <p className="m-0 font-display text-xl font-bold">{emptyTitle}</p>
                <p className="mt-2 mb-0 text-xs leading-relaxed text-taco-muted">
                  {emptyDescription}
                </p>
              </div>
            </div>
          ) : null}

          {status === "ready" && restaurants.length > 0
            ? restaurants.map((restaurant) => (
                <RestaurantListItem
                  key={restaurant.id}
                  onOpenLink={onOpenLink}
                  onSelect={onSelect}
                  restaurant={restaurant}
                  selected={restaurant.id === selectedId}
                />
              ))
            : null}
        </div>
      </aside>

      <section className="relative min-h-[22rem] min-w-0 overflow-hidden bg-taco-paper-bright">
        <div className="taco-spectrum pointer-events-none absolute inset-x-0 top-0 z-10 h-1" />
        <RestaurantMap
          markers={markers}
          onOpenLink={onOpenLink}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      </section>
    </main>
  );
}
