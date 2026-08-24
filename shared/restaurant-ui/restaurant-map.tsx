import { useRef } from "react";

import { useRestaurantMap } from "./hooks/use-restaurant-map";
import type { RestaurantMapProps } from "./types";

export function RestaurantMap({ markers, selectedId, onSelect, onOpenLink }: RestaurantMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { mapFailed } = useRestaurantMap({
    containerRef: mapContainerRef,
    markers,
    onOpenLink,
    onSelect,
    selectedId,
  });

  return (
    <div className="relative h-full min-h-[22rem] w-full">
      <div ref={mapContainerRef} className="taco-map absolute inset-0 size-full" />
      {mapFailed ? (
        <p className="absolute inset-0 m-0 grid place-items-center bg-taco-paper-bright/80 px-8 text-center text-sm leading-relaxed text-taco-muted">
          地図を表示できません。
        </p>
      ) : null}
    </div>
  );
}
