import MessageLoading from "@/components/ui/message-loading";
import { activeStore, messageStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-store";
import type { CoreMessage } from "ai";
import { Copy } from "lucide-react";
import { memo } from "react";
import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

const codeComponent: Components = {
	p: ({ children }: { children: ReactNode }) => <p className="prose prose-sm">{children}</p>,
	h1: ({ children }: { children: ReactNode }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
	h2: ({ children }: { children: ReactNode }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
	h3: ({ children }: { children: ReactNode }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
	h4: ({ children }: { children: ReactNode }) => <h4 className="text-base font-medium mb-1">{children}</h4>,
	code: ({ className, children, inline, ...props }: ComponentProps<'code'>) => {
		if (inline) {
			return (
				<code className={className} {...props}>
					{children}
				</code>
			);
		}
		const match = /language-(\w+)/.exec(className || '');
		const language = match ? match[1] : '';
		const code = String(children).replace(/^\s+|\s+$/g, '');
		const [copied, setCopied] = useState(false);

		const handleCopy = () => {
			navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		};

		return (
			<div className="relative group">
				<SyntaxHighlighter
					language={language}
					style={vscDarkPlus}
					className="rounded-lg overflow-x-auto bg-muted/50"
					customStyle={{
						padding: '1rem',
						borderRadius: '0.5rem',
					}}
				>
					{code}
				</SyntaxHighlighter>
				<button
					onClick={handleCopy}
					type="button"
					className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-muted/50 p-1"
				>
					<Copy className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-muted-foreground'}`} />
				</button>
			</div>
		);
	}
};


export const MessagesSection = memo(() => {
	const messages = useStore(messageStore, (s) => s.messages);
	return (
		<>
			{messages.map((item, i) => {
				return <MessageItem key={i} data={item} />;
			})}
		</>
	);
});
const MessageItem = ({ data }: { data: CoreMessage }) => {
	const isUserMessage = data.role === "user";
	return (
		<div
			className={cn("flex gap-3", {
				"justify-start": !isUserMessage,
				"justify-end": isUserMessage,
			})}
		>
			<div className="max-w-[85%] flex-1 sm:max-w-[75%]">
				<div className="bg-muted text-foreground prose rounded-lg border px-3 py-2">
					{typeof data.content === "string" && (
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							components={{
								p: ({ children }) => <p className="prose prose-sm">{children}</p>,
								h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
								h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
								h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
								h4: ({ children }) => <h4 className="text-base font-medium mb-1">{children}</h4>,
								code: ({ className, children, inline, ...props }) => {
									if (inline) {
										return (
											<code className={className} {...props}>
												{children}
											</code>
										);
									}
									const match = /language-(\w+)/.exec(className || '');
									const language = match ? match[1] : '';
									const code = String(children).replace(/^\s+|\s+$/g, '');
									const [copied, setCopied] = useState(false);

									const handleCopy = () => {
										navigator.clipboard.writeText(code);
										setCopied(true);
										setTimeout(() => setCopied(false), 2000);
									};

									return (
										<div className="relative group">
											<SyntaxHighlighter
												language={language}
												style={vscDarkPlus}
												className="rounded-lg overflow-x-auto bg-muted/50"
												customStyle={{
													padding: '1rem',
													borderRadius: '0.5rem',
												}}
											>
												{code}
											</SyntaxHighlighter>
											<button
												onClick={handleCopy}
												type="button"
												className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-muted/50 p-1"
											>
												<Copy className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-muted-foreground'}`} />
											</button>
										</div>
									);
								}
							}}
						>
							{data.content}
						</ReactMarkdown>
					)}
				</div>
			</div>
		</div>
	);
}
export const GeneratingMessage = memo(() => {
	const activeMessage = useStore(activeStore, (s) => s.activeMessage);
	const generating = useStore(activeStore, (s) => s.generating);
	return generating ? (
		activeMessage === "" ? (
			<MessageLoading />
		) : (
			<MessageItem
				key={-3}
				data={{ role: "assistant", content: activeMessage }}
			/>
		)
	) : null;
});