import { type CoreAssistantMessage, type CoreMessage, type CoreUserMessage, generateText, streamText } from "ai";
import { activeChatStore, messageStore } from "../chat-store";
import {db} from "../db"
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
	if(messageStore.state.messages.length === 1) {
		titleGenerate();
	}
	
	const currentLlm = await getChatLlm();
	if (!currentLlm) {
		console.error("Chat LLM not available.");
		activeChatStore.setState((s) => ({ ...s, generating: false, activeMessage: "Error: Chat LLM not configured or available." }));
		// Optionally, update messageStore to reflect the error to the user
		messageStore.setState((s) => {
			const errorMessage: CoreAssistantMessage = {
				role: "assistant",
				content: "Error: Chat LLM is not configured or available. Please check settings.",
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
export const titleGenerate = async () => {
	const currentTitleLlm = await getTitleLlm();
	if (!currentTitleLlm) {
		console.error("Title LLM not available. Cannot generate title.");
		// Potentially update the chat session with a default title or skip title generation
		db.chatSessions.update(activeChatStore.state.chatId, { title: "Chat (auto-title failed)" });
		return;
	}
	const { text } = await generateText({
		model: currentTitleLlm,
		system: "You are a helpful assistant. Who can generate a title for this chat session based on the messages. it should be simple and short. no more that 4 words. don't include quotes. only the title.",
		prompt: `Messages: ${messageStore.state.messages.map((message) => message.content).join("\n")}`,
	});
	console.log(text)
	db.chatSessions.update(activeChatStore.state.chatId, { title: text });
}
export const createNewChatSession = async () => {
    const currentChatLlm = await getChatLlm();
    let activeModelDetails = { model: 'default-model', provider: 'unknown' };
    if (currentChatLlm) {
        // The modelId and provider are not directly exposed on the LanguageModel type in the same way.
        // We need to fetch the config used to create this LLM or make assumptions.
        // For now, let's try to get the config for 'lmstudio' or the first enabled one.
        let config = await db.llmProviders.get('lmstudio');
        if (!config || !config.enabled) {
            const enabledProviders = await db.llmProviders.where('enabled').equals(1).toArray();
            if (enabledProviders.length > 0) config = enabledProviders[0];
        }
        if (config) {
            activeModelDetails = {
                model: config.defaultModel || 'default-model',
                provider: config.providerKey, // Use providerKey which matches the 'name' in createOpenAICompatible
            };
        }
    }

    const newChatId = await db.chatSessions.add({
        id: crypto.randomUUID(),
        title: "New Chat",
        activeModel: activeModelDetails,
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
	
	