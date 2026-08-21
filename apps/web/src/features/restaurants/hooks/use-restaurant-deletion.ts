import { useState } from "react";
import { toast } from "sonner";

import type { Restaurant } from "../api/client";
import { useDeleteRestaurantMutation } from "../api/mutations";

export function useRestaurantDeletion() {
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const deletion = useDeleteRestaurantMutation();

  function confirmDeletion() {
    if (!restaurantToDelete) return;

    deletion.mutate(restaurantToDelete.id, {
      onSuccess: () => {
        setRestaurantToDelete(null);
        toast.success("店を一覧から削除しました。");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "削除に失敗しました。");
      },
    });
  }

  return {
    cancelDeletion: () => setRestaurantToDelete(null),
    confirmDeletion,
    isDeleting: deletion.isPending,
    requestDeletion: setRestaurantToDelete,
    restaurantToDelete,
  };
}
