import { activeChatStore, messageStore } from "@/lib/chat-store";
import { db } from "@/lib/db";
import {
	createNewChatSession,
	fetchChat,
	updateChatSessionMessages,
} from "@/lib/services";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import type { CoreAssistantMessage } from "ai";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowUpIcon, CircleStop } from "lucide-react";
import { memo, useRef } from "react";
import { Button } from "../ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

export const ChatInput = memo(
	({ isFromRoot = false }: { isFromRoot?: boolean }) => {
		const chatRef = useRef<HTMLTextAreaElement>(null);
		const availableModels = useLiveQuery(() => db.llmModels.toArray());
		const generating = useStore(activeChatStore, (s) => s.generating);
		const chatModelId = useStore(activeChatStore, (s) => s.chatModelId);
		const chatProvider = useStore(activeChatStore, (s) => s.chatProvider);

		const navigate = useNavigate();
		const onSend = async () => {
			if (chatRef.current && !isFromRoot) {
				chatRef.current.value = "";
			}
			if (isFromRoot) {
				navigate({
					to: "/chat/$chatId",
					params: { chatId: activeChatStore.state.chatId },
					replace: true,
				});
			}
			await fetchChat();
		};
		const onEnterPress: React.KeyboardEventHandler<
			HTMLTextAreaElement
		> = async (event) => {
			if (event.key === "Enter") {
				if (
					!activeChatStore.state.generating &&
					activeChatStore.state.userMessage.trim().length !== 0 &&
					!event.shiftKey
				) {
					event.preventDefault();
					event.stopPropagation();
					await onSend();
				} else {
					if (!event.shiftKey) {
						event.preventDefault();
						event.stopPropagation();
					}
				}
			}
		};

		return (
			<div className="border-input bg-background rounded-3xl border p-2 shadow-xs w-full max-w-(--breakpoint-md)">
				<Textarea
					ref={chatRef}
					onChange={(e) => {
						activeChatStore.setState((s) => ({
							...s,
							userMessage: e.target.value,
						}));
					}}
					onFocus={async () => {
						if (isFromRoot) {
							await createNewChatSession();
						}
					}}
					onKeyDown={onEnterPress}
					className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content rounded-md border px-3 py-2 text-base transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-background min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					style={{ maxHeight: "250px" }}
				/>
				<div className="flex gap-4 w-full">
					<Select
						value={`${chatProvider}-${chatModelId || ""}`}
						onValueChange={async (value) => {
							const model = availableModels?.find((m) => m.id === value);
							activeChatStore.setState((s) => ({
								...s,
								chatModelId: model?.modelId || "",
								chatProvider: model?.providerId || "",
							}));
							await db.chatSessions.update(activeChatStore.state.chatId, {
								chatModelId: model?.modelId || "",
								chatProvider: model?.providerId || "",
							});
						}}
					>
						<SelectTrigger className="w-[180px] truncate" title={chatModelId}>
							<SelectValue placeholder="Select a model" />
						</SelectTrigger>
						<SelectContent>
							{availableModels?.map((model) => (
								<SelectItem key={model.id} value={model.id}>
									{model.modelId}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						onClick={
							generating
								? async () => {
										const oldMessages = await db.chatSessions.get(
											activeChatStore.state.chatId,
										);

										activeChatStore.state.abortController?.abort();
										const newAssistantMessage: CoreAssistantMessage = {
											role: "assistant",
											content: activeChatStore.state.activeMessage,
										};
										await updateChatSessionMessages(
											activeChatStore.state.chatId,
											[...(oldMessages?.messages ?? []), newAssistantMessage],
										);
										activeChatStore.setState((s) => ({
											...s,
											generating: false,
											activeMessage: "",
											abortController: null,
										}));
									}
								: onSend
						}
						variant="noShadow"
						className="ml-auto"
						size="icon"
					>
						{generating ? <CircleStop /> : <ArrowUpIcon />}
					</Button>
				</div>
			</div>
		);
	},
);
