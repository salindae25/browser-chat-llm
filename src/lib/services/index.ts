import type { UseNavigateResult } from "@tanstack/react-router";
import {
	type CoreAssistantMessage,
	type CoreMessage,
	type CoreUserMessage,
	generateObject,
	streamText,
} from "ai";
import { z } from "zod";
import { activeChatStore, messageStore } from "../chat-store";
import { db } from "../db";
import { getChatLlm, getTitleLlm } from "./providers"; // Import the async functions
export const fetchChat = async () => {
	messageStore.setState((s) => {
		const newMessage: CoreUserMessage = {
			role: "user",
			content: activeChatStore.state.userMessage,
		};
		const messages = [...s.messages];
		messages.push(newMessage);
		return { ...s, messages, generating: true };
	});
	activeChatStore.setState((s) => ({ ...s, generating: true }));
	if (messageStore.state.messages.length === 1) {
		titleGenerate();
	}

	const currentLlm = await getChatLlm();
	if (!currentLlm) {
		console.error("Chat LLM not available.");
		activeChatStore.setState((s) => ({
			...s,
			generating: false,
			activeMessage: "Error: Chat LLM not configured or available.",
		}));
		// Optionally, update messageStore to reflect the error to the user
		messageStore.setState((s) => {
			const errorMessage: CoreAssistantMessage = {
				role: "assistant",
				content:
					"Error: Chat LLM is not configured or available. Please check settings.",
			};
			const messages = [...s.messages, errorMessage];
			return { ...s, messages, generating: false };
		});
		return;
	}

	const { textStream } = streamText({
		model: currentLlm,
		system: "You are a helpful assistant.",
		messages: messageStore.state.messages,
	});
	for await (const text of textStream) {
		activeChatStore.setState((s) => ({
			...s,
			activeMessage: s.activeMessage + text,
		}));
	}
	messageStore.setState((s) => {
		const newMessage: CoreAssistantMessage = {
			role: "assistant",
			content: activeChatStore.state.activeMessage,
		};
		const messages = [...s.messages];
		messages.push(newMessage);
		return { ...s, messages };
	});

	activeChatStore.setState((s) => ({ ...s, generating: false }));
};
export const titleGenerate = async (chatId?: string) => {
	const currentTitleLlm = await getTitleLlm();
	if (!currentTitleLlm) {
		console.error("Title LLM not available. Cannot generate title.");
		// Potentially update the chat session with a default title or skip title generation
		db.chatSessions.update(chatId ? chatId : activeChatStore.state.chatId, {
			title: "Chat (auto-title failed)",
		});
		return;
	}
	let messages = [];
	if (chatId) {
		const chatSession = await db.chatSessions.get(chatId);
		messages = chatSession?.messages || [];
	} else {
		messages = messageStore.state.messages;
	}
	const { object: output } = await generateObject({
		model: currentTitleLlm,
		temperature: 0.4,
		prompt: `You are a helpful assistant. you can generate a title for this chat session based on the messages.
		 it should be simple and short. no more that 5 words. don't include quotes. only the title.
		 content to consider: ${messages.map((message) => message.content).join("\n")}`,
		schema: z.object({
			title: z.string(),
		}),
	});
	console.log(output.title);
	db.chatSessions.update(chatId ? chatId : activeChatStore.state.chatId, {
		title: output.title,
	});
};
export const createNewChatSession = async () => {
	const generalSettings = await db.generalSettings.get("global");
	const chatModelId =
		activeChatStore.state.chatModelId ?? generalSettings?.chatLlmModelId;
	const chatProvider =
		activeChatStore.state.chatProvider ?? generalSettings?.chatLlmProviderId;
	const newChatId = await db.chatSessions.add({
		id: crypto.randomUUID(),
		title: "New Chat",
		projectId: undefined,
		tags: [],
		createdAt: new Date(),
		updatedAt: new Date(),
		messages: [],
		chatModelId: chatModelId,
		chatProvider: chatProvider,
		forkedChatIds: undefined,
	});
	activeChatStore.setState((s) => ({
		...s,
		chatId: newChatId,
		chatModelId: chatModelId,
		chatProvider: chatProvider,
	}));
	messageStore.setState((s) => ({ ...s, messages: [] }));
	return newChatId;
};
export const loadChatSession = async (chatId: string) => {
	const chatSession = await db.chatSessions.get(chatId);
	if (!chatSession) {
		return;
	}
	activeChatStore.setState((s) => ({
		...s,
		chatId: chatId,
		chatModelId: chatSession.chatModelId,
		chatProvider: chatSession.chatProvider,
	}));
	messageStore.setState((s) => ({ ...s, messages: chatSession.messages }));
};
export const deleteChatSession = async (
	chatId: string,
	navigate: UseNavigateResult<string>,
) => {
	await db.chatSessions.delete(chatId);
	if (activeChatStore.state.chatId === chatId) {
		activeChatStore.setState((s) => ({ ...s, chatId: "" }));
		messageStore.setState((s) => ({ ...s, messages: [] }));
		navigate({ to: "/" });
	}
};
export const updateChatSessionMessages = async (
	chatId: string,
	messages: CoreMessage[],
) => {
	await db.chatSessions.update(chatId, { messages, updatedAt: new Date() });
};
