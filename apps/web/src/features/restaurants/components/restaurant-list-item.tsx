import { MapPin } from "lucide-react";

import type { Restaurant } from "@/features/restaurants/api/client";

import { cn } from "@/lib/utils";

interface Props {
  restaurant: Restaurant;
  selected: boolean;
  onSelect: (id: number) => void;
}

export function RestaurantListItem({ restaurant, selected, onSelect }: Props) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "group flex w-full gap-3 border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taco-roja-strong",
        selected
          ? "border-taco-roja bg-taco-surface-raised"
          : "border-taco-border/60 bg-taco-surface/70 hover:border-taco-roja/70 hover:bg-taco-surface-raised",
      )}
      onClick={() => onSelect(restaurant.id)}
      type="button"
    >
      <img
        alt={`${restaurant.name}の写真`}
        className="h-20 w-20 shrink-0 border border-taco-tortilla/30 object-cover"
        src={restaurant.photoUrl}
      />
      <span className="min-w-0 flex-1">
        <span className="font-display text-lg font-bold leading-tight tracking-[-0.03em]">
          {restaurant.name}
        </span>
        <span className="mt-2 flex gap-1.5 text-xs leading-relaxed text-taco-muted">
          <MapPin className="mt-0.5 size-3 shrink-0 text-taco-verde" />
          <span>{restaurant.address}</span>
        </span>
      </span>
    </button>
  );
}
