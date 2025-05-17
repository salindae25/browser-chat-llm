import { type CoreAssistantMessage, type CoreMessage, type CoreUserMessage, generateText, streamText } from "ai";
import { activeChatStore, messageStore } from "../chat-store";
import {db} from "../db"
import { llm,titleLlm } from "./providers";

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
	if(messageStore.state.messages.length === 1) {
		titleGenerate();
	}
	
	const { textStream } = streamText({
		model: llm,
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
export const titleGenerate = async () => {
	const { text } = await generateText({
		model: titleLlm,
		system: "You are a helpful assistant. Who can generate a title for this chat session based on the messages. it should be simple and short. no more that 4 words. don't include quotes. only the title.",
		prompt: `Messages: ${messageStore.state.messages.map((message) => message.content).join("\n")}`,
	});
	console.log(text)
	db.chatSessions.update(activeChatStore.state.chatId, { title: text });
}
export const createNewChatSession = async () => {
    const newChatId = await db.chatSessions.add({
        id: crypto.randomUUID(), // Add this line to generate a unique ID
        title: "New Chat",
        activeModel: {
            model: llm.modelId,
            provider: llm.provider,
        },
        projectId: undefined,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        forkedChatIds: undefined
    });
    activeChatStore.setState((s) => ({ ...s, chatId: newChatId }));
    messageStore.setState((s) => ({ ...s, messages: [] }));
}
export const loadChatSession = async (chatId: string) => {
	const chatSession = await db.chatSessions.get(chatId);
	if (!chatSession) {
		return;
	}
	activeChatStore.setState((s) => ({ ...s, chatId: chatId }));
	messageStore.setState((s) => ({ ...s, messages: chatSession.messages }));
}
export const deleteChatSession = async (chatId: string,navigate:(to:string)=>void) => {
	await db.chatSessions.delete(chatId);
	if(activeChatStore.state.chatId === chatId ) {
		activeChatStore.setState((s) => ({ ...s, chatId: "" }));
		messageStore.setState((s) => ({ ...s, messages: [] }));
		navigate("/");
	}
}
export const updateChatSessionMessages = async (chatId: string, messages: CoreMessage[]) => {
	await db.chatSessions.update(chatId, { messages, updatedAt: new Date() });
}
	
	