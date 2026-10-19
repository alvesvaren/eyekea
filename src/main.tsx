import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouteError, RouteNotFound, RoutePending } from "./components/RouteStates";
import { PANEL_ID } from "./features/panel";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: RoutePending,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: RouteNotFound,
  scrollRestoration: true,
  scrollToTopSelectors: [`#${PANEL_ID}`],
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
