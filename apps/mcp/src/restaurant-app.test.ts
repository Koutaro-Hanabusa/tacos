import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vite-plus/test";

function source(name: string) {
  return readFileSync(resolve(import.meta.dirname, name), "utf8");
}

describe("restaurant MCP App", () => {
  test("keeps the MCP resource module focused on serving the built app", () => {
    const resource = source("./restaurant-app.ts");

    expect(resource).toContain("ui://tacos/restaurant-map-v6.html");
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
    expect(html).toContain("__GOOGLE_MAPS_EMBED_API_KEY__");
    expect(html).toContain("<iframe");
    expect(client).toContain('from "@modelcontextprotocol/ext-apps"');
    expect(client).toContain("https://www.google.com/maps/embed/v1/place");
    expect(client).toContain("restaurant.googleMapsUrl");
    expect(client).toContain("app.openLink");
    expect(client).not.toContain("leaflet");
  });

  test("allows and injects the Google Maps Embed API", () => {
    const server = source("./index.ts");

    expect(server).toContain('frameDomains: ["https://www.google.com"]');
    expect(server).toContain("_meta: { ui: appResourceMeta }");
    expect(server).toContain("_meta: { ...appResourceMeta, ui: appResourceMeta }");
    expect(server).toContain("restaurantAppHtml.replace(");
    expect(server).toContain("GOOGLE_MAPS_EMBED_API_KEY");
  });
});
