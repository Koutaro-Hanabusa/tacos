import { createFileRoute } from "@tanstack/react-router";

import { TacoMap } from "@/components/taco-map";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <TacoMap />;
}
