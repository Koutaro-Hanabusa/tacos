import { createFileRoute } from "@tanstack/react-router";

import { restaurantsQueryOptions } from "@/features/restaurants/api/queries";

import { HomeError } from "./-components/fallbacks/HomeError";
import { HomePending } from "./-components/fallbacks/HomePending";
import { HomePage } from "./-components/Page";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(restaurantsQueryOptions),
  pendingComponent: HomePending,
  errorComponent: HomeError,
  component: HomePage,
});
