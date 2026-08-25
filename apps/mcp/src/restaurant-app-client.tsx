import { App } from "@modelcontextprotocol/ext-apps";
import { createRoot } from "react-dom/client";

import { RestaurantResultsView } from "../../../shared/restaurant-ui/restaurant";
import { useRestaurantApp } from "./use-restaurant-app";

function McpAppBridge({ app }: { app: App }) {
  const view = useRestaurantApp(app);

  return (
    <RestaurantResultsView
      description="タコス大好きおじさんのぶりおによるタコスマップMCP"
      emptyDescription="検索条件を変えると、ここに写真と位置が並びます。"
      emptyTitle="条件に合う店はありません。"
      embedded
      errorMessage={view.errorMessage}
      onClearSelection={view.clearSelection}
      onOpenLink={view.openLink}
      onSelect={view.selectRestaurant}
      restaurants={view.restaurants}
      selectedId={view.selectedId}
      status={view.status}
      title="検索結果"
    />
  );
}

const mount = document.getElementById("app");
if (!mount) throw new Error("MCP App mount element was not found");

const app = new App({ name: "Tacos restaurant map", version: "0.1.0" });
createRoot(mount).render(<McpAppBridge app={app} />);
