import { activeStore } from "@/lib/chat-store";
import { fetchChat } from "@/lib/services";
import { useStore } from "@tanstack/react-store";
import { ArrowUpIcon, CircleStop } from "lucide-react";
import { memo, useRef } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export const ChatInput = memo(() => {
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