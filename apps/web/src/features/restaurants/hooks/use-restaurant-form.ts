import { useRef, useState } from "react";
import { toast } from "sonner";

import type { Coordinates, Restaurant } from "../api/client";
import {
  useGeocodeAddressMutation,
  useRegisterRestaurantMutation,
  useUpdateRestaurantMutation,
} from "../api/mutations";

type GeocodedAddress = Coordinates & { address: string };

interface UseRestaurantFormOptions {
  onRegistered: () => Promise<void> | void;
  restaurant?: Restaurant;
}

export function useRestaurantForm({ onRegistered, restaurant }: UseRestaurantFormOptions) {
  const [name, setName] = useState(() => restaurant?.name ?? "");
  const [address, setAddress] = useState(() => restaurant?.address ?? "");
  const addressRef = useRef(address);
  const [rateInput, setRateInput] = useState(() =>
    restaurant?.rate === null || restaurant?.rate === undefined ? "" : String(restaurant.rate),
  );
  const [memo, setMemo] = useState(() => restaurant?.memo ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<GeocodedAddress | null>(() =>
    restaurant
      ? {
          address: restaurant.address,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
        }
      : null,
  );
  const normalizedAddress = address.trim();
  const rate = rateInput.trim() === "" ? null : Number(rateInput);
  const coordinates = geocodedAddress?.address === normalizedAddress ? geocodedAddress : null;
  const geocoding = useGeocodeAddressMutation();
  const registration = useRegisterRestaurantMutation();
  const updating = useUpdateRestaurantMutation();

  function changeAddress(nextAddress: string) {
    addressRef.current = nextAddress;
    setAddress(nextAddress);
    setGeocodedAddress(null);
  }

  async function geocode() {
    if (!normalizedAddress) {
      toast.error("住所を入力してから検索してください。");
      return;
    }

    try {
      const position = await geocoding.mutateAsync(normalizedAddress);
      if (normalizedAddress !== addressRef.current.trim()) return;

      setGeocodedAddress({ ...position, address: normalizedAddress });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "住所の検索に失敗しました。");
    }
  }

  async function register() {
    if (!coordinates) {
      toast.error("住所を検索して、位置を確認してください。");
      return;
    }
    if (!restaurant && !photo) {
      toast.error("写真を1枚選んでください。");
      return;
    }
    if (rate === null || !Number.isFinite(rate) || rate < 0 || rate > 5) {
      toast.error("お店の評価を0〜5で入力してください。");
      return;
    }

    try {
      if (restaurant) {
        await updating.mutateAsync({
          id: restaurant.id,
          name,
          address: normalizedAddress,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          rate,
          memo: memo.trim(),
          photo: photo ?? undefined,
        });
        toast.success("店の情報を更新しました。");
      } else if (photo) {
        await registration.mutateAsync({
          name,
          address: normalizedAddress,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          rate,
          memo: memo.trim(),
          photo,
        });
        toast.success("店を地図に追加しました。");
      }
      await onRegistered();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : restaurant
            ? "更新に失敗しました。"
            : "登録に失敗しました。",
      );
    }
  }

  return {
    address,
    changeAddress,
    coordinates,
    geocode,
    isGeocoding: geocoding.isPending,
    isRegistering: registration.isPending,
    isSaving: registration.isPending || updating.isPending,
    memo,
    name,
    normalizedAddress,
    photo,
    rate,
    rateInput,
    register,
    setMemo,
    setName,
    setPhoto,
    setRateInput,
  };
}
