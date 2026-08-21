import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { listRestaurants } from "./client";

export const restaurantKeys = {
  all: ["restaurants"] as const,
};

export const restaurantsQueryOptions = queryOptions({
  queryKey: restaurantKeys.all,
  queryFn: listRestaurants,
});

export function useRestaurantsQuery() {
  return useQuery(restaurantsQueryOptions);
}

export function useSuspenseRestaurantsQuery() {
  return useSuspenseQuery(restaurantsQueryOptions);
}
