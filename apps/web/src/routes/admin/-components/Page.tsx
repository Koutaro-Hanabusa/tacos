import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

import { RestaurantForm } from "@/features/restaurants/components/restaurant-form";
import { SavedRestaurantList } from "@/features/restaurants/components/saved-restaurant-list";

interface AdminPageProps {
  onRegistered: () => Promise<void> | void;
}

export function AdminPage({ onRegistered }: AdminPageProps) {
  return (
    <main className="min-h-0 overflow-y-auto bg-[#f8ead1] px-4 py-7 text-[#30170d] dark:bg-[#1b0c07] dark:text-[#fff0d7] sm:px-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <section className="pt-2 lg:pt-12">
          <Link
            className="font-mono text-[0.68rem] font-bold tracking-[0.16em] text-[#a84322] uppercase hover:underline dark:text-[#ff956b]"
            to="/"
          >
            ← 地図に戻る
          </Link>
          <p className="mt-10 font-mono text-[0.68rem] font-bold tracking-[0.2em] text-[#b54220] uppercase dark:text-[#ff956b]">
            Owner&apos;s notebook / 02
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold leading-[0.88] tracking-[-0.075em] sm:text-6xl">
            好きな店を、
            <br />
            残していく。
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#70432c] dark:text-[#e1ae8a]">
            店名、番地まで含めた住所、写真を記録します。位置は住所から調べて保存するので、次からは地図をすぐ開けます。
          </p>
          <div className="mt-8 flex max-w-sm gap-3 border-l-2 border-[#b54220] bg-[#f2c85d]/25 px-4 py-3 text-xs leading-relaxed text-[#70432c] dark:bg-[#b54220]/15 dark:text-[#f4bb94]">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[#a84322] dark:text-[#ff956b]" />
            <p>
              {import.meta.env.DEV
                ? "ローカル開発では Cloudflare Access なしで登録できます。"
                : "この画面と登録 API は Cloudflare Access の本人認証を通ったメールだけが使えます。"}
            </p>
          </div>
        </section>

        <div className="space-y-5">
          <RestaurantForm onRegistered={onRegistered} />
          <SavedRestaurantList />
        </div>
      </div>
    </main>
  );
}
