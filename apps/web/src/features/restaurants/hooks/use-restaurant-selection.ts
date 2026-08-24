import { useState } from "react";

import type { Restaurant } from "../api/client";

export function useRestaurantSelection(restaurants: Restaurant[]) {
  const [requestedRestaurantId, setRequestedRestaurantId] = useState<number>();
  const selectedRestaurantId = restaurants.some(({ id }) => id === requestedRestaurantId)
    ? requestedRestaurantId
    : restaurants[0]?.id;

  return {
    selectRestaurant: setRequestedRestaurantId,
    selectedRestaurantId,
  };
}
