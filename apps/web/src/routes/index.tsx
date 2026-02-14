import { createFileRoute } from "@tanstack/react-router";

import { TacoMap } from "@/components/taco-map";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex h-screen flex-row">
      <div className="w-[30%]">何かしら</div>
      <div className="flex-1">
        <TacoMap />
      </div>
    </div>
  );
}
