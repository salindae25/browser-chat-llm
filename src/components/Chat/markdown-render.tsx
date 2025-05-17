import { cn } from "@/lib/utils";
import {
	type HTMLAttributes,
	type ReactNode,
	useCallback,
	useState
} from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { gruvboxLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ children, includeRaw }: { children: string, includeRaw?: boolean }) {
	return (
		<Markdown
			remarkPlugins={[remarkGfm]}
			rehypePlugins={includeRaw ? [rehypeRaw] : []}
			components={{
				h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
					<h1 className="text-2xl font-bold my-2" {...props} />
				),
				h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
					<h2 className="text-xl font-semibold my-2" {...props} />
				),
				h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
					<h3 className="text-lg font-medium my-2" {...props} />
				),
				h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
					<h4 className="text-base font-medium my-2" {...props} />
				),
				li: ({ children, ...props }: HTMLAttributes<HTMLLIElement>) => (
					<li className="text-base font-medium my-2 pl-4" {...props}>
						{children}
					</li>
				),
				ol: ({ children, ...props }: HTMLAttributes<HTMLOListElement>) => (
					<ol className="text-base font-medium my-2 pl-1 list-decimal" {...props}>
						{children}
					</ol>
				),
				ul: ({ children, ...props }: HTMLAttributes<HTMLUListElement>) => (
					<ul className="text-base font-medium my-2 pl-1 list-disc list-inside marker:text-amber-800" {...props}>
						{children}
					</ul>
				),
				code({
					className,
					children: codeChildren,
					...props
				}: HTMLAttributes<HTMLElement>) {
					const match = /language-(\w+)/.exec(className || "");
					return match ? (
						<CustomCodeContainer
							language={match[1]}
							codeChildren={codeChildren}
						>
							<SyntaxHighlighter
								style={gruvboxLight}
								PreTag={"div"}
								language={match[1]}
							>
								{String(codeChildren).replace(/\n$/, "")}
							</SyntaxHighlighter>
						</CustomCodeContainer>
					) : (
						<code className={cn("bg-gray-100", className)} {...props}>
							{codeChildren}
						</code>
					);
				},
				p: (props: HTMLAttributes<HTMLParagraphElement>) => {
					const { children, ...rest } = props;
					return (
						<p
							className="text-base font-medium my-1"
							{...rest}
						>
							{children}
						</p>
					);
				},
			}}
		>
			{children}
		</Markdown>
	);
}
const CustomCodeContainer = ({
	children,
	language,
	codeChildren,
}: { children: ReactNode; language?: string; codeChildren?: ReactNode }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		if (!codeChildren) return;
		const code = String(codeChildren);
		console.log(code);
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [codeChildren]);
	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between text-md bg-gray-200 text-gray-600 px-4 py-1 h-8 rounded-t-lg font-mono">
				<span>{language}</span>
				<button type="button" className="cursor-pointer" onClick={handleCopy}>
					{copied ? "Copied" : "Copy"}
				</button>
			</div>
			<div className="bg-gray-100">{children}</div>
		</div>
	);
};
