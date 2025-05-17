import type { CoreMessage } from "ai";

export interface ChatSession {
	id: string;
	messages: CoreMessage[];
	forkedChatIds: string[] | undefined;
	projectId: string | undefined;
	tags: string[];
	title: string;
	chatModelId: string | undefined;
	chatProvider: string | undefined;
	createdAt: Date;
	updatedAt: Date;
}
export interface Project {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
}
export interface Profile {
	providers: Record<string, { url: string; apiKey: string; name: string }>;
}
export interface LLMProviderConfig {
	id: string; // Unique identifier, e.g., 'openai', 'lmstudio'
	name: string; // Display name, e.g., "OpenAI", "LM Studio"
	providerKey: string; // Internal key matching createOpenAICompatible names, e.g., "openai", "lmstudio", "ollama", "gemini"
	apiKey?: string;
	baseURL?: string;
	defaultModel?: string;
	enabled: boolean;
}

export interface GeneralAppSettings {
	id: string; // Unique identifier, e.g., 'global'
	titleLlmProviderId?: string; // ID of the LLMProviderConfig for titles
	titleLlmModelId?: string; // Specific model ID for title generation,
	chatLlmProviderId?: string;
	chatLlmModelId?: string;
}

export interface LLMModel {
	id: string;
	providerId: string;
	modelId: string;
	enabled: boolean;
}

export interface User extends Profile {
	id: string;
	username: string;
	password: string;
}
