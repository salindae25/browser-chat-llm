import {
	BadgeCheck,
	Bell,
	Brain,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Plus,
	RefreshCw,
	Sparkles,
	Trash,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { activeChatStore } from "@/lib/chat-store";
import { db } from "@/lib/db";
import {
	createNewChatSession,
	deleteChatSession,
	titleGenerate,
} from "@/lib/services";
import { cn } from "@/lib/utils";
import logo from "@/logo.svg";
import { Link } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
// This is sample data.

interface ChatSessionItemProps {
	chatSession: {
		id: string;
		title: string;
	};
}

const ChatSessionItem = ({ chatSession }: ChatSessionItemProps) => {
	const [isRegenerating, setIsRegenerating] = useState(false);
	const navigate = useNavigate();
	const handleRegenerateTitle = async (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		try {
			setIsRegenerating(true);
			// Set the active chat ID so titleGenerate knows which chat to update
			activeChatStore.setState((prev) => ({
				...prev,
				chatId: chatSession.id,
			}));
			await titleGenerate();
		} catch (error) {
			console.error("Failed to regenerate title:", error);
		} finally {
			setIsRegenerating(false);
		}
	};

	return (
		<div className="flex items-center gap-2 w-full">
			<span className="truncate flex-1 group-hover/link:max-w-[70%] group-focus-visible/link:max-w-[75%]">{chatSession.title}</span>
			<div
				className={cn(
					"pointer-events-auto absolute right-0 bottom-0 top-0 z-50 flex gap-2 translate-x-full items-center justify-end text-muted-foreground transition-transform",
					"group-hover/link:-translate-x-4 group-hover/link:bg-sidebar-accent",
					"group-focus-visible/link:-translate-x-4 group-focus-visible/link:bg-sidebar-accent",
					"group-focus/link:-translate-x-4 group-focus/link:bg-sidebar-accent",
				)}
			>
				<div
					onKeyDown={(e) => {
						e.stopPropagation();
						deleteChatSession(chatSession.id, navigate as any);
					}}
					onClick={(e) => {
						e.stopPropagation();
						deleteChatSession(chatSession.id, navigate as any);
					}}
					className="bg-amber-50 p-1 rounded cursor-pointer"
				>
					<Trash className="size-4" />
				</div>
				<button
					type="button"
					className={`bg-amber-50 p-1 rounded cursor-pointer ${isRegenerating ? "animate-spin" : ""}`}
					onClick={handleRegenerateTitle}
					disabled={isRegenerating}
					title="Regenerate title"
				>
					<RefreshCw className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
};

const data = {
	user: {
		name: "Shadcn",
		email: "shadcn@gmail.com",
	},
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { isMobile } = useSidebar();

	const chatSessions = useLiveQuery(() => db.chatSessions.limit(10).toArray());
	const onNewChat = async () => {
		await createNewChatSession();
		navigate({
			to: "/chat/$chatId",
			params: { chatId: activeChatStore.state.chatId },
		});
	};
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<Link to="/">
					<div className="flex gap-4 items-center">
						<div className="flex aspect-square size-10 items-center justify-center rounded-base">
							<img
								src={logo}
								alt="logo"
								className="size-10 relative left-[-4px]"
							/>
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-heading">LLM Chat</span>
						</div>
					</div>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenuButton
						className="hover:cursor-pointer outline-border text-main-foreground bg-main transition-all active:translate-x-reverseBoxShadowX active:translate-y-reverseBoxShadowY active:shadow-shadow"
						tooltip="Add New Chat"
						onClick={onNewChat}
					>
						<Plus />
						<span>New Chat</span>
					</SidebarMenuButton>
				</SidebarGroup>
				<SidebarGroup className="h-full">
					<SidebarGroupLabel>History</SidebarGroupLabel>
					{chatSessions?.map((chatSession) => (
						<Link
							to="/chat/$chatId"
							params={{ chatId: chatSession.id }}
							key={chatSession.id}
							className="group/link relative flex h-9 w-full 
							items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none 
							hover:bg-sidebar-accent hover:text-sidebar-accent-foreground 
							focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring 
							hover:focus-visible:bg-sidebar-accent bg-sidebar-accent text-sidebar-accent-foreground"
						>
							<SidebarMenuButton className="flex items-center justify-between">
								<ChatSessionItem chatSession={chatSession} />
							</SidebarMenuButton>
						</Link>
					))}
				</SidebarGroup>
				<SidebarGroup className="mt-auto">
					<SidebarGroupLabel>Settings</SidebarGroupLabel>
					<Link to="/settings/llm-providers">
						<SidebarMenuButton>
							<Brain />
							<span>LLM Provider</span>
						</SidebarMenuButton>
					</Link>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									className="group-data-[state=collapsed]:hover:outline-0 group-data-[state=collapsed]:hover:bg-transparent overflow-visible"
									size="lg"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src="https://github.com/shadcn.png?size=40"
											alt="CN"
										/>
										<AvatarFallback>CN</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-heading">
											{data.user.name}
										</span>
										<span className="truncate text-xs">{data.user.email}</span>
									</div>
									<ChevronsUpDown className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
								side={isMobile ? "bottom" : "right"}
								align="end"
								sideOffset={4}
							>
								<DropdownMenuLabel className="p-0 font-base">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src="https://github.com/shadcn.png?size=40"
												alt="CN"
											/>
											<AvatarFallback>CN</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-heading">
												{data.user.name}
											</span>
											<span className="truncate text-xs">
												{data.user.email}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem>
										<Sparkles />
										Upgrade to Pro
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem>
										<BadgeCheck />
										Account
									</DropdownMenuItem>
									<DropdownMenuItem>
										<CreditCard />
										Billing
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Bell />
										Notifications
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<LogOut />
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
