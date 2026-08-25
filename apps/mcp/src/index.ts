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

function restaurantAppResourceMeta(photoUrlBase: string) {
  return {
    csp: {
      connectDomains: ["https://tile.openstreetmap.org"],
      resourceDomains: ["https://tile.openstreetmap.org", new URL(photoUrlBase).origin, "data:"],
    },
    prefersBorder: true,
  };
}

const app = new Hono<{ Bindings: Bindings }>();

const restaurantOutput = z.object({
  id: z.number().int(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  rate: z.number().nullable(),
  memo: z.string().nullable(),
  googleMapsUrl: z.string(),
  photoUrl: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const restaurantResultOutput = {
  restaurants: z.array(restaurantOutput),
  query: z.record(z.string(), z.unknown()),
};

const restaurantSearchToolInput = {
  name: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .optional()
    .describe("店名や店名に含まれる語。例: タコス、La Taqueria"),
  address: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .optional()
    .describe("地域・住所。例: 渋谷、新宿区、東京都渋谷区"),
};

const restaurantListToolInput = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("一度に表示する件数。通常は省略し、全件を求められた場合だけ調整する"),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe("一覧の開始位置。通常は0のままにする"),
};

function toolError(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
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
      ...(restaurant.rate === null ? [] : [`評価: ${restaurant.rate}/5`]),
      ...(restaurant.memo ? [`メモ: ${restaurant.memo}`] : []),
      `緯度・経度: ${restaurant.latitude}, ${restaurant.longitude}`,
      `Google Maps: ${restaurant.googleMapsUrl}`,
      `写真: ${restaurant.photoUrl}`,
    ].join("\n"),
  );

  return {
    content: [
      {
        type: "text" as const,
        text: [
          restaurants.length > 0
            ? `${restaurants.length} 件のレストランが見つかりました。地図と一覧から確認できます。`
            : "条件に合うレストランは見つかりませんでした。店名や地域を変えて再検索できます。",
          ...details,
        ].join("\n\n"),
      },
    ],
    structuredContent: { restaurants, query },
  };
}

function createMcpServer(db: Db, photoUrlBase: string) {
  const api = new RestaurantApi(db, { photoUrlBase });
  const server = new McpServer({ name: "tacos", version: "0.1.0" });
  const appResourceMeta = restaurantAppResourceMeta(photoUrlBase);

  registerAppResource(
    server,
    "Tacos restaurant map",
    RESTAURANT_APP_RESOURCE_URI,
    {
      description: "レストランの検索結果を地図で表示する MCP App",
      mimeType: RESOURCE_MIME_TYPE,
      _meta: { ui: appResourceMeta },
    },
    async () => ({
      contents: [
        {
          uri: RESTAURANT_APP_RESOURCE_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: restaurantAppHtml,
          // Inspector 2.3 reads resource CSP directly, while other hosts use the namespaced form.
          _meta: { ...appResourceMeta, ui: appResourceMeta },
        },
      ],
    }),
  );

  registerAppTool(
    server,
    "restaurant_search",
    {
      title: "タコス店を条件検索",
      description:
        "ユーザーが店名、料理名、地域、住所などの条件を指定してタコス店を探すときに使う。例: 「渋谷のタコス店」「La Taqueriaを探して」。name または address を少なくとも1つ指定すること。条件なしで登録済み店舗を一覧・地図表示したい場合は restaurant_list を使う。",
      inputSchema: restaurantSearchToolInput,
      outputSchema: restaurantResultOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      _meta: { ui: { resourceUri: RESTAURANT_APP_RESOURCE_URI } },
    },
    async (args) => {
      const parsed = searchRestaurantInput.safeParse(args);
      if (!parsed.success || (!parsed.data.name && !parsed.data.address)) {
        return toolError(
          "店名または地域・住所を指定して検索してください。条件なしなら一覧表示を使います。",
        );
      }

      const input = parsed.data;
      return restaurantResult(await api.search(input), input);
    },
  );

  registerAppTool(
    server,
    "restaurant_list",
    {
      title: "登録済みの店舗を一覧表示",
      description:
        "ユーザーが登録済みのタコス店を一覧または地図で見たいとき、または「全部見せて」「地図を見せて」と依頼したときに使う。検索条件がある場合は restaurant_search を使う。通常は limit と offset を省略する。",
      inputSchema: restaurantListToolInput,
      outputSchema: restaurantResultOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      _meta: { ui: { resourceUri: RESTAURANT_APP_RESOURCE_URI } },
    },
    async (args) => {
      const input = listRestaurantInput.parse(args);
      return restaurantResult(await api.list(input), input);
    },
  );

  registerAppTool(
    server,
    "restaurant_get",
    {
      title: "店舗の詳細を再表示",
      description:
        "検索結果に含まれる店舗IDを指定して、1店舗の詳細を地図と一覧で再表示するときだけ使う。ユーザーがIDを指定していない場合は restaurant_search または restaurant_list を使う。",
      inputSchema: {
        id: z.number().int().positive().describe("直前の検索結果に含まれる店舗ID"),
      },
      outputSchema: restaurantResultOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      _meta: { ui: { resourceUri: RESTAURANT_APP_RESOURCE_URI } },
    },
    async (args) => {
      const restaurant = await api.get(args.id);
      if (!restaurant) return toolError("指定された店舗は見つかりませんでした。");

      return restaurantResult([restaurant], { id: args.id });
    },
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
