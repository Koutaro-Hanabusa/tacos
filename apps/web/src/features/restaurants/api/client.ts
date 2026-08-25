import { env } from "@tacos/env/web";
import { z } from "zod";

const restaurantSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  rate: z.number().min(0).max(5).nullable(),
  memo: z.string().nullable(),
  googleMapsUrl: z.string(),
  photoUrl: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const restaurantsResponse = z.object({
  restaurants: z.array(restaurantSchema),
  total: z.number().int().nonnegative().optional(),
});

const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

const restaurantResponse = z.object({
  restaurant: restaurantSchema,
});

const errorResponse = z.object({ error: z.string() });

export type Restaurant = z.infer<typeof restaurantSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type RestaurantsPage = {
  restaurants: Restaurant[];
  total: number;
};

function endpoint(path: string) {
  return new URL(path, env.VITE_SERVER_URL).toString();
}

async function responseError(response: Response) {
  const body = await response.json().catch(() => null);
  const parsed = errorResponse.safeParse(body);

  return parsed.success ? parsed.data.error : "リクエストに失敗しました。";
}

async function fetchRestaurants(input?: { limit?: number; offset?: number }) {
  const url = new URL(endpoint("/api/restaurants"));
  if (input?.limit !== undefined) url.searchParams.set("limit", String(input.limit));
  if (input?.offset !== undefined) url.searchParams.set("offset", String(input.offset));

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(await responseError(response));

  return restaurantsResponse.parse(await response.json());
}

export async function listRestaurants() {
  return (await fetchRestaurants()).restaurants;
}

export async function listRestaurantsPage(input: { limit: number; offset: number }) {
  const response = await fetchRestaurants(input);

  return {
    restaurants: response.restaurants,
    total: response.total ?? response.restaurants.length,
  } satisfies RestaurantsPage;
}

export async function geocodeAddress(address: string) {
  const response = await fetch(endpoint("/api/admin/geocode"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
    credentials: "include",
  });
  if (!response.ok) throw new Error(await responseError(response));

  return coordinatesSchema.parse(await response.json());
}

export async function registerRestaurant(input: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rate: number;
  memo: string;
  photo: File;
}) {
  const formData = new FormData();
  formData.set("name", input.name);
  formData.set("address", input.address);
  formData.set("latitude", String(input.latitude));
  formData.set("longitude", String(input.longitude));
  formData.set("rate", String(input.rate));
  formData.set("memo", input.memo);
  formData.set("photo", input.photo);

  const response = await fetch(endpoint("/api/admin/restaurants"), {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) throw new Error(await responseError(response));

  return restaurantResponse.parse(await response.json()).restaurant;
}

export async function updateRestaurant(input: {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rate: number;
  memo: string;
  photo?: File;
}) {
  const formData = new FormData();
  formData.set("name", input.name);
  formData.set("address", input.address);
  formData.set("latitude", String(input.latitude));
  formData.set("longitude", String(input.longitude));
  formData.set("rate", String(input.rate));
  formData.set("memo", input.memo);
  if (input.photo) formData.set("photo", input.photo);

  const response = await fetch(endpoint(`/api/admin/restaurants/${input.id}`), {
    method: "PATCH",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) throw new Error(await responseError(response));

  return restaurantResponse.parse(await response.json()).restaurant;
}

export async function deleteRestaurant(id: number) {
  const response = await fetch(endpoint(`/api/admin/restaurants/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error(await responseError(response));
}
