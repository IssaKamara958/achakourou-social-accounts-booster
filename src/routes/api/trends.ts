import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trends")({
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
});
