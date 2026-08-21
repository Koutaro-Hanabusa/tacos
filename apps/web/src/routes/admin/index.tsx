import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminPage } from "./-components/Page";

export const Route = createFileRoute("/admin/")({
  component: AdminRoute,
});

function AdminRoute() {
  const navigate = useNavigate();

  return <AdminPage onRegistered={() => navigate({ to: "/" })} />;
}
