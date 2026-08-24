import { LoaderCircle } from "lucide-react";

export function HomePending() {
  return (
    <main className="grid h-full place-items-center bg-taco-paper text-taco-roja-strong">
      <LoaderCircle className="size-6 animate-spin" aria-label="お店を読み込み中" />
    </main>
  );
}
