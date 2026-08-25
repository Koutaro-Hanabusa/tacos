import { useState } from "react";

import { RestaurantResultsView } from "@shared/restaurant-ui/restaurant";
import { RESTAURANT_PAGE_SIZE, useRestaurantsPageQuery } from "@/features/restaurants/api/queries";
import { useRestaurantSelection } from "@/features/restaurants/hooks/use-restaurant-selection";

export function HomePage() {
  const [requestedPage, setRequestedPage] = useState(0);
  const restaurantsQuery = useRestaurantsPageQuery(requestedPage);
  const page = restaurantsQuery.data ?? { page: requestedPage, restaurants: [], total: 0 };
  const selection = useRestaurantSelection(page.restaurants);

  return (
    <RestaurantResultsView
      description={`タコス大好きおじさんのぶりおによるタコスマップ。
行ってみてほしい店は、ヘッダーのGitHub Issuesから教えてください🌮`}
      emptyDescription="最初の店を記録すると、ここに写真と位置が並びます。"
      emptyTitle="まだ一軒もありません。"
      errorMessage={
        restaurantsQuery.error instanceof Error
          ? restaurantsQuery.error.message
          : "登録済みのお店を取得できませんでした。"
      }
      onSelect={selection.selectRestaurant}
      onPageChange={setRequestedPage}
      page={page.page}
      pageLoading={restaurantsQuery.isFetching && !restaurantsQuery.isError}
      pageSize={RESTAURANT_PAGE_SIZE}
      restaurants={page.restaurants}
      selectedId={selection.selectedRestaurantId}
      status={restaurantsQuery.isPending ? "loading" : restaurantsQuery.isError ? "error" : "ready"}
      title="全人類タコスを食え！！！！！！"
      totalCount={page.total}
    />
  );
}
