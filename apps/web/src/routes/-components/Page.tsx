import { UtensilsCrossed } from "lucide-react";

import { useSuspenseRestaurantsQuery } from "@/features/restaurants/api/queries";
import { RestaurantListItem } from "@/features/restaurants/components/restaurant-list-item";
import { RestaurantMap } from "@/features/restaurants/components/restaurant-map";
import { useRestaurantSelection } from "@/features/restaurants/hooks/use-restaurant-selection";

export function HomePage() {
  const { data: restaurants } = useSuspenseRestaurantsQuery();
  const selection = useRestaurantSelection(restaurants);

  return (
    <main className="grid h-full min-h-0 bg-taco-paper text-taco-ink lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.7fr)]">
      <aside className="flex min-h-0 flex-col border-b border-taco-border/60 bg-taco-surface lg:border-r lg:border-b-0">
        <div className="border-b border-taco-border/60 px-5 py-5">
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold leading-none tracking-[-0.055em]">
                今日、どこで
                <br />
                タコスを食べる？
              </h1>
              <p className="mt-3 text-xs leading-relaxed text-taco-muted">
                住所から保存した店を、地図と一緒に眺めるための小さな索引。
              </p>
            </div>
            <span className="border border-taco-lime/60 bg-taco-lime px-2 py-1 font-mono text-xs font-bold text-taco-ink">
              {restaurants.length}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {restaurants.length === 0 ? (
            <div className="grid min-h-52 place-items-center border border-dashed border-taco-border/70 px-7 text-center">
              <div>
                <UtensilsCrossed className="mx-auto size-6 text-taco-roja-strong" />
                <p className="mt-3 font-display text-xl font-bold">まだ一軒もありません。</p>
                <p className="mt-2 text-xs leading-relaxed text-taco-muted">
                  最初の店を記録すると、ここに写真と位置が並びます。
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            {restaurants.map((restaurant) => (
              <RestaurantListItem
                key={restaurant.id}
                onSelect={selection.selectRestaurant}
                restaurant={restaurant}
                selected={restaurant.id === selection.selectedRestaurantId}
              />
            ))}
          </div>
        </div>
      </aside>

      <section className="relative min-h-[22rem] min-w-0 overflow-hidden bg-taco-surface-raised">
        <div className="taco-spectrum pointer-events-none absolute inset-x-0 top-0 z-10 h-1" />
        <RestaurantMap
          markers={selection.markers}
          onSelect={selection.selectRestaurant}
          selectedId={selection.selectedRestaurantId}
        />
      </section>
    </main>
  );
}
