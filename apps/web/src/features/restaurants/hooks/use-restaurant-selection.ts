import { useNavigate, useSearch } from "@tanstack/react-router";

import type { Restaurant } from "../api/client";

export function useRestaurantSelection(restaurants: Restaurant[]) {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });
  const requestedRestaurantId = search.restaurant;
  const selectedRestaurantId = restaurants.some(({ id }) => id === requestedRestaurantId)
    ? requestedRestaurantId
    : restaurants[0]?.id;

  function selectRestaurant(id: number) {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, restaurant: id }),
    });
  }

  return {
    selectRestaurant,
    selectedRestaurantId,
  };
}
