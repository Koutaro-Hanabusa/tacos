import { RestaurantResultsView } from "@shared/restaurant-ui/restaurant";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { RESTAURANT_PAGE_SIZE, useRestaurantsPageQuery } from "@/features/restaurants/api/queries";
import { useRestaurantSelection } from "@/features/restaurants/hooks/use-restaurant-selection";

export function HomePage() {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });
  const requestedPage = Math.max(0, (search.page ?? 1) - 1);
  const restaurantsQuery = useRestaurantsPageQuery(requestedPage);
  const page = restaurantsQuery.data ?? { page: requestedPage, restaurants: [], total: 0 };
  const selection = useRestaurantSelection(page.restaurants);

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
      onPageChange={setPage}
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
