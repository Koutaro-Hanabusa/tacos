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
        "group flex w-full gap-3 border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a84322]",
        selected
          ? "border-[#a84322] bg-[#fff4dc] shadow-[3px_3px_0_rgb(135_51_24_/_0.28)] dark:bg-[#3b180d]"
          : "border-[#c7854b]/40 bg-[#fdf1d7]/55 hover:border-[#a84322]/70 hover:bg-[#fff4dc] dark:border-[#743f27] dark:bg-[#2a120a]/60 dark:hover:bg-[#35170d]",
      )}
      onClick={() => onSelect(restaurant.id)}
      type="button"
    >
      <img
        alt={`${restaurant.name}の写真`}
        className="h-20 w-20 shrink-0 border border-[#b86536]/30 object-cover shadow-[3px_3px_0_rgb(87_32_13_/_0.22)]"
        src={restaurant.photoUrl}
      />
      <span className="min-w-0 flex-1">
        <span className="font-serif text-lg font-bold leading-tight tracking-[-0.03em]">
          {restaurant.name}
        </span>
        <span className="mt-2 flex gap-1.5 text-xs leading-relaxed text-[#70432c] dark:text-[#e1ae8a]">
          <MapPin className="mt-0.5 size-3 shrink-0 text-[#b54220] dark:text-[#ff956b]" />
          <span>{restaurant.address}</span>
        </span>
      </span>
    </button>
  );
}
