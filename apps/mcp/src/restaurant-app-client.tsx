import { App } from "@modelcontextprotocol/ext-apps";
import { createRoot } from "react-dom/client";

import { RestaurantResultsView } from "../../../shared/restaurant-ui/restaurant";
import { useRestaurantApp } from "./use-restaurant-app";

function McpAppBridge({ app }: { app: App }) {
  const view = useRestaurantApp(app);

  return (
    <RestaurantResultsView
      description="会話で指定した条件に合うタコス店を、写真・一覧・地図で確認できます。"
      emptyDescription="店名や地域を変えて、もう一度検索を依頼してください。"
      emptyTitle="条件に合う店はありません。"
      embedded
      errorMessage={view.errorMessage}
      onOpenLink={view.openLink}
      onSelect={view.selectRestaurant}
      restaurants={view.restaurants}
      selectedId={view.selectedId}
      status={view.status}
      title="タコス店の検索結果"
    />
  );
}

const mount = document.getElementById("app");
if (!mount) throw new Error("MCP App mount element was not found");

const app = new App({ name: "Tacos restaurant map", version: "0.1.0" });
createRoot(mount).render(<McpAppBridge app={app} />);
