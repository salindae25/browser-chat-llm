import { db } from "@/lib/db";
import type { LLMProviderConfig } from "@/lib/models";
// Import Tailwind v4 via browser plugin (for example, CDN link)
import { type RootRoute, createRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useState, useEffect } from "react";

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
			llmProviders.forEach((p) => {
				initialSettings[p.id] = { ...p };
			});
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
		<div className="min-h-screen flex bg-gray-50 font-sans">
			{/* Sidebar */}
			<aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r shadow-sm transition duration-300">
				<h2 className="font-bold text-xl py-6 px-6">LLM Configurator</h2>
				<nav className="flex-grow space-y-4 px-6 py-2">
					<a
						href="#openai"
						className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-3 font-semibold"
					>
						🧠 OpenAI
					</a>
					<a
						href="#groq"
						className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-3 font-semibold"
					>
						🔥 Groq
					</a>
					<a
						href="#gemini"
						className="text-gray-700 hover:text-indigo-600 transition flex items-center gap-3 font-semibold"
					>
						🌈 Gemini
					</a>
				</nav>
			</aside>

			{/* Content */}
			<main className="flex-grow p-8 max-w-full animate-fade-in">
				{(!llmProviders || Object.keys(providerSettings).length === 0) && (
					<p>Loading provider settings...</p>
				)}
				{llmProviders && Object.keys(providerSettings).length > 0 && (
					<form onSubmit={handleSubmit}>
						<h1 className="text-2xl md:text-3xl font-bold mb-4">
							Configure LLM Providers
						</h1>

						{/* Dynamic Provider Sections */}
						{llmProviders?.map((provider) => (
							<div
								key={provider.id}
								id={provider.id}
								className="mb-6 space-y-4 transition duration-500 rounded-lg shadow p-6 bg-white border"
							>
								<h2 className="font-semibold text-xl flex items-center gap-3 mb-4">
									{provider.name}
								</h2>
								<label className="flex items-center gap-3 mt-4">
									<input
										type="checkbox"
										checked={providerSettings[provider.id]?.enabled ?? false}
										onChange={(e) =>
											handleInputChange(
												provider.id,
												"enabled",
												e.target.checked,
											)
										}
									/>
									Enable {provider.name}
								</label>
								{(provider.providerKey === "openai" ||
									provider.providerKey === "gemini" ||
									provider.providerKey === "groq") && (
									<label className="flex flex-col sm:flex-row justify-between w-full">
										<div>
											<span className="text-gray-700 font-medium">API Key</span>
											<input
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
												className="mt-1 border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 ring-indigo-500"
											/>
										</div>
									</label>
								)}
								{(provider.providerKey === "lmstudio" ||
									provider.providerKey === "ollama" ||
									provider.providerKey === "openai" ||
									provider.providerKey === "gemini" ||
									provider.providerKey === "groq") && (
									<label className="flex flex-col sm:flex-row justify-between w-full">
										<div>
											<span className="text-gray-700 font-medium">
												Base URL
											</span>
											<input
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
												className="mt-1 border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 ring-indigo-500"
											/>
										</div>
									</label>
								)}
								{(provider.providerKey === "openai" ||
									provider.providerKey === "gemini" ||
									provider.providerKey === "lmstudio" ||
									provider.providerKey === "ollama" ||
									provider.providerKey === "groq") && (
									<div className="flex flex-col sm:flex-row gap-4 mt-4">
										<div>
											<span className="text-gray-700 font-medium">
												Default Model
											</span>
											<input
												type="text"
												value={
													providerSettings[provider.id]?.defaultModel ?? ""
												}
												onChange={(e) =>
													handleInputChange(
														provider.id,
														"defaultModel",
														e.target.value,
													)
												}
												placeholder="Enter default model ID"
												className="mt-1 border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 ring-indigo-500"
											/>
										</div>
									</div>
								)}
							</div>
						))}

						{/* Removed static sections as they are now dynamically generated */}
						<button
							type="submit"
							className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition duration-200"
						>
							Save Settings
						</button>
					</form>
				)}
			</main>
		</div>
	);
};

export default (parentRoute: RootRoute) =>
	createRoute({
		path: "/settings/llm-providers",
		component: SettingsLLM,
		getParentRoute: () => parentRoute,
	});
