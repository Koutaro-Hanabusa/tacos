import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminComponent,
});

function AdminComponent() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Admin page (coming soon)</p>
    </div>
  );
}
