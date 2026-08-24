import { RestaurantResultsView } from "@shared/restaurant-ui/restaurant";
import { useSuspenseRestaurantsQuery } from "@/features/restaurants/api/queries";
import { useRestaurantSelection } from "@/features/restaurants/hooks/use-restaurant-selection";

export function HomePage() {
  const { data: restaurants } = useSuspenseRestaurantsQuery();
  const selection = useRestaurantSelection(restaurants);

  return (
    <RestaurantResultsView
      description="タコス大好きおじさんのぶりおによるタコスマップ"
      emptyDescription="最初の店を記録すると、ここに写真と位置が並びます。"
      emptyTitle="まだ一軒もありません。"
      onSelect={selection.selectRestaurant}
      restaurants={restaurants}
      selectedId={selection.selectedRestaurantId}
      title="全人類タコスを食え！！！！！！"
    />
  );
}
