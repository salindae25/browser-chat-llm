import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activeChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import { Settings2 } from "lucide-react";
import { useRef, useState } from "react";
const ChatSystemPrompt = ({ className }: { className?: string }) => {
	return (
		<div className={cn("text-foreground/50", className)}>
			<ChatSystemPromptDialog
				TriggerButton={
					<Settings2 role="button" className="size-4 cursor-pointer" />
				}
			/>
		</div>
	);
};
export default ChatSystemPrompt;

export function ChatSystemPromptDialog({
	TriggerButton,
}: { TriggerButton: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const systemPromptRef = useRef<HTMLInputElement>(null);
	const updateSystemPrompt = () => {
		activeChatStore.setState((s) => ({
			...s,
			systemMessage: systemPromptRef.current?.value ?? "",
		}));
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{TriggerButton}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Chat System Prompt</DialogTitle>
					<DialogDescription>
						Enter your system prompt here. Click save when you&apos;re done.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 pb-4">
					<div className="grid gap-3">
						<Label htmlFor="system-prompt">System Prompt</Label>
						<Input
							id="system-prompt"
							name="system-prompt"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									updateSystemPrompt();
								}
							}}
							defaultValue={activeChatStore.state.systemMessage}
							ref={systemPromptRef}
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="neutral">Cancel</Button>
					</DialogClose>
					<Button type="button" onClick={updateSystemPrompt}>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
