import { AppSidebar } from "@/components/Sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
const ChatLayout = ({ children }: { children: ReactNode }) => {
	const sidebarState = localStorage.getItem(SIDEBAR_COOKIE_NAME);
	return (
		<SidebarProvider defaultOpen={sidebarState === "open"}>
			<AppSidebar />
			<SidebarInset className="overflow-hidden max-h-screen">
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
					</div>
				</header>
				{children}
				<Toaster />
			</SidebarInset>
		</SidebarProvider>
	);
};
export default ChatLayout;
