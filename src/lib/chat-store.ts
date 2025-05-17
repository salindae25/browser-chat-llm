import { Store } from "@tanstack/react-store";
import type { CoreMessage } from "ai";
import type { LLMModel } from "./models";

const activeChatStore = new Store<{
	activeMessage: string;
	userMessage: string;
	generating: boolean;
	chatModelId: string | undefined;
	chatProvider: string | undefined;
	chatId: string;
}>({
	chatId: "",
	activeMessage: "",
	userMessage: "",
	generating: false,
	chatModelId: undefined,
	chatProvider: undefined,
});

const messageStore = new Store<{ messages: CoreMessage[] }>({
	messages: [],
});

const sideBarStore = new Store<{ open: boolean }>({
	open: false,
});
const modelStore = new Store<{ models: LLMModel[] }>({
	models: [],
});
export { activeChatStore, messageStore, sideBarStore, modelStore };
