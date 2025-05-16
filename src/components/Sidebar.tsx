import {
	AudioWaveform,
	BadgeCheck,
	Bell,
	BookOpen,
	Bot,
	Brain,
	ChevronRight,
	ChevronsUpDown,
	Command,
	CreditCard,
	Folder,
	Forward,
	Frame,
	GalleryVerticalEnd,
	LogOut,
	Map,
	MoreHorizontal,
	PieChart,
	Plus,
	Settings2,
	Sparkles,
	SquareTerminal,
	Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
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
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/logo.svg";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "./ui/button";

// This is sample data.
const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Acme Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: Command,
			plan: "Free",
		},
	],
	navMain: [
		{
			title: "Playground",
			url: "#",
			icon: SquareTerminal,
			isActive: true,
			items: [
				{
					title: "History",
					url: "#",
				},
				{
					title: "Starred",
					url: "#",
				},
				{
					title: "Settings",
					url: "#",
				},
			],
		},
		{
			title: "Models",
			url: "#",
			icon: Bot,
			items: [
				{
					title: "Genesis",
					url: "#",
				},
				{
					title: "Explorer",
					url: "#",
				},
				{
					title: "Quantum",
					url: "#",
				},
			],
		},
		{
			title: "Documentation",
			url: "#",
			icon: BookOpen,
			items: [
				{
					title: "Introduction",
					url: "#",
				},
				{
					title: "Get Started",
					url: "#",
				},
				{
					title: "Tutorials",
					url: "#",
				},
				{
					title: "Changelog",
					url: "#",
				},
			],
		},
		{
			title: "Settings",
			url: "#",
			icon: Settings2,
			items: [
				{
					title: "General",
					url: "#",
				},
				{
					title: "Team",
					url: "#",
				},
				{
					title: "Billing",
					url: "#",
				},
				{
					title: "Limits",
					url: "#",
				},
			],
		},
	],
	projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { isMobile } = useSidebar();
	const [activeTeam, setActiveTeam] = React.useState(data.teams[0]);

	if (!activeTeam) {
		return null;
	}

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<Link to="/">
				<div className="flex gap-4 items-center">
					<div className="flex aspect-square size-10 items-center justify-center rounded-base">
						<img src={logo} alt="logo" className="size-10 relative left-[-4px]" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-heading">LLM Chat</span>
					</div>
				</div>
				</Link>
			</SidebarHeader>
			<SidebarContent>

				<SidebarGroup>
					<SidebarMenuButton className="hover:cursor-pointer outline-border text-main-foreground bg-main transition-all active:translate-x-reverseBoxShadowX active:translate-y-reverseBoxShadowY active:shadow-shadow" tooltip="Add New Chat" onClick={() => {}} >
						<Plus />
						<span>New Chat</span>
					</SidebarMenuButton>
				</SidebarGroup>
				<SidebarGroup className="h-full">
					<SidebarGroupLabel>History</SidebarGroupLabel>
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
