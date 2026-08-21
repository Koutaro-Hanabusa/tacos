import { env } from "@tacos/env/web";
import { z } from "zod";

const restaurantSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  googleMapsUrl: z.string(),
  photoUrl: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const restaurantsResponse = z.object({
  restaurants: z.array(restaurantSchema),
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

function endpoint(path: string) {
  return new URL(path, env.VITE_SERVER_URL).toString();
}

async function responseError(response: Response) {
  const body = await response.json().catch(() => null);
  const parsed = errorResponse.safeParse(body);

  return parsed.success ? parsed.data.error : "リクエストに失敗しました。";
}

export async function listRestaurants() {
  const response = await fetch(endpoint("/api/restaurants"), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(await responseError(response));

  return restaurantsResponse.parse(await response.json()).restaurants;
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
  photo: File;
}) {
  const formData = new FormData();
  formData.set("name", input.name);
  formData.set("address", input.address);
  formData.set("latitude", String(input.latitude));
  formData.set("longitude", String(input.longitude));
  formData.set("photo", input.photo);

  const response = await fetch(endpoint("/api/admin/restaurants"), {
    method: "POST",
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
