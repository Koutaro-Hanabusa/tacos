import { useEffect, useMemo, useRef } from "react";

import { Button } from "./button";
import { RestaurantListItem } from "./restaurant-list-item";
import { RestaurantMap } from "./restaurant-map";
import { toRestaurantMarkers } from "./utils/restaurant-markers";
import type { RestaurantResultsViewProps } from "./types";

export function RestaurantResultsView({
  restaurants,
  mapRestaurants,
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
  onClearSelection,
  totalCount,
  page = 0,
  pageSize = 10,
  onPageChange,
  pageLoading = false,
}: RestaurantResultsViewProps) {
  const markers = useMemo(
    () => toRestaurantMarkers(mapRestaurants ?? restaurants),
    [mapRestaurants, restaurants],
  );
  const selectedRestaurant = useMemo(
    () =>
      selectedId === undefined
        ? undefined
        : (mapRestaurants ?? restaurants).find(({ id }) => id === selectedId),
    [mapRestaurants, restaurants, selectedId],
  );
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resultsRef.current?.scrollTo({ top: 0 });
  }, [page]);

  const mainClassName = embedded
    ? "relative grid min-h-[640px] min-w-0 bg-taco-paper text-taco-ink"
    : "relative grid min-h-[calc(100svh-4rem)] min-w-0 bg-taco-paper text-taco-ink lg:h-[calc(100svh-4rem)] lg:min-h-0 lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.7fr)]";

  const asideClassName = embedded
    ? "hidden"
    : "hidden border-b border-taco-border/60 bg-taco-surface lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden lg:border-r lg:border-b-0";

  const resultsClassName = embedded
    ? "space-y-2 p-3 md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain"
    : "space-y-2 p-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain";
  const mapSectionClassName = embedded
    ? "relative h-[520px] min-h-[520px] min-w-0 overflow-hidden bg-taco-paper-bright"
    : "relative h-[calc(100svh-4rem)] min-h-[22rem] min-w-0 overflow-hidden bg-taco-paper-bright lg:h-auto";
  const headerClassName = "shrink-0 px-5 py-5 border-b border-taco-border/60";
  const pagerClassName = embedded ? "md:shrink-0" : "lg:shrink-0";
  const hasPageData = totalCount !== undefined;
  const totalPages = hasPageData ? Math.max(1, Math.ceil(totalCount / pageSize)) : 0;
  const hasPagination = Boolean(onPageChange && hasPageData && totalPages > 1);
  const firstVisibleResult = restaurants.length > 0 ? page * pageSize + 1 : 0;
  const lastVisibleResult = page * pageSize + restaurants.length;
  const countLabel = hasPageData
    ? restaurants.length > 0
      ? `${firstVisibleResult}–${lastVisibleResult} / ${totalCount}件`
      : `0 / ${totalCount}件`
    : `${restaurants.length}件`;
  const introContent = (
    <div className="mt-2 flex items-end justify-between gap-4">
      <div>
        <h1 className="m-0 text-3xl leading-none font-extrabold tracking-[-0.04em]">{title}</h1>
        <p className="mt-3 mb-0 whitespace-pre-line text-sm leading-relaxed text-taco-muted">
          {description}
        </p>
      </div>
    </div>
  );
  const mapMessageClassName = embedded
    ? "absolute inset-x-3 top-1/2 z-20 -translate-y-1/2 rounded-md border border-taco-border/70 bg-taco-surface/95 px-7 py-4 text-center"
    : "absolute inset-x-3 top-1/2 z-20 -translate-y-1/2 rounded-md border border-taco-border/70 bg-taco-surface/95 px-7 py-4 text-center lg:hidden";
  const mapIntroClassName = embedded
    ? "relative z-20 border-b border-taco-border/60 bg-taco-surface px-5 py-4"
    : "absolute inset-x-0 top-0 z-20 border-b border-taco-border/60 bg-taco-surface px-5 py-4 lg:hidden";
  const selectedCardClassName = embedded
    ? "absolute inset-x-3 bottom-3 z-20"
    : "absolute inset-x-3 bottom-3 z-20 lg:hidden";

  return (
    <main className={mainClassName}>
      <aside className={asideClassName}>
        <header className={headerClassName}>{introContent}</header>

        <div
          ref={resultsRef}
          aria-busy={pageLoading || undefined}
          aria-label="検索結果のレストラン"
          className={resultsClassName}
        >
          <div className="flex justify-end px-1 pb-1">
            <span
              aria-label={status === "ready" ? countLabel : undefined}
              className="inline-flex items-baseline gap-1 text-taco-muted"
            >
              {status === "ready" ? (
                <span className="font-mono text-xs leading-none font-bold text-taco-ink">
                  {countLabel}
                </span>
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

        {hasPagination ? (
          <nav
            aria-label="検索結果のページ"
            className={`flex items-center justify-between gap-2 border-t border-taco-border/60 bg-taco-surface px-3 py-3 ${pagerClassName}`}
          >
            <Button
              aria-label="前のページ"
              className="min-w-20 font-semibold"
              disabled={pageLoading || page <= 0}
              onClick={() => onPageChange?.(page - 1)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <span aria-hidden="true">←</span>
              前へ
            </Button>
            <span
              aria-live="polite"
              className="min-w-16 text-center font-mono text-xs font-bold text-taco-ink-soft"
            >
              {page + 1} / {totalPages}
            </span>
            <Button
              aria-label="次のページ"
              className="min-w-20 font-semibold"
              disabled={pageLoading || page >= totalPages - 1}
              onClick={() => onPageChange?.(page + 1)}
              size="sm"
              type="button"
              variant="secondary"
            >
              次へ
              <span aria-hidden="true">→</span>
            </Button>
          </nav>
        ) : null}
      </aside>

      <header className={mapIntroClassName}>{introContent}</header>

      <section className={mapSectionClassName}>
        <div className="taco-spectrum pointer-events-none absolute inset-x-0 top-0 z-10 h-1" />
        <RestaurantMap
          markers={markers}
          onOpenLink={onOpenLink}
          onSelect={onSelect}
          selectedId={selectedId}
        />
        {status !== "ready" || restaurants.length === 0 ? (
          <div
            aria-live="polite"
            className={mapMessageClassName}
            role={status === "error" ? "alert" : undefined}
          >
            {status === "loading" ? (
              <p className="m-0 text-xl font-bold">検索結果を待っています。</p>
            ) : status === "error" ? (
              <p className="m-0 text-sm leading-relaxed text-taco-roja-strong">
                {errorMessage || "検索結果を取得できませんでした。"}
              </p>
            ) : (
              <>
                <p className="m-0 text-xl font-bold">{emptyTitle}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-taco-muted">
                  {emptyDescription}
                </p>
              </>
            )}
          </div>
        ) : null}
        {selectedRestaurant ? (
          <div className={selectedCardClassName}>
            <RestaurantListItem
              onClose={onClearSelection}
              onOpenLink={onOpenLink}
              onSelect={onSelect}
              restaurant={selectedRestaurant}
              selected
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
