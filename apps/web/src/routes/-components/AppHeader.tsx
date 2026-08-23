import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const links = [{ to: "/", label: "Map" }] as const;

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="relative z-20 w-full border-b border-taco-border bg-taco-white text-taco-ink">
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
              ? "absolute inset-x-0 top-full flex flex-col border-b border-taco-border bg-taco-white px-4 py-3 md:static md:flex-row md:border-0 md:bg-transparent md:p-0"
              : "hidden md:flex",
          ].join(" ")}
        >
          {links.map(({ to, label }) => (
            <Link
              key={to}
              className="font-medium text-sm text-taco-ink-soft transition-colors hover:text-taco-roja-strong [&.active]:font-semibold [&.active]:text-taco-roja-strong"
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
          className="inline-flex size-9 items-center justify-center transition-colors hover:bg-taco-tortilla/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-taco-roja md:hidden"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
    </header>
  );
}
