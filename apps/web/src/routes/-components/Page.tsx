import { UtensilsCrossed } from "lucide-react";

import { useSuspenseRestaurantsQuery } from "@/features/restaurants/api/queries";
import { RestaurantListItem } from "@/features/restaurants/components/restaurant-list-item";
import { RestaurantMap } from "@/features/restaurants/components/restaurant-map";
import { useRestaurantSelection } from "@/features/restaurants/hooks/use-restaurant-selection";

export function HomePage() {
  const { data: restaurants } = useSuspenseRestaurantsQuery();
  const selection = useRestaurantSelection(restaurants);

  return (
    <main className="grid h-full min-h-0 bg-[#f8ead1] text-[#30170d] dark:bg-[#1b0c07] dark:text-[#fff0d7] lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.7fr)]">
      <aside className="flex min-h-0 flex-col border-b border-[#c7854b]/45 bg-[radial-gradient(circle_at_0_0,_rgb(255_238_196_/_0.9),_transparent_45%),linear-gradient(160deg,_#f8ead1,_#f1d4a1)] dark:border-[#743f27] dark:bg-[radial-gradient(circle_at_0_0,_rgb(162_63_30_/_0.22),_transparent_45%),linear-gradient(160deg,_#241008,_#150704)] lg:border-r lg:border-b-0">
        <div className="border-b border-[#c7854b]/45 px-5 py-5 dark:border-[#743f27]">
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold leading-none tracking-[-0.055em]">
                今日、どこで
                <br />
                タコスを食べる？
              </h1>
              <p className="mt-3 text-xs leading-relaxed text-[#70432c] dark:text-[#e1ae8a]">
                住所から保存した店を、地図と一緒に眺めるための小さな索引。
              </p>
            </div>
            <span className="border border-[#ad572e]/45 bg-[#f6c54b] px-2 py-1 font-mono text-xs font-bold text-[#54210d] shadow-[2px_2px_0_rgb(87_32_13_/_0.22)]">
              {restaurants.length}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {restaurants.length === 0 ? (
            <div className="grid min-h-52 place-items-center border border-dashed border-[#b86536]/50 px-7 text-center">
              <div>
                <UtensilsCrossed className="mx-auto size-6 text-[#b54220] dark:text-[#ff956b]" />
                <p className="mt-3 font-serif text-xl font-bold">まだ一軒もありません。</p>
                <p className="mt-2 text-xs leading-relaxed text-[#70432c] dark:text-[#e1ae8a]">
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

      <section className="relative min-h-[22rem] min-w-0 overflow-hidden bg-[#dfc092] dark:bg-[#271007]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-[linear-gradient(90deg,#bb4824_0_32%,#f2bd48_32%_63%,#3d7a5d_63%)]" />
        <RestaurantMap
          markers={selection.markers}
          onSelect={selection.selectRestaurant}
          selectedId={selection.selectedRestaurantId}
        />
      </section>
    </main>
  );
}
