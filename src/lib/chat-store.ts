import { Store } from "@tanstack/react-store";
import type { CoreMessage, LanguageModelV1 } from "ai";

const activeStore = new Store<{
	activeMessage: string;
	userMessage: string;
	generating: boolean;
	llm:LanguageModelV1|null
}>({
	activeMessage: "",
	userMessage: "",
	generating: false,
	llm: null,
});

const messageStore = new Store<{ messages: CoreMessage[] }>({
	messages: [],
});

export { activeStore, messageStore };
