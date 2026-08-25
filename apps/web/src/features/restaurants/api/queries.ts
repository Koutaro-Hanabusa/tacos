import { keepPreviousData, queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { listRestaurants, listRestaurantsPage } from "./client";

export const RESTAURANT_PAGE_SIZE = 10;

export const restaurantKeys = {
  all: ["restaurants"] as const,
};

export const restaurantsQueryOptions = queryOptions({
  queryKey: restaurantKeys.all,
  queryFn: listRestaurants,
});

export function restaurantsPageQueryOptions(page: number) {
  return queryOptions({
    queryKey: [...restaurantKeys.all, "page", page] as const,
    queryFn: async () => ({
      ...(await listRestaurantsPage({
        limit: RESTAURANT_PAGE_SIZE,
        offset: page * RESTAURANT_PAGE_SIZE,
      })),
      page,
    }),
    placeholderData: keepPreviousData,
  });
}

export function useRestaurantsQuery() {
  return useQuery(restaurantsQueryOptions);
}

export function useSuspenseRestaurantsQuery() {
  return useSuspenseQuery(restaurantsQueryOptions);
}

export function useRestaurantsPageQuery(page: number) {
  return useQuery(restaurantsPageQueryOptions(page));
}
