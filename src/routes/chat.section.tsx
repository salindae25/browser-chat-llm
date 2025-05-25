import { ChatInput } from "@/components/Chat/chat-input";
import {
	GeneratingMessage,
	MessagesSection,
} from "@/components/Chat/message-section";
import { Button } from "@/components/ui/button";
import ChatLayout from "@/layout/ChatLayout";

import { loadChatSession } from "@/lib/services";
import { type RootRoute, createRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { useEffect } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

function Chat() {
	const chatId = useParams({
		from: "/chat/$chatId",
		select: (params) => params.chatId,
	});
	useEffect(() => {
		if (chatId === "") {
			return;
		}
		loadChatSession(chatId);
	}, [chatId]);
	return (
		<ChatLayout>
			<div className="flex flex-1 flex-col gap-4 pt-0">
				<StickToBottom
					className="m-auto flex flex-col h-[calc(100vh-6rem)] overflow-hidden w-full items-center justify-center relative"
					resize="smooth"
					initial="smooth"
					style={{ scrollbarWidth: "none" }}
				>
					<StickToBottom.Content className="flex flex-col mx-auto gap-4 w-full  max-w-(--breakpoint-md)">
						<div
							className="flex flex-col overflow-y-auto relative w-full py-4 flex-1 space-y-4"
							style={{ scrollbarWidth: "none" }}
						>
							<MessagesSection />
							<GeneratingMessage />
						</div>
					</StickToBottom.Content>

					<ScrollToBottom />
					<ChatInput />
				</StickToBottom>
			</div>
		</ChatLayout>
	);
}

function ScrollToBottom() {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext();

	return (
		!isAtBottom && (
			<Button
				variant="noShadowNeutral"
				type="button"
				className="absolute i-ph-arrow-circle-down-fill cursor-pointer rounded-lg bottom-[6.5rem] bg-[#faebd78a]"
				onClick={() => scrollToBottom()}
				aria-label="Scroll to bottom"
			>
				<ArrowDown className="h-4 w-4" />
				<span>Scroll to bottom</span>
			</Button>
		)
	);
}
export default (parentRoute: RootRoute) =>
	createRoute({
		path: "/chat/$chatId",
		component: Chat,
		getParentRoute: () => parentRoute,
	});
