import { LoaderCircle } from "lucide-react";

export function HomePending() {
  return (
    <main className="grid h-full place-items-center bg-[#f8ead1] text-[#8c573c] dark:bg-[#1b0c07] dark:text-[#d99c7a]">
      <LoaderCircle className="size-6 animate-spin" aria-label="お店を読み込み中" />
    </main>
  );
}
