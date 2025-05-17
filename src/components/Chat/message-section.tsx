import MessageLoading from "@/components/ui/message-loading";
import { activeChatStore, messageStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-store";
import type { CoreMessage } from "ai";
import { memo } from "react";
import MarkdownRenderer from "./markdown-render";

export const MessagesSection = memo(() => {
	const messages = useStore(messageStore, (s) => s.messages);
	return (
		<>
			{messages.map((item, i) => {
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				return <MessageItem key={i} data={item} />;
			})}
		</>
	);
});
const MessageItem = ({ data }: { data: CoreMessage }) => {
	const isUserMessage = data.role === "user";
	return (
		<div
			className={cn("flex gap-3 w-full", {
				"justify-start": !isUserMessage,
				"justify-end": isUserMessage,
			})}
		>
			<div
				className={cn( {
					"max-w-[85%] flex-1 sm:max-w-[75%]": isUserMessage,
					"max-w-full flex-1": !isUserMessage,
				})}
			>
				<div
					className={cn("text-foreground prose rounded-lg px-3 py-2", {
						"bg-primary": !isUserMessage,
						"bg-secondary-background border": isUserMessage,
					})}
				>
					{typeof data.content === "string" && (
						<MarkdownRenderer>
							{data.content.replace(/(\[.*?\])/g, "$1\n")}
						</MarkdownRenderer>
					)}
				</div>
			</div>
		</div>
	);
};
export const GeneratingMessage = memo(() => {
	const activeMessage = useStore(activeChatStore, (s) => s.activeMessage);
	const generating = useStore(activeChatStore, (s) => s.generating);
	return generating ? (
		activeMessage === "" ? (
			<MessageLoading />
		) : (
			<MessageItem
				key={-3}
				data={{ role: "assistant", content: activeMessage }}
			/>
		)
	) : null;
});
