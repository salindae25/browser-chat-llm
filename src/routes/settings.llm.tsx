import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import type { LLMProviderConfig } from "@/lib/models";
// Import Tailwind v4 via browser plugin (for example, CDN link)
import { Link, type RootRoute, createRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";

const SettingsLLM = () => {
	const llmProviders = useLiveQuery(() => db.llmProviders.toArray());

	// State for individual provider settings - this will be refactored to be more dynamic
	const [providerSettings, setProviderSettings] = useState<
		Record<string, Partial<LLMProviderConfig>>
	>({});

	useEffect(() => {
		const initializeProviders = async () => {
			const existingProviders = await db.llmProviders.toArray();
			const defaultProviders: LLMProviderConfig[] = [
				{
					id: "openai",
					name: "OpenAI",
					providerKey: "openai",
					apiKey: "",
					baseURL: "https://api.openai.com/v1",
					defaultModel: "gpt-4",
					enabled: false,
				},
				{
					id: "lmstudio",
					name: "LM Studio",
					providerKey: "lmstudio",
					apiKey: "lmstudio",
					baseURL: "http://localhost:1234/v1",
					defaultModel: "loaded-model",
					enabled: true,
				},
				{
					id: "ollama",
					name: "Ollama",
					providerKey: "ollama",
					apiKey: "ollama",
					baseURL: "http://localhost:11434/v1",
					defaultModel: "llama3",
					enabled: false,
				},
				{
					id: "gemini",
					name: "Gemini",
					providerKey: "gemini",
					apiKey: "",
					baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
					defaultModel: "gemini-pro",
					enabled: false,
				},
				{
					id: "groq",
					name: "Groq",
					providerKey: "groq",
					apiKey: "",
					baseURL: "https://api.groq.com/openai/v1",
					defaultModel: "mixtral-8x7b-32768",
					enabled: false,
				},
			];

			if (existingProviders.length === 0) {
				await db.llmProviders.bulkAdd(defaultProviders);
			} else {
				// Ensure all default providers exist, add if not
				for (const defaultProvider of defaultProviders) {
					const exists = existingProviders.find(
						(p) => p.id === defaultProvider.id,
					);
					if (!exists) {
						await db.llmProviders.add(defaultProvider);
					}
				}
			}
		};
		initializeProviders();
	}, []);

	useEffect(() => {
		if (llmProviders) {
			const initialSettings: Record<string, Partial<LLMProviderConfig>> = {};
			for (const p of llmProviders) {
				initialSettings[p.id] = { ...p };
			}
			setProviderSettings(initialSettings);
		}
	}, [llmProviders]);

	const handleInputChange = (
		providerId: string,
		field: keyof LLMProviderConfig,
		value: string | boolean,
	) => {
		setProviderSettings((prev) => ({
			...prev,
			[providerId]: {
				...prev[providerId],
				[field]: value,
			},
		}));
	};

	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		if (!llmProviders) return;

		try {
			for (const provider of llmProviders) {
				const settingsToUpdate = providerSettings[provider.id];
				if (settingsToUpdate) {
					await db.llmProviders.update(provider.id, settingsToUpdate);
				}
			}
			alert("Settings saved successfully!");
		} catch (error) {
			console.error("Failed to save settings:", error);
			alert("Failed to save settings. Check console for details.");
		}
	};

	return (
		<div className="flex w-full justify-center">
			<div className="flex flex-col p-6 gap-8 w-full max-w-6xl">
				<Link to="/">
					<button
						type="button"
						className="flex items-center space-x-2 text-main-foreground hover:text-main-foreground-dark"
					>
						<ArrowLeftIcon className="h-6 w-6" />
						<span>Back to Chat</span>
					</button>
				</Link>

				<div className="flex justify-between items-center">
					<h1 className="text-3xl font-bold tracking-tight">
						LLM Provider Settings
					</h1>
				</div>
				<form onSubmit={handleSubmit} className="w-full">
					{(!llmProviders || Object.keys(providerSettings).length === 0) && (
						<p>Loading provider settings...</p>
					)}
					{llmProviders && Object.keys(providerSettings).length > 0 && (
						<Tabs defaultValue={llmProviders[0].id} className="w-full">
							<TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
								{llmProviders.map((provider) => (
									<TabsTrigger
										key={provider.id}
										value={provider.id}
										className="w-full justify-center"
									>
										{provider.name}
									</TabsTrigger>
								))}
							</TabsList>
							{/* Provider Settings Cards */}
							{llmProviders.map((provider) => (
								<TabsContent
									key={provider.id}
									value={provider.id}
									className="space-y-4"
								>
									<Card>
										<CardHeader>
											<CardTitle>{provider.name}</CardTitle>
											<CardDescription>
												Configure {provider.name} settings
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Keep your existing form fields here */}
											<div className="space-y-2">
												<label className="flex items-center gap-3">
													<input
														type="checkbox"
														checked={
															providerSettings[provider.id]?.enabled ?? false
														}
														onChange={(e) =>
															handleInputChange(
																provider.id,
																"enabled",
																e.target.checked,
															)
														}
														className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
													<span>Enable {provider.name}</span>
												</label>
											</div>

											{(provider.providerKey === "openai" ||
												provider.providerKey === "gemini" ||
												provider.providerKey === "groq") && (
												<div className="space-y-2">
													<Label>API Key</Label>
													<Input
														type="password"
														value={providerSettings[provider.id]?.apiKey ?? ""}
														onChange={(e) =>
															handleInputChange(
																provider.id,
																"apiKey",
																e.target.value,
															)
														}
														placeholder="Enter your API key..."
														className="w-full"
													/>
												</div>
											)}

											{(provider.providerKey === "lmstudio" ||
												provider.providerKey === "ollama") && (
												<div className="space-y-2">
													<Label>Base URL</Label>
													<Input
														type="text"
														value={providerSettings[provider.id]?.baseURL ?? ""}
														onChange={(e) =>
															handleInputChange(
																provider.id,
																"baseURL",
																e.target.value,
															)
														}
														placeholder="Enter Base URL (e.g., http://localhost:1234/v1)"
														className="w-full"
													/>
												</div>
											)}
										</CardContent>
										<CardFooter>
											<Button type="submit" className="w-full sm:w-auto">
												Save Settings
											</Button>
										</CardFooter>
									</Card>
								</TabsContent>
							))}
						</Tabs>
					)}
				</form>
			</div>
		</div>
	);
};

export default (parentRoute: RootRoute) =>
	createRoute({
		path: "/settings/llm-providers",
		component: SettingsLLM,
		getParentRoute: () => parentRoute,
	});
