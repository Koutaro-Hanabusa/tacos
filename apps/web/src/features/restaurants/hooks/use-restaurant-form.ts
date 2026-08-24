import { useRef, useState } from "react";
import { toast } from "sonner";

import type { Coordinates } from "../api/client";
import { useGeocodeAddressMutation, useRegisterRestaurantMutation } from "../api/mutations";

type GeocodedAddress = Coordinates & { address: string };

interface UseRestaurantFormOptions {
  onRegistered: () => Promise<void> | void;
}

export function useRestaurantForm({ onRegistered }: UseRestaurantFormOptions) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const addressRef = useRef(address);
  const [rate, setRate] = useState<number | null>(null);
  const [memo, setMemo] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<GeocodedAddress | null>(null);
  const normalizedAddress = address.trim();
  const coordinates = geocodedAddress?.address === normalizedAddress ? geocodedAddress : null;
  const geocoding = useGeocodeAddressMutation();
  const registration = useRegisterRestaurantMutation();

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
    if (!photo) {
      toast.error("写真を1枚選んでください。");
      return;
    }
    if (rate === null || !Number.isFinite(rate) || rate < 0 || rate > 5) {
      toast.error("お店の評価を0〜5で入力してください。");
      return;
    }

    try {
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
      await onRegistered();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登録に失敗しました。");
    }
  }

  return {
    address,
    changeAddress,
    coordinates,
    geocode,
    isGeocoding: geocoding.isPending,
    isRegistering: registration.isPending,
    memo,
    name,
    normalizedAddress,
    photo,
    rate,
    register,
    setMemo,
    setName,
    setPhoto,
    setRate,
  };
}
