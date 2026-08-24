import { Link } from "@tanstack/react-router";

import { RestaurantForm } from "@/features/restaurants/components/restaurant-form";
import { SavedRestaurantList } from "@/features/restaurants/components/saved-restaurant-list";

interface AdminPageProps {
  onRegistered: () => Promise<void> | void;
}

export function AdminPage({ onRegistered }: AdminPageProps) {
  return (
    <main className="min-h-0 overflow-y-auto bg-taco-paper px-4 py-7 text-taco-ink sm:px-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:gap-14">
        <div className="space-y-5">
          <Link
            className="text-sm font-semibold tracking-wide text-taco-roja-strong hover:underline"
            to="/"
          >
            ← 地図に戻る
          </Link>
          <RestaurantForm onRegistered={onRegistered} />
          <SavedRestaurantList />
        </div>
      </div>
    </main>
  );
}
