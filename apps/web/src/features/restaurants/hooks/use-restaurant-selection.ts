import { useNavigate, useSearch } from "@tanstack/react-router";

import type { Restaurant } from "../api/client";

export function useRestaurantSelection(
  restaurants: Restaurant[],
  {
    fallbackToFirst = true,
    pageSize = 10,
    syncPage = false,
  }: { fallbackToFirst?: boolean; pageSize?: number; syncPage?: boolean } = {},
) {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });
  const requestedRestaurantId = search.restaurant;
  const selectedRestaurantId = restaurants.some(({ id }) => id === requestedRestaurantId)
    ? requestedRestaurantId
    : fallbackToFirst
      ? restaurants[0]?.id
      : undefined;

  function selectRestaurant(id: number) {
    void navigate({
      replace: true,
      search: (previous) => {
        const restaurantIndex = restaurants.findIndex(
          ({ id: restaurantId }) => restaurantId === id,
        );
        const page = restaurantIndex >= 0 ? Math.floor(restaurantIndex / pageSize) + 1 : undefined;

        return {
          ...previous,
          page: syncPage && page && page > 1 ? page : syncPage ? undefined : previous.page,
          restaurant: id,
        };
      },
    });
  }

  return {
    selectRestaurant,
    selectedRestaurantId,
  };
}
