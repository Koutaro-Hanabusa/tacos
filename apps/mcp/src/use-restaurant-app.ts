import { PostMessageTransport, type App } from "@modelcontextprotocol/ext-apps";
import { useCallback, useEffect, useState } from "react";

import { applyRestaurantHostContext } from "./restaurant-app-host";
import {
  initialRestaurantAppView,
  normalizeRestaurantResult,
  restaurantResultError,
  type RestaurantAppViewState,
} from "./restaurant-app-data";

export function useRestaurantApp(app: App) {
  const [view, setView] = useState<RestaurantAppViewState>(initialRestaurantAppView);
  const selectRestaurant = useCallback((id: number) => {
    setView((current) => ({ ...current, selectedId: id }));
  }, []);
  const openLink = useCallback(
    (url: string) => {
      void app.openLink({ url }).catch(() => undefined);
    },
    [app],
  );

  useEffect(() => {
    app.ontoolinput = () => {
      setView({ status: "loading", restaurants: [] });
    };

    app.ontoolresult = (result) => {
      if (result.isError) {
        setView({
          status: "error",
          restaurants: [],
          errorMessage: restaurantResultError(result),
        });
        return;
      }

      const restaurants = normalizeRestaurantResult(result);
      setView({
        status: "ready",
        restaurants,
        selectedId: restaurants[0]?.id,
      });
    };

    app.onhostcontextchanged = (context) => applyRestaurantHostContext(context);
    app.onteardown = () => ({});

    void app
      .connect(new PostMessageTransport(window.parent, window.parent))
      .then(() => applyRestaurantHostContext(app.getHostContext()))
      .catch((error: unknown) => {
        setView({
          status: "error",
          restaurants: [],
          errorMessage:
            "接続に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"),
        });
      });

    return () => {
      app.ontoolinput = undefined;
      app.ontoolresult = undefined;
      app.onhostcontextchanged = undefined;
      app.onteardown = undefined;
    };
  }, [app]);

  return { ...view, openLink, selectRestaurant };
}
