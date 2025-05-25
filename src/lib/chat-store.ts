import { Store } from "@tanstack/react-store";
import type { LLMModel } from "./models";

const activeChatStore = new Store<{
	activeMessage: string;
	userMessage: string;
	generating: boolean;
	chatModelId: string | undefined;
	chatProvider: string | undefined;
	abortController: AbortController | null;
	systemMessage: string;
	chatId: string;
}>({
	chatId: "",
	activeMessage: "",
	systemMessage: "You are a helpful assistant.",
	userMessage: "",
	generating: false,
	chatModelId: undefined,
	chatProvider: undefined,
	abortController: null,
});

const sideBarStore = new Store<{ open: boolean }>({
	open: false,
});
const modelStore = new Store<{ models: LLMModel[] }>({
	models: [],
});
export { activeChatStore, sideBarStore, modelStore };
