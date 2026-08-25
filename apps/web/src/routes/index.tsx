import { createFileRoute } from "@tanstack/react-router";

import { restaurantsPageQueryOptions } from "@/features/restaurants/api/queries";

import { HomeError } from "./-components/fallbacks/HomeError";
import { HomePending } from "./-components/fallbacks/HomePending";
import { HomePage } from "./-components/Page";

type HomeSearch = {
  page?: number;
  restaurant?: number;
};

function parsePositiveInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function validateHomeSearch(search: Record<string, unknown>): HomeSearch {
  const page = parsePositiveInteger(search.page);
  const restaurant = parsePositiveInteger(search.restaurant);

  return {
    page: page && page > 1 ? page : undefined,
    restaurant,
  };
}

export const Route = createFileRoute("/")({
  validateSearch: validateHomeSearch,
  loaderDeps: ({ search }) => ({
    page: Math.max(0, (search.page ?? 1) - 1),
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(restaurantsPageQueryOptions(deps.page)),
  pendingComponent: HomePending,
  errorComponent: HomeError,
  component: HomePage,
});
