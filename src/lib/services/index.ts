import { type CoreAssistantMessage, type CoreUserMessage, streamText } from "ai";
import { activeStore, messageStore } from "../chat-store";
import { llm } from "./providers";


export const fetchChat = async () => {
	messageStore.setState((s) => {
		const newMessage: CoreUserMessage = {
			role: "user",
			content: activeStore.state.userMessage,
		};
		const messages = [...s.messages];
		messages.push(newMessage);
		return { ...s, messages, generating: true };
	});
	activeStore.setState((s) => ({ ...s, generating: true }));
	const { textStream } = streamText({
		model: llm,
		system: "You are a helpful assistant.",
		messages: messageStore.state.messages,
	});
	for await (const text of textStream) {
		activeStore.setState((s) => ({
			...s,
			activeMessage: s.activeMessage + text,
		}));
	}
	messageStore.setState((s) => {
		const newMessage: CoreAssistantMessage = {
			role: "assistant",
			content: activeStore.state.activeMessage,
		};
		const messages = [...s.messages];
		messages.push(newMessage);
		return { ...s, messages };
	});
	activeStore.setState((s) => ({ ...s, generating: false }));
};  