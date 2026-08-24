import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vite-plus/test";

function source(name: string) {
  return readFileSync(resolve(import.meta.dirname, name), "utf8");
}

describe("restaurant MCP App", () => {
  test("keeps the MCP resource module focused on serving the built app", () => {
    const resource = source("./restaurant-app.ts");

    expect(resource).toContain("ui://tacos/restaurant-map-v8.html");
    expect(resource).toContain("../dist/app/restaurant-app.js");
    expect(resource).not.toContain("<style>");
    expect(resource).not.toContain("<script");
  });

  test("uses local source modules and bundles external JavaScript and CSS", () => {
    const html = source("./restaurant-app.html");
    const client = source("./restaurant-app-client.tsx");
    const bridge = source("./use-restaurant-app.ts");
    const data = source("./restaurant-app-data.ts");
    const shared = source("../../../shared/restaurant-ui/restaurant.tsx");
    const sharedMap = source("../../../shared/restaurant-ui/restaurant-map.tsx");
    const sharedMapHook = source("../../../shared/restaurant-ui/hooks/use-restaurant-map.ts");
    const sharedListItem = source("../../../shared/restaurant-ui/restaurant-list-item.tsx");
    const sharedUtils = source("../../../shared/restaurant-ui/utils/restaurant.ts");
    const sharedResults = source("../../../shared/restaurant-ui/restaurant-results-view.tsx");
    const sharedCss = source("../../../shared/restaurant-ui/restaurant.css");
    const webCss = source("../../../apps/web/src/index.css");
    const css = source("./restaurant-app.css");
    const viteConfig = source("../vite.app.config.ts");

    expect(html).toContain('href="./restaurant-app.css"');
    expect(html).toContain('src="./restaurant-app-client.tsx"');
    expect(html).not.toContain("https://esm.sh");
    expect(html).not.toContain("https://cdn.jsdelivr.net");
    expect(html).toContain('id="app"');
    expect(html).toContain('data-tacos-rendered="false"');
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("GOOGLE_MAPS_EMBED_API_KEY");
    expect(html).not.toContain('id="map"');
    expect(html).not.toContain("Taco index / result");
    expect(client).toContain('from "@modelcontextprotocol/ext-apps"');
    expect(client).toContain('from "react-dom/client"');
    expect(client).toContain('from "../../../shared/restaurant-ui/restaurant"');
    expect(client).toContain('from "./use-restaurant-app"');
    expect(client).not.toContain("app.callServerTool");
    expect(client).not.toContain('"restaurant_search"');
    expect(client).not.toContain('"restaurant_list"');
    expect(client).toContain("RestaurantResultsView");
    expect(client).not.toContain('document.createElement("article")');
    expect(bridge).toContain("app.ontoolresult");
    expect(bridge).toContain("app.getHostContext()");
    expect(bridge).toContain("result.isError");
    expect(bridge).toContain("app.openLink");
    expect(bridge).toContain("PostMessageTransport");
    expect(data).toContain("normalizeRestaurantResult");
    expect(data).toContain("restaurantResultError");
    expect(shared).toContain('export { RestaurantResultsView } from "./restaurant-results-view"');
    expect(shared).toContain("export {\n  Button,");
    expect(shared).toContain('export { RestaurantMap } from "./restaurant-map"');
    expect(shared).toContain("export { safeGoogleMapsUrl, safeHttpUrl, textValue }");
    expect(sharedResults).toContain("export function RestaurantResultsView");
    expect(sharedMap).toContain("useRestaurantMap");
    expect(sharedMapHook).toContain('import("maplibre-gl")');
    expect(sharedMapHook).toContain("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
    expect(sharedMapHook).toContain("fitBounds");
    expect(sharedMapHook).toContain("flyTo");
    expect(sharedMapHook).toContain('element.className = "restaurant-map-marker"');
    expect(sharedListItem).toContain("safeGoogleMapsUrl");
    expect(sharedListItem).toContain('import { Button } from "./button"');
    expect(sharedListItem).toContain("Google Mapsで開く");
    expect(sharedListItem).not.toContain("↗");
    expect(sharedListItem).not.toContain("<button");
    expect(sharedListItem).toContain("<dialog");
    expect(sharedListItem).toContain("dialog.showModal()");
    expect(sharedListItem).toContain("写真プレビューを閉じる");
    expect(sharedUtils).toContain("safeHttpUrl");
    expect(sharedUtils).toContain("safeGoogleMapsUrl");
    expect(css).toContain('@import "tailwindcss"');
    expect(css).toContain('@import "../../../shared/restaurant-ui/restaurant.css"');
    expect(webCss).toContain('@import "../../../shared/restaurant-ui/restaurant.css"');
    expect(sharedCss).toContain(".restaurant-map-marker");
    expect(sharedCss).toContain(".taco-button");
    expect(sharedCss).toContain("--taco-roja");
    expect(sharedCss).toContain("--taco-lime");
    expect(sharedCss).toContain('@source "./"');
    expect(sharedCss).not.toContain("box-shadow");
    expect(sharedCss).not.toContain("color-scheme: light dark");
    expect(client).not.toContain("dark:");
    expect(client).not.toContain("shadow-");
    expect(viteConfig).toContain('from "@tailwindcss/vite"');
    expect(viteConfig).toContain("tailwindcss()");
  });

  test("allows OpenStreetMap tiles without external frames or API-key injection", () => {
    const server = source("./index.ts");

    expect(server).toContain('connectDomains: ["https://tile.openstreetmap.org"]');
    expect(server).toContain(
      'resourceDomains: ["https://tile.openstreetmap.org", new URL(photoUrlBase).origin, "data:"]',
    );
    expect(server).toContain("_meta: { ui: appResourceMeta }");
    expect(server).toContain("_meta: { ...appResourceMeta, ui: appResourceMeta }");
    expect(server).not.toContain("frameDomains");
    expect(server).toContain("restaurantAppHtml");
    expect(server).not.toContain("WorkerLoader");
    expect(server).not.toContain("GOOGLE_MAPS_EMBED_API_KEY");
  });

  test("keeps MCP rendering on the shared client bundle", () => {
    const infra = source("../../../packages/infra/alchemy.run.ts");
    const scripts = source("../../../packages/infra/package.json");

    expect(infra).not.toContain("WorkerLoader");
    expect(scripts).toContain('"predev": "vp run --filter mcp build:app"');
    expect(scripts).toContain('"predeploy": "vp run --filter mcp build:app"');
  });
});
