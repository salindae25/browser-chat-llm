import { OnboardingScreen } from "@/components/OnboardingScreen";
import { AppSidebar } from "@/components/Sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar";
import { db } from "@/lib/db";
import { useLocation } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

const MainLayout = ({ children }: { children: ReactNode }) => {
	const llmProviders = useLiveQuery(() => db.llmProviders.toArray());
	const location = useLocation();
	const llmModels = useLiveQuery(() => db.llmModels.toArray());

	if (
		(llmProviders?.length === 0 || llmModels?.length === 0) &&
		!location.pathname.includes("/settings")
	) {
		return (
			<OnboardingScreen
				isLLMProvidersEmpty={llmProviders?.length === 0}
				isLLMModelsEmpty={llmModels?.length === 0}
			/>
		);
	}
	return <>{children}</>;
};
export default MainLayout;
