import { RestaurantResultsView } from "@shared/restaurant-ui/restaurant";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  RESTAURANT_PAGE_SIZE,
  useRestaurantsMapQuery,
  useRestaurantsPageQuery,
} from "@/features/restaurants/api/queries";
import { useRestaurantSelection } from "@/features/restaurants/hooks/use-restaurant-selection";

export function HomePage() {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });
  const requestedPage = Math.max(0, (search.page ?? 1) - 1);
  const pageQuery = useRestaurantsPageQuery(requestedPage);
  const mapQuery = useRestaurantsMapQuery();
  const page = pageQuery.data ?? { page: requestedPage, restaurants: [], total: 0 };
  const mapRestaurants = mapQuery.data?.restaurants ?? page.restaurants;
  const selection = useRestaurantSelection(page.restaurants, {
    allRestaurants: mapRestaurants,
    pageSize: RESTAURANT_PAGE_SIZE,
    syncPage: true,
  });

  function setPage(nextPage: number) {
    void navigate({
      replace: true,
      search: (previous) => ({
        ...previous,
        page: nextPage > 0 ? nextPage + 1 : undefined,
        restaurant: undefined,
      }),
    });
  }

  function clearSelection() {
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, restaurant: undefined }),
    });
  }

  return (
    <RestaurantResultsView
      description={`タコス大好きおじさんのぶりおによるタコスマップ。
行ってみてほしい店は、ヘッダーのGitHub Issuesから教えてください🌮`}
      emptyDescription="最初の店を記録すると、ここに写真と位置が並びます。"
      emptyTitle="まだ一軒もありません。"
      errorMessage={
        pageQuery.error instanceof Error
          ? pageQuery.error.message
          : "登録済みのお店を取得できませんでした。"
      }
      mapRestaurants={mapRestaurants}
      onClearSelection={clearSelection}
      onSelect={selection.selectRestaurant}
      onPageChange={setPage}
      page={page.page}
      pageLoading={pageQuery.isFetching && !pageQuery.isError}
      pageSize={RESTAURANT_PAGE_SIZE}
      restaurants={page.restaurants}
      selectedId={selection.selectedRestaurantId}
      status={pageQuery.isPending ? "loading" : pageQuery.isError ? "error" : "ready"}
      title="全人類タコスを食え！！！！！！"
      totalCount={page.total}
    />
  );
}
