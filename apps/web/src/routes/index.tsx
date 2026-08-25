import { createFileRoute } from "@tanstack/react-router";

import { restaurantsPageQueryOptions } from "@/features/restaurants/api/queries";

import { HomeError } from "./-components/fallbacks/HomeError";
import { HomePending } from "./-components/fallbacks/HomePending";
import { HomePage } from "./-components/Page";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(restaurantsPageQueryOptions(0)),
  pendingComponent: HomePending,
  errorComponent: HomeError,
  component: HomePage,
});
