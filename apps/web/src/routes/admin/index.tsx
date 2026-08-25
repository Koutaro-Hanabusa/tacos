import { createFileRoute } from "@tanstack/react-router";

import { AdminPage } from "./-components/Page";

export const Route = createFileRoute("/admin/")({
  component: AdminRoute,
});

function AdminRoute() {
  return <AdminPage onRegistered={() => undefined} />;
}
