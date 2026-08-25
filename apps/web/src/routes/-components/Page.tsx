import { RestaurantResultsView } from "@shared/restaurant-ui/restaurant";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  RESTAURANT_PAGE_SIZE,
  useRestaurantsMapQuery,
  useRestaurantsPageQuery,
} from "@/features/restaurants/api/queries";
import { useRestaurantSelection } from "@/features/restaurants/hooks/use-restaurant-selection";
import { useMediaQuery } from "@/hooks/use-media-query";

export function HomePage() {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });
  const requestedPage = Math.max(0, (search.page ?? 1) - 1);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const pageQuery = useRestaurantsPageQuery(requestedPage);
  const mapQuery = useRestaurantsMapQuery(isMobile);
  const page = pageQuery.data ?? { page: requestedPage, restaurants: [], total: 0 };
  const restaurants = isMobile ? (mapQuery.data?.restaurants ?? []) : page.restaurants;
  const total = isMobile ? (mapQuery.data?.total ?? 0) : page.total;
  const activeQuery = isMobile ? mapQuery : pageQuery;
  const selection = useRestaurantSelection(restaurants, {
    fallbackToFirst: true,
    pageSize: RESTAURANT_PAGE_SIZE,
    syncPage: isMobile,
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
        activeQuery.error instanceof Error
          ? activeQuery.error.message
          : "登録済みのお店を取得できませんでした。"
      }
      onClearSelection={isMobile ? clearSelection : undefined}
      onSelect={selection.selectRestaurant}
      onPageChange={isMobile ? undefined : setPage}
      page={page.page}
      pageLoading={activeQuery.isFetching && !activeQuery.isError}
      pageSize={RESTAURANT_PAGE_SIZE}
      restaurants={restaurants}
      selectedId={selection.selectedRestaurantId}
      status={activeQuery.isPending ? "loading" : activeQuery.isError ? "error" : "ready"}
      title="全人類タコスを食え！！！！！！"
      totalCount={isMobile ? undefined : total}
    />
  );
}
