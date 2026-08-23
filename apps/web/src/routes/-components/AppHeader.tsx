import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const links = [{ to: "/", label: "Map" }] as const;

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="relative z-20 w-full border-b border-white/20 bg-black text-white supports-[backdrop-filter]:bg-black/95 dark:border-black/20 dark:bg-white dark:text-black dark:supports-[backdrop-filter]:bg-white/95">
      <div className="mx-auto flex h-16 items-center justify-between px-8">
        <Link
          aria-label="Burio de Tacos"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          to="/"
          onClick={closeMenu}
        >
          <img
            alt=""
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
            src="https://burio16.com/burio.com_transparent.svg"
          />
          <span className="text-lg font-bold sm:text-xl">Burio de Tacos</span>
        </Link>

        <nav
          id="app-navigation"
          aria-label="メインナビゲーション"
          className={[
            "items-center gap-6 md:flex",
            menuOpen
              ? "absolute inset-x-0 top-full flex flex-col border-b border-white/20 bg-black px-4 py-3 dark:border-black/20 dark:bg-white md:static md:flex-row md:border-0 md:bg-transparent md:p-0 dark:md:bg-transparent"
              : "hidden md:flex",
          ].join(" ")}
        >
          {links.map(({ to, label }) => (
            <Link
              key={to}
              className="font-medium text-sm text-white/80 transition-colors hover:text-white [&.active]:font-semibold [&.active]:text-white dark:text-black/80 dark:hover:text-black dark:[&.active]:text-black"
              to={to}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          aria-controls="app-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          className="inline-flex size-9 items-center justify-center transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:hover:bg-black/10 md:hidden"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
    </header>
  );
}
