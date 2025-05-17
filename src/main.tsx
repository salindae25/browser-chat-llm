import {
	Outlet,
	RouterProvider,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";
import SettingsGeneralRoute from "./routes/settings.general";
import SettingsLLm from "./routes/settings.llm";
import { Analytics } from '@vercel/analytics/react';
import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";

import MainLayout from "@/layout/MainLayout.tsx";
import App from "./App.tsx";
import ChatSection from "./routes/chat.section";

const rootRoute = createRootRoute({
	component: () => (
		<MainLayout>
			<Outlet />
			<Analytics />
		</MainLayout>
	),
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: App,
});

const routeTree = rootRoute.addChildren([
	indexRoute,
	ChatSection(rootRoute),
	SettingsLLm(rootRoute),
	SettingsGeneralRoute(rootRoute), // Add the new general settings route
]);

const router = createRouter({
	routeTree,
	context: {
		...TanStackQueryProvider.getContext(),
	},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<TanStackQueryProvider.Provider>
				<RouterProvider router={router} />
			</TanStackQueryProvider.Provider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
