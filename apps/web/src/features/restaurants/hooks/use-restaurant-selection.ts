import { useMemo, useState } from "react";

import type { Restaurant } from "../api/client";
import type { RestaurantMarker } from "../components/restaurant-map";

export function useRestaurantSelection(restaurants: Restaurant[]) {
  const [requestedRestaurantId, setRequestedRestaurantId] = useState<number>();
  const markers = useMemo<RestaurantMarker[]>(
    () =>
      restaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      })),
    [restaurants],
  );
  const selectedRestaurantId = markers.some(({ id }) => id === requestedRestaurantId)
    ? requestedRestaurantId
    : markers[0]?.id;

  return {
    markers,
    selectRestaurant: setRequestedRestaurantId,
    selectedRestaurantId,
  };
}
