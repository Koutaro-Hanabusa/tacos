import { RestaurantResultsView } from "@shared/restaurant-ui/restaurant";
import { useSuspenseRestaurantsQuery } from "@/features/restaurants/api/queries";
import { useRestaurantSelection } from "@/features/restaurants/hooks/use-restaurant-selection";

export function HomePage() {
  const { data: restaurants } = useSuspenseRestaurantsQuery();
  const selection = useRestaurantSelection(restaurants);

  return (
    <RestaurantResultsView
      description="住所から保存した店を、地図と一緒に眺めるための小さな索引。"
      emptyDescription="最初の店を記録すると、ここに写真と位置が並びます。"
      emptyTitle="まだ一軒もありません。"
      eyebrow="Taco index / saved places"
      onSelect={selection.selectRestaurant}
      restaurants={restaurants}
      selectedId={selection.selectedRestaurantId}
      title={
        <>
          今日、どこで
          <br />
          タコスを食べる？
        </>
      }
    />
  );
}
