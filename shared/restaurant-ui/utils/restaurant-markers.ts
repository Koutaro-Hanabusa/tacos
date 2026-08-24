import type { RestaurantMarker, RestaurantViewData } from "../types";

export function toRestaurantMarkers(restaurants: RestaurantViewData[]): RestaurantMarker[] {
  return restaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
  }));
}
