import { ChatInput } from "@/components/Chat/chat-input";
import { GeneratingMessage, MessagesSection } from "@/components/Chat/message-section";
import { activeChatStore, messageStore } from "@/lib/chat-store";
import { loadChatSession, updateChatSessionMessages } from "@/lib/services";
import { type RootRoute, createRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";

const ChatSection = () => {
    const chatId = useParams({from: "/chat/$chatId", select: (params) => params.chatId});
    useEffect(() => {
        if(chatId === "") {
            return;
        }
        const unsub = messageStore.subscribe((s) => {
			updateChatSessionMessages(
				activeChatStore.state.chatId,
				s.currentVal.messages,
			);
		});
        loadChatSession(chatId);
        return () => {
            if (unsub) {
                unsub();
            }
        };
    }, [chatId]);
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="m-auto flex h-[calc(100vh-6rem)] w-full max-w-(--breakpoint-md) items-center justify-center">
				<div className="flex h-full w-full flex-col items-center justify-center space-y-4">
					<div className="flex flex-col overflow-y-auto relative w-full flex-1 space-y-4 pe-2" style={{scrollbarWidth: "none"}}>
						<MessagesSection />
						<GeneratingMessage />
					</div>
					<ChatInput />
				</div>
			</div>
		</div>
	);
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/chat/$chatId",
    component: ChatSection,
    getParentRoute: () => parentRoute,
  });