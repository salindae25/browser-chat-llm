import { createRoute } from "@tanstack/react-router";

import type { RootRoute } from "@tanstack/react-router";

function DemoStore() {
  return (
    <div className="min-h-[calc(100vh-32px)] text-white p-8 flex items-center justify-center w-full h-full"></div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/demo/store",
    component: DemoStore,
    getParentRoute: () => parentRoute,
  });
