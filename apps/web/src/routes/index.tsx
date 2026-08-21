import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { LoaderCircle, MapPin, Plus, UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { TacoMap, type MapMarker } from "@/components/taco-map";
import { cn } from "@/lib/utils";
import { listRestaurants, type Restaurant } from "@/lib/restaurants";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function hasCoordinates(
  restaurant: Restaurant,
): restaurant is Restaurant & { latitude: number; longitude: number } {
  return (
    typeof restaurant.latitude === "number" &&
    Number.isFinite(restaurant.latitude) &&
    typeof restaurant.longitude === "number" &&
    Number.isFinite(restaurant.longitude)
  );
}

function RestaurantThumbnail({ restaurant }: { restaurant: Restaurant }) {
  if (restaurant.photoUrl) {
    return (
      <img
        alt={`${restaurant.name}の写真`}
        className="h-20 w-20 shrink-0 border border-[#b86536]/30 object-cover shadow-[3px_3px_0_rgb(87_32_13_/_0.22)]"
        src={restaurant.photoUrl}
      />
    );
  }

  return (
    <div className="grid h-20 w-20 shrink-0 place-items-center border border-dashed border-[#b86536]/50 bg-[#efc15e]/25 font-serif text-2xl text-[#a53f1c] dark:bg-[#efc15e]/10">
      T
    </div>
  );
}

function HomeComponent() {
  const [selectedId, setSelectedId] = useState<number>();
  const restaurantsQuery = useQuery({
    queryKey: ["restaurants"],
    queryFn: listRestaurants,
  });
  const restaurants = restaurantsQuery.data ?? [];
  const markers = useMemo<MapMarker[]>(
    () =>
      restaurants.filter(hasCoordinates).map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      })),
    [restaurants],
  );

  useEffect(() => {
    if (markers.some((marker) => marker.id === selectedId)) return;
    setSelectedId(markers[0]?.id);
  }, [markers, selectedId]);

  return (
    <main className="grid h-full min-h-0 bg-[#f8ead1] text-[#30170d] dark:bg-[#1b0c07] dark:text-[#fff0d7] lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.7fr)]">
      <aside className="flex min-h-0 flex-col border-b border-[#c7854b]/45 bg-[radial-gradient(circle_at_0_0,_rgb(255_238_196_/_0.9),_transparent_45%),linear-gradient(160deg,_#f8ead1,_#f1d4a1)] dark:border-[#743f27] dark:bg-[radial-gradient(circle_at_0_0,_rgb(162_63_30_/_0.22),_transparent_45%),linear-gradient(160deg,_#241008,_#150704)] lg:border-r lg:border-b-0">
        <div className="border-b border-[#c7854b]/45 px-5 py-5 dark:border-[#743f27]">
          <p className="font-mono text-[0.66rem] font-bold tracking-[0.2em] text-[#b54220] uppercase dark:text-[#ff956b]">
            Taco index / 01
          </p>
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
          <Link
            className="mt-5 inline-flex items-center gap-2 border border-[#a84322] bg-[#b94825] px-3 py-2 text-xs font-bold text-[#fff7e8] shadow-[3px_3px_0_#6a250f] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f260f] dark:bg-[#e66539] dark:text-[#280d05]"
            to="/admin"
          >
            <Plus className="size-3.5" />
            店を記録する
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {restaurantsQuery.isPending ? (
            <div className="grid min-h-36 place-items-center text-[#8c573c] dark:text-[#d99c7a]">
              <LoaderCircle className="size-5 animate-spin" aria-label="読み込み中" />
            </div>
          ) : null}

          {restaurantsQuery.isError ? (
            <div className="border border-dashed border-[#b54220]/50 p-4 text-xs leading-relaxed text-[#8a321b] dark:text-[#ffb192]">
              {(restaurantsQuery.error as Error).message}
            </div>
          ) : null}

          {!restaurantsQuery.isPending && !restaurantsQuery.isError && restaurants.length === 0 ? (
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
            {restaurants.map((restaurant) => {
              const selected = restaurant.id === selectedId;

              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    "group flex w-full gap-3 border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a84322]",
                    selected
                      ? "border-[#a84322] bg-[#fff4dc] shadow-[3px_3px_0_rgb(135_51_24_/_0.28)] dark:bg-[#3b180d]"
                      : "border-[#c7854b]/40 bg-[#fdf1d7]/55 hover:border-[#a84322]/70 hover:bg-[#fff4dc] dark:border-[#743f27] dark:bg-[#2a120a]/60 dark:hover:bg-[#35170d]",
                  )}
                  key={restaurant.id}
                  onClick={() => setSelectedId(restaurant.id)}
                  type="button"
                >
                  <RestaurantThumbnail restaurant={restaurant} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-serif text-lg font-bold leading-tight tracking-[-0.03em]">
                        {restaurant.name}
                      </span>
                    </span>
                    <span className="mt-2 flex gap-1.5 text-xs leading-relaxed text-[#70432c] dark:text-[#e1ae8a]">
                      <MapPin className="mt-0.5 size-3 shrink-0 text-[#b54220] dark:text-[#ff956b]" />
                      <span>{restaurant.address}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="relative min-h-[22rem] min-w-0 overflow-hidden bg-[#dfc092] dark:bg-[#271007]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-[linear-gradient(90deg,#bb4824_0_32%,#f2bd48_32%_63%,#3d7a5d_63%)]" />
        <TacoMap markers={markers} onSelect={setSelectedId} selectedId={selectedId} />
      </section>
    </main>
  );
}
