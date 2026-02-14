import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const links = [
    { to: "/", label: "Map" },
    { to: "/admin", label: "Admin" },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <div>Tacos de Burio</div>
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
