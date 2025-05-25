import MessageLoading from "@/components/ui/message-loading";
import { activeChatStore } from "@/lib/chat-store";
import { db } from "@/lib/db";
import { regenerateFromMessageIndex } from "@/lib/services";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-store";
import type { CoreMessage } from "ai";
import { useLiveQuery } from "dexie-react-hooks";
import { CopyIcon, RefreshCcwIcon, Trash2Icon } from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { MarkdownText } from "../ui/markdown-text";

export const MessagesSection = memo(() => {
	const chatId = useStore(activeChatStore, (s) => s.chatId);
	const messages = useLiveQuery(async () => {
		const chatSession = await db.chatSessions.get(chatId);
		return chatSession?.messages ?? [];
	}, [chatId]);
	const regenerateFromMessage = async (
		isUserMessage: boolean,
		messageIndex: number,
	) => {
		if (!isUserMessage) {
			activeChatStore.setState((s) => ({
				...s,
				generating: true,
				abortController: new AbortController(),
			}));
			await regenerateFromMessageIndex(
				messageIndex,
				chatId,
				activeChatStore.state.abortController,
			);
			return;
		}
	};
	const deleteChatMessage = async (messageIndex: number) => {
		await db.chatSessions.update(chatId, {
			messages: messages?.slice(0, messageIndex),
		});
	};
	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.info("Message copied to clipboard");
	};
	return (
		<>
			{messages?.map((item, i) => {
				// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
				return (
					<MessageItem
						key={`${chatId}-${i}`}
						data={item}
						messageIndex={i}
						regenerateFromMessage={regenerateFromMessage}
						deleteChatMessage={deleteChatMessage}
						copyToClipboard={copyToClipboard}
					/>
				);
			})}
		</>
	);
});
const MessageItem = ({
	data,
	messageIndex,
	regenerateFromMessage,
	deleteChatMessage,
	copyToClipboard,
}: {
	data: CoreMessage;
	messageIndex: number;
	regenerateFromMessage: (isUserMessage: boolean, messageIndex: number) => void;
	deleteChatMessage: (messageIndex: number) => void;
	copyToClipboard: (text: string) => void;
}) => {
	const isUserMessage = data.role === "user";
	return (
		<div
			className={cn("flex gap-3 w-full", {
				"justify-start": !isUserMessage,
				"justify-end": isUserMessage,
			})}
		>
			<div
				className={cn("relative", {
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
					{typeof data.content === "string" &&
						(!isUserMessage ? (
							<MarkdownText includeRaw={isUserMessage}>
								{data.content}
							</MarkdownText>
						) : (
							data.content
						))}
				</div>
				<div
					className={cn("relative flex gap-1 cursor-pointer", {
						"-bottom-0 -left-1": isUserMessage,
					})}
				>
					{!isUserMessage && (
						<>
							<Button
								aria-label="Delete message and following messages"
								variant="noShadowNeutral"
								className="size-8 border-none cursor-pointer"
								size="icon"
								onClick={() => deleteChatMessage(messageIndex)}
							>
								<Trash2Icon />
							</Button>
							<Button
								aria-label="Regenerate message from this point"
								variant="noShadowNeutral"
								className="size-8 border-none cursor-pointer"
								size="icon"
								onClick={() =>
									regenerateFromMessage(isUserMessage, messageIndex)
								}
							>
								<RefreshCcwIcon />
							</Button>
						</>
					)}
					{!isUserMessage && (
						<Button
							aria-label="Copy message"
							variant="noShadowNeutral"
							className="size-8 border-none cursor-pointer"
							size="icon"
							onClick={() => copyToClipboard(data.content as string)}
						>
							<CopyIcon />
						</Button>
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
				messageIndex={-3}
				data={{ role: "assistant", content: activeMessage }}
				regenerateFromMessage={(
					_isUserMessage: boolean,
					_messageIndex: number,
				): void => {
					return;
				}}
				deleteChatMessage={(_messageIndex: number): void => {
					return;
				}}
				copyToClipboard={(_text: string): void => {
					return;
				}}
			/>
		)
	) : null;
});
