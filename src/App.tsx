import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { useStore } from "@tanstack/react-store";
import {
	type CoreAssistantMessage,
	type CoreUserMessage,
	streamText,
} from "ai";
import { ArrowUpIcon, CircleStop } from "lucide-react";
import { memo, useRef } from "react";
import { GeneratingMessage, MessagesSection } from "./components/Chat/message-section";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";

const LocalProvider = createOpenAICompatible({
	name: "provider-name",
	apiKey: "3434",
	baseURL: "http://localhost:1234/v1",
});
const GoogleProvider = createOpenAICompatible({
	name: "gemini",
	apiKey: "AIzaSyDbLBw8UuhuULxMekHecHt-sC3L7rBMOtg",
	baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
});
// const model =GoogleProvider("gemini-2.0-flash-lite");
const model = LocalProvider("gemma-3-4b-it-qat");
import { activeStore, messageStore } from "./lib/chat-store";
const fetchChat = async () => {
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
		model: model,
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

function App() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="m-auto flex h-[calc(100vh-6rem)] w-full max-w-(--breakpoint-md) items-center justify-center">
				<div className="flex h-full w-full flex-col items-center justify-center space-y-4">
					<div className="flex flex-col overflow-y-auto relative w-full flex-1 space-y-4 pe-2" style={{scrollbarWidth: "none"}}>
						<MessagesSection />
						<GeneratingMessage />
					</div>
					<ChatInput />
				</div>
			</div>
		</div>
	);
}
const ChatInput = memo(() => {
	const chatRef = useRef<HTMLTextAreaElement>(null);
  const generating = useStore(activeStore, (s) => s.generating);
	const onSend = async () => {
		activeStore.setState((s) => ({
			...s,
			activeMessage: "",
		}));
		if (chatRef.current) {
			chatRef.current.value = "";
		}
		await fetchChat();
	};
	const onEnterPress: React.KeyboardEventHandler<HTMLTextAreaElement> = async (
		event,
	) => {
		if (event.key === "Enter") {
			event.preventDefault();
			event.stopPropagation();
			if (!activeStore.state.generating) {
				await onSend();
			} else {
				return;
			}
		}
	};
	return (
		<div className="border-input bg-background rounded-3xl border p-2 shadow-xs w-full max-w-(--breakpoint-md)">
			<Textarea
				ref={chatRef}
				onChange={(e) => {
					activeStore.setState((s) => ({
						...s,
						userMessage: e.target.value,
					}));
				}}
				onKeyDown={onEnterPress}
				className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content rounded-md border px-3 py-2 text-base transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-background min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
			/>
			<div className="flex w-full">
				<Button
          disabled={generating}
					onClick={onSend}
					variant="noShadow"
					className="ml-auto"
					size="icon"
				>
					{generating ? <CircleStop /> : <ArrowUpIcon />}
				</Button>
			</div>
		</div>
	);
});
;
export default App;
