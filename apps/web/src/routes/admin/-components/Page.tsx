import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

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
            className="font-mono text-[0.68rem] font-bold tracking-[0.16em] text-taco-roja-strong uppercase hover:underline"
            to="/"
          >
            ← 地図に戻る
          </Link>
          <div className="mt-8 flex max-w-sm gap-3 border-l-2 border-taco-roja bg-taco-roja/10 px-4 py-3 text-xs leading-relaxed text-taco-muted">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-taco-verde" />
            <p>
              {import.meta.env.DEV
                ? "ローカル開発では Cloudflare Access なしで登録できます。"
                : "この画面と登録 API は Cloudflare Access の本人認証を通ったメールだけが使えます。"}
            </p>
          </div>

          <RestaurantForm onRegistered={onRegistered} />
          <SavedRestaurantList />
        </div>
      </div>
    </main>
  );
}
