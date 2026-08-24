import { LoaderCircle, MapPin, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRestaurantsQuery } from "@/features/restaurants/api/queries";
import { useRestaurantDeletion } from "@/features/restaurants/hooks/use-restaurant-deletion";

export function SavedRestaurantList() {
  const restaurantsQuery = useRestaurantsQuery();
  const restaurants = restaurantsQuery.data ?? [];
  const deletion = useRestaurantDeletion();

  return (
    <section className="border border-taco-border bg-taco-surface p-1">
      <div className="border border-taco-border/60 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-5 border-b border-taco-border/60 pb-5">
          <div>
            <p className="font-mono text-[0.65rem] font-bold tracking-[0.16em] text-taco-roja-strong uppercase">
              Saved places
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-[-0.05em]">
              登録済みのお店
            </h2>
          </div>
          <span className="border border-taco-lime/60 bg-taco-lime px-2 py-1 font-mono text-xs font-bold text-taco-ink">
            {restaurants.length}
          </span>
        </div>

        <div className="mt-5">
          {restaurantsQuery.isPending ? (
            <div className="grid min-h-24 place-items-center text-taco-muted">
              <LoaderCircle className="size-5 animate-spin" aria-label="登録済みの店を読み込み中" />
            </div>
          ) : null}

          {restaurantsQuery.isError ? (
            <p className="border border-dashed border-taco-roja/60 p-3 text-xs leading-relaxed text-taco-roja-strong">
              {restaurantsQuery.error.message}
            </p>
          ) : null}

          {!restaurantsQuery.isPending && !restaurantsQuery.isError && restaurants.length === 0 ? (
            <p className="border border-dashed border-taco-border/70 px-4 py-6 text-center text-xs leading-relaxed text-taco-muted">
              まだ登録済みのお店はありません。
            </p>
          ) : null}

          <ul className="space-y-2">
            {restaurants.map((restaurant) => {
              const isDeleteConfirmationOpen = deletion.restaurantToDelete?.id === restaurant.id;

              return (
                <li
                  className="border border-taco-border/60 bg-taco-surface-raised/60 p-3"
                  key={restaurant.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold leading-tight tracking-[-0.03em]">
                        {restaurant.name}
                      </h3>
                      <p className="mt-1 flex gap-1.5 text-xs leading-relaxed text-taco-muted">
                        <MapPin className="mt-0.5 size-3 shrink-0 text-taco-verde" />
                        <span>{restaurant.address}</span>
                      </p>
                    </div>
                    {!isDeleteConfirmationOpen ? (
                      <Button
                        aria-label={`${restaurant.name}を削除する`}
                        className="h-8 shrink-0 border-taco-roja/60 bg-transparent px-2 text-taco-roja-strong hover:bg-taco-roja/10"
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
                      className="mt-3 border-l-2 border-taco-roja bg-taco-roja/10 px-3 py-3 text-xs"
                      role="alert"
                    >
                      <p className="font-bold">{restaurant.name}を削除しますか？</p>
                      <p className="mt-1 leading-relaxed text-taco-muted">
                        削除すると、このお店と写真は一覧から取り除かれます。
                      </p>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          className="border-taco-border bg-transparent text-taco-muted hover:bg-taco-surface-raised"
                          disabled={deletion.isDeleting}
                          onClick={deletion.cancelDeletion}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          キャンセル
                        </Button>
                        <Button
                          className="border-taco-roja-strong bg-taco-roja-strong text-taco-cream hover:bg-taco-roja"
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
