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
	activeChatStore.setState((s) => ({
		...s,
		generating: true,
		abortController: new AbortController(),
		activeMessage: "",
	}));
	const newUserMessage: CoreUserMessage = {
		role: "user",
		content: activeChatStore.state.userMessage,
	};
	const oldMessages = await db.chatSessions.get(activeChatStore.state.chatId);
	oldMessages?.messages.push(newUserMessage);
	await updateChatSessionMessages(
		activeChatStore.state.chatId,
		oldMessages?.messages ?? [],
	);
	if (oldMessages?.messages.length === 1) {
		titleGenerate();
	}

	const currentLlm = await getChatLlm();
	if (!currentLlm) {
		activeChatStore.setState((s) => ({
			...s,
			generating: false,
			activeMessage: "Error: Chat LLM not configured or available.",
		}));
		await updateChatSessionMessages(activeChatStore.state.chatId, [
			...(oldMessages?.messages ?? []),
			{
				role: "assistant",
				content: "Error: Chat LLM not configured or available.",
			},
		]);
		return;
	}
	try {
		const result = await streamText({
			model: currentLlm,
			system: "You are a helpful assistant.",
			messages: oldMessages?.messages ?? [],
			abortSignal: activeChatStore.state.abortController?.signal,
		});
		for await (const text of result.textStream) {
			activeChatStore.setState((s) => ({
				...s,
				activeMessage: s.activeMessage + text,
			}));
		}

		const newAssistantMessage: CoreAssistantMessage = {
			role: "assistant",
			content: await result.text,
		};

		await updateChatSessionMessages(activeChatStore.state.chatId, [
			...(oldMessages?.messages ?? []),
			newAssistantMessage,
		]);
		activeChatStore.setState((s) => ({
			...s,
			generating: false,
			activeMessage: "",
		}));
	} catch (ex) {
		activeChatStore.setState((s) => ({
			...s,
			generating: false,
			activeMessage: `Error: ${ex}`,
		}));
	}
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

export const regenerateFromMessageIndex = async (
	messageIndex: number,
	chatId: string,
	abortController: AbortController | null,
) => {
	const chatSession = await db.chatSessions.get(chatId);
	if (!chatSession) {
		return;
	}
	const messages = chatSession.messages;
	const oldMessages = messages.slice(0, messageIndex);
	activeChatStore.setState((s) => ({ ...s, generating: true }));
	await updateChatSessionMessages(chatId, oldMessages);
	const currentLlm = await getChatLlm();
	if (!currentLlm) {
		return;
	}
	const { textStream } = streamText({
		model: currentLlm,
		system: "You are a helpful assistant.",
		messages: oldMessages,
		abortSignal: abortController?.signal,
	});
	for await (const text of textStream) {
		activeChatStore.setState((s) => ({
			...s,
			activeMessage: s.activeMessage + text,
		}));
	}
	const newAssistantMessage: CoreAssistantMessage = {
		role: "assistant",
		content: activeChatStore.state.activeMessage,
	};

	await updateChatSessionMessages(chatId, [
		...oldMessages,
		newAssistantMessage,
	]);
	activeChatStore.setState((s) => ({ ...s, generating: false }));
};
