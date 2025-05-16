import { Store } from "@tanstack/react-store";
import type { CoreMessage } from "ai";

const activeStore = new Store<{
	activeMessage: string;
	userMessage: string;
	generating: boolean;
}>({
	activeMessage: "",
	userMessage: "",
	generating: false,
});

const messageStore = new Store<{ messages: CoreMessage[] }>({
	messages: [],
});

export { activeStore, messageStore };
