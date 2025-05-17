import { Store } from "@tanstack/react-store";
import type { CoreMessage, LanguageModelV1 } from "ai";

const activeChatStore = new Store<{
	activeMessage: string;
	userMessage: string;
	generating: boolean;
	llm:LanguageModelV1|null,
	chatId: string,
}>({
	chatId: "",
	activeMessage: "",
	userMessage: "",
	generating: false,
	llm: null,
});

const messageStore = new Store<{ messages: CoreMessage[] }>({
	messages: [],
});

const sideBarStore = new Store<{ open: boolean }>({
	open: false,
});
export { activeChatStore, messageStore, sideBarStore };
