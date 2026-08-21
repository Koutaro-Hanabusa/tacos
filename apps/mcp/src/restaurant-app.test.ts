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
    const client = source("./restaurant-app-client.js");
    const css = source("./restaurant-app.css");
    const viteConfig = source("../vite.app.config.ts");

    expect(html).toContain('href="./restaurant-app.css"');
    expect(html).toContain('src="./restaurant-app-client.js"');
    expect(html).not.toContain("https://esm.sh");
    expect(html).not.toContain("https://cdn.jsdelivr.net");
    expect(html).toContain('id="map"');
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("GOOGLE_MAPS_EMBED_API_KEY");
    expect(html).not.toContain('id="search-form"');
    expect(html).not.toContain('id="search"');
    expect(html).not.toContain('id="refresh"');
    expect(html).toContain("Taco index / result");
    expect(html).toContain("bg-[#f8ead1]");
    expect(html).not.toContain("vh");
    expect(client).toContain('from "@modelcontextprotocol/ext-apps"');
    expect(client).toContain('from "maplibre-gl"');
    expect(client).not.toContain("app.callServerTool");
    expect(client).not.toContain('"restaurant_search"');
    expect(client).not.toContain('"restaurant_list"');
    expect(client).toContain("app.ontoolresult");
    expect(client).toContain("app.getHostContext()");
    expect(client).toContain("result?.isError");
    expect(client).toContain("restaurant.photoUrl");
    expect(client).toContain("restaurant.googleMapsUrl");
    expect(client).toContain("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
    expect(client).toContain("OpenStreetMap");
    expect(client).toContain("fitBounds");
    expect(client).toContain("flyTo");
    expect(client).toContain("maxZoom: 19");
    expect(client).toContain('mapInstance.on("error"');
    expect(client).toContain('element.className = "restaurant-map-marker"');
    expect(client).toContain("app.openLink");
    expect(client).not.toContain("maps/embed/v1");
    expect(css).toContain('@import "tailwindcss"');
    expect(css).toContain(".restaurant-map-marker");
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
    expect(server).not.toContain("restaurantAppHtml.replace(");
    expect(server).not.toContain("GOOGLE_MAPS_EMBED_API_KEY");
  });
});
