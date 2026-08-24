import type { ReactNode } from "react";

export interface RestaurantViewData {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  photoUrl: string;
}

export interface RestaurantMarker {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export type RestaurantViewStatus = "loading" | "ready" | "error";

export interface RestaurantMapProps {
  markers: RestaurantMarker[];
  selectedId?: number;
  onSelect: (id: number) => void;
  onOpenLink?: (url: string) => void;
}

export interface RestaurantListItemProps {
  restaurant: RestaurantViewData;
  selected: boolean;
  onSelect: (id: number) => void;
  onOpenLink?: (url: string) => void;
}

export interface RestaurantResultsViewProps {
  restaurants: RestaurantViewData[];
  selectedId?: number;
  onSelect: (id: number) => void;
  title: ReactNode;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  status?: RestaurantViewStatus;
  errorMessage?: string;
  embedded?: boolean;
  onOpenLink?: (url: string) => void;
}
