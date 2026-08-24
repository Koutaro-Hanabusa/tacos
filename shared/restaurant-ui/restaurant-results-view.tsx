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
    ? "grid min-w-0 grid-rows-[auto_22rem] bg-taco-paper md:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.6fr)]"
    : "grid h-full min-h-0 bg-taco-paper text-taco-ink lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.7fr)]";

  const asideClassName = embedded
    ? "bg-taco-surface"
    : "flex min-h-0 flex-col border-b border-taco-border/60 bg-taco-surface md:border-r md:border-b-0";

  const resultsClassName = embedded
    ? "space-y-2 p-3"
    : "min-h-0 flex-1 space-y-2 overflow-y-auto p-3";

  return (
    <main className={mainClassName}>
      <aside className={asideClassName}>
        <header className="px-5 py-5 border-b border-taco-border/60">
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="m-0 text-3xl leading-none font-extrabold tracking-[-0.04em]">
                {title}
              </h1>
              <p className="mt-3 mb-0 whitespace-pre-line text-sm leading-relaxed text-taco-muted">
                {description}
              </p>
            </div>
          </div>
        </header>

        <div aria-label="検索結果のレストラン" className={resultsClassName}>
          <div className="flex justify-end px-1 pb-1">
            <span
              aria-label={status === "ready" ? `${restaurants.length}件のレストラン` : undefined}
              className="inline-flex items-baseline gap-1 text-taco-muted"
            >
              {status === "ready" ? (
                <>
                  <span className="font-mono text-base leading-none font-bold text-taco-ink">
                    {restaurants.length}
                  </span>
                  <span className="text-xs leading-none font-semibold">件</span>
                </>
              ) : (
                <span className="font-mono text-base leading-none font-bold">—</span>
              )}
            </span>
          </div>

          {status === "loading" ? (
            <p className="m-0 grid min-h-52 place-items-center rounded-md border border-dashed border-taco-border/70 px-7 text-center text-xl font-bold">
              検索結果を待っています。
            </p>
          ) : null}

          {status === "error" ? (
            <p className="m-0 rounded-md border border-dashed border-taco-roja/60 bg-taco-paper-bright/70 px-3 py-3 text-sm leading-relaxed text-taco-roja-strong">
              {errorMessage || "検索結果を取得できませんでした。"}
            </p>
          ) : null}

          {status === "ready" && restaurants.length === 0 ? (
            <div className="grid min-h-52 place-items-center rounded-md border border-dashed border-taco-border/70 px-7 text-center">
              <div>
                <p className="m-0 text-xl font-bold">{emptyTitle}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-taco-muted">
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
