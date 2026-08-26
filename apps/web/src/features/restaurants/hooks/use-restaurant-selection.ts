import { useNavigate, useSearch } from "@tanstack/react-router";

import type { Restaurant } from "../api/client";

export function useRestaurantSelection(
  restaurants: Restaurant[],
  {
    allRestaurants = restaurants,
    pageSize = 10,
    syncPage = false,
  }: {
    allRestaurants?: Restaurant[];
    pageSize?: number;
    syncPage?: boolean;
  } = {},
) {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });
  const requestedRestaurantId = search.restaurant;
  const selectedRestaurantId = allRestaurants.some(({ id }) => id === requestedRestaurantId)
    ? requestedRestaurantId
    : undefined;

  function selectRestaurant(id: number) {
    void navigate({
      replace: true,
      search: (previous) => {
        const restaurantIndex = allRestaurants.findIndex(
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
