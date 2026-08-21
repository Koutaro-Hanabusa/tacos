import { LoaderCircle, MapPin, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRestaurantsQuery } from "@/features/restaurants/api/queries";
import { useRestaurantDeletion } from "@/features/restaurants/hooks/use-restaurant-deletion";

export function SavedRestaurantList() {
  const restaurantsQuery = useRestaurantsQuery();
  const restaurants = restaurantsQuery.data ?? [];
  const deletion = useRestaurantDeletion();

  return (
    <section className="border border-[#b86536]/55 bg-[#fff4dc] p-1 shadow-[8px_8px_0_rgb(116_45_19_/_0.28)] dark:border-[#8d4b2d] dark:bg-[#2a120a] dark:shadow-[8px_8px_0_rgb(0_0_0_/_0.38)]">
      <div className="border border-[#d39a60]/45 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-5 border-b border-[#d39a60]/45 pb-5 dark:border-[#754128]">
          <div>
            <p className="font-mono text-[0.65rem] font-bold tracking-[0.16em] text-[#a84322] uppercase dark:text-[#ff956b]">
              Saved places
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-[-0.05em]">
              登録済みのお店
            </h2>
          </div>
          <span className="border border-[#b86536]/45 bg-[#f2bd48] px-2 py-1 font-mono text-xs font-bold text-[#56210e] shadow-[2px_2px_0_rgb(87_32_13_/_0.25)]">
            {restaurants.length}
          </span>
        </div>

        <div className="mt-5">
          {restaurantsQuery.isPending ? (
            <div className="grid min-h-24 place-items-center text-[#8c573c] dark:text-[#d99c7a]">
              <LoaderCircle className="size-5 animate-spin" aria-label="登録済みの店を読み込み中" />
            </div>
          ) : null}

          {restaurantsQuery.isError ? (
            <p className="border border-dashed border-[#b54220]/50 p-3 text-xs leading-relaxed text-[#8a321b] dark:text-[#ffb192]">
              {restaurantsQuery.error.message}
            </p>
          ) : null}

          {!restaurantsQuery.isPending && !restaurantsQuery.isError && restaurants.length === 0 ? (
            <p className="border border-dashed border-[#b86536]/50 px-4 py-6 text-center text-xs leading-relaxed text-[#80513a] dark:text-[#c88f70]">
              まだ登録済みのお店はありません。
            </p>
          ) : null}

          <ul className="space-y-2">
            {restaurants.map((restaurant) => {
              const isDeleteConfirmationOpen = deletion.restaurantToDelete?.id === restaurant.id;

              return (
                <li
                  className="border border-[#b86536]/45 bg-[#fff9ec]/60 p-3 dark:border-[#754128] dark:bg-[#190904]/45"
                  key={restaurant.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg font-bold leading-tight tracking-[-0.03em]">
                        {restaurant.name}
                      </h3>
                      <p className="mt-1 flex gap-1.5 text-xs leading-relaxed text-[#70432c] dark:text-[#e1ae8a]">
                        <MapPin className="mt-0.5 size-3 shrink-0 text-[#b54220] dark:text-[#ff956b]" />
                        <span>{restaurant.address}</span>
                      </p>
                    </div>
                    {!isDeleteConfirmationOpen ? (
                      <Button
                        aria-label={`${restaurant.name}を削除する`}
                        className="h-8 shrink-0 border-[#b54220]/55 bg-transparent px-2 text-[#a84322] hover:bg-[#b54220]/10 dark:text-[#ff956b] dark:hover:bg-[#b54220]/20"
                        disabled={deletion.isDeleting}
                        onClick={() => deletion.requestDeletion(restaurant)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Trash2 className="size-3.5" />
                        削除
                      </Button>
                    ) : null}
                  </div>

                  {isDeleteConfirmationOpen ? (
                    <div
                      className="mt-3 border-l-2 border-[#b54220] bg-[#f2c85d]/20 px-3 py-3 text-xs dark:bg-[#b54220]/15"
                      role="alert"
                    >
                      <p className="font-bold">{restaurant.name}を削除しますか？</p>
                      <p className="mt-1 leading-relaxed text-[#70432c] dark:text-[#e1ae8a]">
                        削除すると、このお店と写真は一覧から取り除かれます。
                      </p>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          className="border-[#b86536]/55 bg-transparent text-[#70432c] hover:bg-[#f2c85d]/25 dark:text-[#e1ae8a] dark:hover:bg-[#b54220]/20"
                          disabled={deletion.isDeleting}
                          onClick={deletion.cancelDeletion}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          キャンセル
                        </Button>
                        <Button
                          className="border-[#9e2f1d] bg-[#b54220] text-[#fff7e8] shadow-[2px_2px_0_#6a250f] hover:bg-[#9e2f1d] dark:bg-[#e66539] dark:text-[#280d05] dark:hover:bg-[#f2794d]"
                          disabled={deletion.isDeleting}
                          onClick={deletion.confirmDeletion}
                          size="sm"
                          type="button"
                        >
                          {deletion.isDeleting ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          削除する
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
