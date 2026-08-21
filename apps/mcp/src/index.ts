import {
  RestaurantApi,
  listRestaurantInput,
  searchRestaurantInput,
  type Db,
} from "@tacos/api/services/restaurant";
import * as schema from "@tacos/db/schema";
import { StreamableHTTPTransport } from "@hono/mcp";
import {
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";
import { RESTAURANT_APP_RESOURCE_URI, restaurantAppHtml } from "./restaurant-app";

type Bindings = {
  DB: D1Database;
  PHOTO_URL_BASE: string;
};

function restaurantAppMeta(photoUrlBase: string) {
  return {
    ui: {
      csp: {
        resourceDomains: [
          "https://esm.sh",
          "https://cdn.jsdelivr.net",
          "https://tile.openstreetmap.org",
          new URL(photoUrlBase).origin,
        ],
      },
      prefersBorder: true,
    },
  };
}

const app = new Hono<{ Bindings: Bindings }>();

function textResult(result: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
  };
}

function restaurantResult(
  restaurants: Awaited<ReturnType<RestaurantApi["search"]>>,
  query: unknown,
) {
  const details = restaurants.map((restaurant, index) =>
    [
      `${index + 1}. ${restaurant.name}`,
      `住所: ${restaurant.address}`,
      `緯度・経度: ${restaurant.latitude}, ${restaurant.longitude}`,
      `地図: ${restaurant.googleMapsUrl}`,
      `写真: ${restaurant.photoUrl}`,
    ].join("\n"),
  );

  return {
    content: [
      {
        type: "text" as const,
        text: [`${restaurants.length} 件のレストランが見つかりました。`, ...details].join("\n\n"),
      },
    ],
    structuredContent: { restaurants, query },
  };
}

function createMcpServer(db: Db, photoUrlBase: string) {
  const api = new RestaurantApi(db, { photoUrlBase });
  const server = new McpServer({ name: "tacos", version: "0.1.0" });
  const appMeta = restaurantAppMeta(photoUrlBase);

  registerAppResource(
    server,
    "Tacos restaurant map",
    RESTAURANT_APP_RESOURCE_URI,
    {
      description: "レストランの検索結果を地図で操作する MCP App",
      mimeType: RESOURCE_MIME_TYPE,
      _meta: appMeta,
    },
    async () => ({
      contents: [
        {
          uri: RESTAURANT_APP_RESOURCE_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: restaurantAppHtml,
          _meta: appMeta,
        },
      ],
    }),
  );

  registerAppTool(
    server,
    "restaurant_search",
    {
      description: "レストランを名前・住所で検索する",
      inputSchema: {
        name: z.string().optional(),
        address: z.string().optional(),
      },
      _meta: { ui: { resourceUri: RESTAURANT_APP_RESOURCE_URI } },
    },
    async (args) => {
      const input = searchRestaurantInput.parse(args);
      return restaurantResult(await api.search(input), input);
    },
  );

  registerAppTool(
    server,
    "restaurant_list",
    {
      description: "レストラン一覧を取得する（ページング対応）",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().default(20),
        offset: z.number().int().min(0).optional().default(0),
      },
      _meta: { ui: { resourceUri: RESTAURANT_APP_RESOURCE_URI } },
    },
    async (args) => {
      const input = listRestaurantInput.parse(args);
      return restaurantResult(await api.list(input), input);
    },
  );

  server.tool(
    "restaurant_get",
    "IDでレストランを1件取得する",
    { id: z.number().int() },
    async (args) => textResult(await api.get(args.id)),
  );

  return server;
}

app.get("/", (c) => c.text("tacos mcp"));

app.all("/mcp", async (c) => {
  const server = createMcpServer(drizzle(c.env.DB, { schema }), c.env.PHOTO_URL_BASE);
  const transport = new StreamableHTTPTransport();

  await server.connect(transport);
  return (await transport.handleRequest(c)) ?? new Response(null, { status: 204 });
});

export default app;
