import { Link } from "@tanstack/react-router";

import { ModeToggle } from "@/components/mode-toggle";

const links = [
  { to: "/", label: "Map" },
  { to: "/admin", label: "Admin" },
] as const;

export function AppHeader() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <div>Burio de Tacos</div>
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
