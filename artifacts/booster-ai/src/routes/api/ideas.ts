import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ideas")({
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
});
