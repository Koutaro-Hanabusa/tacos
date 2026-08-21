import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteRestaurant, geocodeAddress, registerRestaurant } from "./client";
import { restaurantKeys } from "./queries";

export function useGeocodeAddressMutation() {
  return useMutation({ mutationFn: geocodeAddress });
}

export function useRegisterRestaurantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerRestaurant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: restaurantKeys.all }),
  });
}

export function useDeleteRestaurantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: restaurantKeys.all }),
  });
}
