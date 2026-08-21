import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vite-plus/test";

function source(name: string) {
  return readFileSync(resolve(import.meta.dirname, name), "utf8");
}

describe("restaurant MCP App", () => {
  test("keeps the MCP resource module focused on serving the built app", () => {
    const resource = source("./restaurant-app.ts");

    expect(resource).toContain("ui://tacos/restaurant-map-v7.html");
    expect(resource).toContain("../dist/app/restaurant-app.js");
    expect(resource).not.toContain("<style>");
    expect(resource).not.toContain("<script");
  });

  test("uses local source modules and bundles external JavaScript and CSS", () => {
    const html = source("./restaurant-app.html");
    const client = source("./restaurant-app-client.js");

    expect(html).toContain('href="./restaurant-app.css"');
    expect(html).toContain('src="./restaurant-app-client.js"');
    expect(html).not.toContain("https://esm.sh");
    expect(html).not.toContain("https://cdn.jsdelivr.net");
    expect(html).toContain('<div id="map"');
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("GOOGLE_MAPS_EMBED_API_KEY");
    expect(client).toContain('from "@modelcontextprotocol/ext-apps"');
    expect(client).toContain('from "maplibre-gl"');
    expect(client).toContain("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
    expect(client).toContain("OpenStreetMap");
    expect(client).toContain("fitBounds");
    expect(client).toContain("flyTo");
    expect(client).toContain("maxZoom: 19");
    expect(client).toContain('mapInstance.on("error"');
    expect(client).toContain('pin.className = "restaurant-map-pin"');
    expect(client).toContain("restaurant.googleMapsUrl");
    expect(client).toContain("app.openLink");
    expect(client).not.toContain("maps/embed/v1");
  });

  test("allows OpenStreetMap tiles without external frames or API-key injection", () => {
    const server = source("./index.ts");

    expect(server).toContain('connectDomains: ["https://tile.openstreetmap.org"]');
    expect(server).toContain('resourceDomains: ["https://tile.openstreetmap.org"]');
    expect(server).toContain("_meta: { ui: appResourceMeta }");
    expect(server).toContain("_meta: { ...appResourceMeta, ui: appResourceMeta }");
    expect(server).not.toContain("frameDomains");
    expect(server).not.toContain("restaurantAppHtml.replace(");
    expect(server).not.toContain("GOOGLE_MAPS_EMBED_API_KEY");
  });
});
