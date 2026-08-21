import type { ErrorComponentProps } from "@tanstack/react-router";

export function HomeError({ error }: ErrorComponentProps) {
  return (
    <main className="grid h-full place-items-center bg-[#f8ead1] px-6 text-[#30170d] dark:bg-[#1b0c07] dark:text-[#fff0d7]">
      <div className="max-w-md border border-dashed border-[#b54220]/50 p-5 text-sm leading-relaxed text-[#8a321b] dark:text-[#ffb192]">
        {error.message}
      </div>
    </main>
  );
}
