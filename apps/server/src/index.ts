import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@tacos/api/context";
import { appRouter } from "@tacos/api/routers/index";
import {
  listRestaurantInput,
  registerRestaurantInput,
  RestaurantApi,
  restaurantRateInput,
} from "@tacos/api/services/restaurant";
import * as schema from "@tacos/db/schema";
import { env } from "@tacos/env/server";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
import { requireAdminAccess } from "./admin-access";
import { GeocodingError, geocodeAddress } from "./geocode";

const MAX_PHOTO_SIZE = 8 * 1024 * 1024;
const MAX_UPLOAD_BODY_SIZE = MAX_PHOTO_SIZE + 64 * 1024;

const acceptedPhotoTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const geocodeInput = registerRestaurantInput.pick({ address: true });

const registrationInput = registerRestaurantInput.extend({
  rate: z
    .union([z.number(), z.string().trim().min(1)])
    .transform((value) => Number(value))
    .pipe(restaurantRateInput),
  latitude: z
    .union([z.number(), z.string().trim().min(1)])
    .transform((value) => Number(value))
    .pipe(z.number().finite().min(-90).max(90)),
  longitude: z
    .union([z.number(), z.string().trim().min(1)])
    .transform((value) => Number(value))
    .pipe(z.number().finite().min(-180).max(180)),
});

type Bindings = Pick<Env, "ADMIN_ACCESS_BYPASS" | "ADMIN_EMAIL" | "CORS_ORIGIN" | "DB" | "PHOTOS">;

const app = new Hono<{ Bindings: Bindings }>();

function restaurantApi(c: { env: Bindings; req: { url: string } }) {
  return new RestaurantApi(drizzle(c.env.DB, { schema }), {
    photoUrlBase: new URL(c.req.url).origin,
  });
}

function isImageContent(type: keyof typeof acceptedPhotoTypes, bytes: Uint8Array) {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function cleanupError(error: unknown) {
  return error instanceof Error ? error.message : "不明なエラー";
}

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  }),
);

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/api/restaurants", async (c) => {
  const input = listRestaurantInput.safeParse({
    limit: c.req.query("limit") ? Number(c.req.query("limit")) : undefined,
    offset: c.req.query("offset") ? Number(c.req.query("offset")) : undefined,
  });
  if (!input.success) {
    return c.json({ error: "limit と offset の指定が不正です。" }, 400);
  }

  const api = restaurantApi(c);
  const [restaurants, total] = await Promise.all([api.list(input.data), api.count()]);

  return c.json({ restaurants, total });
});

app.use("/api/admin/*", requireAdminAccess);
app.use(
  "/api/admin/*",
  bodyLimit({
    maxSize: MAX_UPLOAD_BODY_SIZE,
    onError: (c) => c.json({ error: "写真は8 MB以下にしてください。" }, 413),
  }),
);

app.post("/api/admin/geocode", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "住所を読み取れませんでした。" }, 400);
  }

  const parsed = geocodeInput.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "住所を入力してください。" }, 400);
  }

  try {
    return c.json(await geocodeAddress(parsed.data.address));
  } catch (error) {
    if (error instanceof GeocodingError) {
      return c.json({ error: error.message }, 422);
    }

    return c.json({ error: "住所から位置を特定できませんでした。" }, 422);
  }
});

app.post("/api/admin/restaurants", async (c) => {
  let body: Record<string, string | File | (string | File)[]>;
  try {
    body = await c.req.parseBody();
  } catch {
    return c.json({ error: "フォームを読み取れませんでした。" }, 400);
  }

  const photo = body.photo;
  if (!(photo instanceof File)) {
    return c.json({ error: "JPEG、PNG、WebP形式の写真を1枚選択してください。" }, 400);
  }

  if (photo.size === 0 || photo.size > MAX_PHOTO_SIZE) {
    return c.json({ error: "写真は8 MB以下にしてください。" }, 400);
  }

  const extension = acceptedPhotoTypes[photo.type as keyof typeof acceptedPhotoTypes];
  if (!extension) {
    return c.json({ error: "写真はJPEG、PNG、WebP形式にしてください。" }, 400);
  }

  const photoBytes = new Uint8Array(await photo.arrayBuffer());
  if (!isImageContent(photo.type as keyof typeof acceptedPhotoTypes, photoBytes)) {
    return c.json({ error: "写真のファイル形式を確認できませんでした。" }, 400);
  }

  const r2Key = `restaurants/${crypto.randomUUID()}.${extension}`;
  const parsed = registrationInput.safeParse({
    name: body.name,
    address: body.address,
    rate: body.rate,
    memo: body.memo,
    latitude: body.latitude,
    longitude: body.longitude,
  });
  if (!parsed.success) {
    return c.json({ error: "店名、住所、位置情報を確認してください。" }, 400);
  }

  const api = restaurantApi(c);
  let restaurantId: number | undefined;

  try {
    const restaurant = await api.add({
      ...parsed.data,
      imageKey: r2Key,
    });
    if (!restaurant) throw new Error("店舗を保存できませんでした。");

    restaurantId = restaurant.id;

    await c.env.PHOTOS.put(r2Key, photoBytes, {
      httpMetadata: {
        contentType: photo.type,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    return c.json({ restaurant: await api.get(restaurant.id) }, 201);
  } catch (error) {
    try {
      await c.env.PHOTOS.delete(r2Key);
    } catch (cleanupFailure) {
      console.error({
        event: "restaurant_photo_cleanup_failed",
        error: cleanupError(cleanupFailure),
      });
    }
    if (restaurantId) {
      try {
        await api.delete(restaurantId);
      } catch (cleanupFailure) {
        console.error({
          event: "restaurant_cleanup_failed",
          error: cleanupError(cleanupFailure),
        });
      }
    }

    console.error({ event: "restaurant_registration_failed", error: cleanupError(error) });
    return c.json({ error: "登録に失敗しました。もう一度試してください。" }, 500);
  }
});

app.delete("/api/admin/restaurants/:restaurantId", async (c) => {
  const restaurantId = z.coerce.number().int().positive().safeParse(c.req.param("restaurantId"));
  if (!restaurantId.success) return c.notFound();

  let restaurant;
  try {
    restaurant = await restaurantApi(c).delete(restaurantId.data);
  } catch (error) {
    console.error({ event: "restaurant_deletion_failed", error: cleanupError(error) });
    return c.json({ error: "削除に失敗しました。もう一度試してください。" }, 500);
  }

  if (!restaurant) return c.notFound();

  try {
    await c.env.PHOTOS.delete(restaurant.imageKey);
  } catch (error) {
    console.error({
      event: "restaurant_photo_cleanup_failed",
      restaurantId: restaurant.id,
      error: cleanupError(error),
    });
  }

  return c.body(null, 204);
});

app.get("/photos/:restaurantId", async (c) => {
  const restaurantId = z.coerce.number().int().positive().safeParse(c.req.param("restaurantId"));
  if (!restaurantId.success) return c.notFound();

  const restaurant = await drizzle(c.env.DB, { schema })
    .select({ imageKey: schema.restaurants.imageKey })
    .from(schema.restaurants)
    .where(eq(schema.restaurants.id, restaurantId.data))
    .limit(1);
  const record = restaurant[0];
  if (!record) return c.notFound();

  const object = await c.env.PHOTOS.get(record.imageKey);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);
  headers.set("x-content-type-options", "nosniff");

  return new Response(object.body, { headers });
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
