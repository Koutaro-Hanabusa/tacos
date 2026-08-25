import * as schema from "@tacos/db/schema";
import { and, count, desc, eq, like } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { z } from "zod";

export type Db = DrizzleD1Database<typeof schema>;

type RestaurantRow = typeof schema.restaurants.$inferSelect;

export const restaurantRateInput = z.number().min(0).max(5);

export type PublicRestaurant = Omit<RestaurantRow, "imageKey"> & {
  googleMapsUrl: string;
  photoUrl: string;
};

type RestaurantApiOptions = {
  photoUrlBase?: string;
};

export const registerRestaurantInput = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(300),
  rate: restaurantRateInput,
  memo: z.string().trim().max(1000).optional(),
});

export const addRestaurantInput = registerRestaurantInput.extend({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  imageKey: z.string().trim().min(1).max(512),
});

export const searchRestaurantInput = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  address: z.string().trim().min(1).max(300).optional(),
});

export const listRestaurantInput = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export function googleMapsUrl(name: string, address: string) {
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", `${name}, ${address}`);
  return url.toString();
}

export class RestaurantApi {
  constructor(
    private db: Db,
    private options: RestaurantApiOptions = {},
  ) {}

  async add(input: z.infer<typeof addRestaurantInput>) {
    const result = await this.db
      .insert(schema.restaurants)
      .values({
        name: input.name,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        imageKey: input.imageKey,
        rate: input.rate,
        memo: input.memo,
      })
      .returning();
    return result[0];
  }

  async search(input: z.infer<typeof searchRestaurantInput>) {
    const conditions = [];

    if (input.name) {
      conditions.push(like(schema.restaurants.name, `%${input.name}%`));
    }
    if (input.address) {
      conditions.push(like(schema.restaurants.address, `%${input.address}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await this.db
      .select()
      .from(schema.restaurants)
      .where(whereClause)
      .orderBy(desc(schema.restaurants.createdAt))
      .limit(50);

    return rows.map((restaurant) => this.toPublicRestaurant(restaurant));
  }

  async get(id: number) {
    const rows = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.id, id))
      .limit(1);
    const restaurant = rows[0];
    return restaurant ? this.toPublicRestaurant(restaurant) : null;
  }

  async list(input: z.infer<typeof listRestaurantInput>) {
    const rows = await this.db
      .select()
      .from(schema.restaurants)
      .orderBy(desc(schema.restaurants.createdAt))
      .limit(input.limit)
      .offset(input.offset);
    return rows.map((restaurant) => this.toPublicRestaurant(restaurant));
  }

  async count() {
    const rows = await this.db.select({ count: count() }).from(schema.restaurants);
    return rows[0]?.count ?? 0;
  }

  async delete(id: number) {
    const result = await this.db
      .delete(schema.restaurants)
      .where(eq(schema.restaurants.id, id))
      .returning();
    return result[0] ?? null;
  }

  private toPublicRestaurant(restaurant: RestaurantRow): PublicRestaurant {
    const { imageKey: _imageKey, ...publicRestaurant } = restaurant;

    return {
      ...publicRestaurant,
      googleMapsUrl: googleMapsUrl(restaurant.name, restaurant.address),
      photoUrl: this.photoUrl(restaurant.id),
    };
  }

  private photoUrl(restaurantId: number) {
    const path = `/photos/${restaurantId}`;

    return this.options.photoUrlBase ? new URL(path, this.options.photoUrlBase).toString() : path;
  }
}
