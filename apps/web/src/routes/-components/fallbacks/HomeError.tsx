import type { ErrorComponentProps } from "@tanstack/react-router";

export function HomeError({ error }: ErrorComponentProps) {
  return (
    <main className="grid h-full place-items-center bg-taco-paper px-6 text-taco-ink">
      <div className="max-w-md border border-dashed border-taco-roja/60 p-5 text-sm leading-relaxed text-taco-roja-strong">
        {error.message}
      </div>
    </main>
  );
}
