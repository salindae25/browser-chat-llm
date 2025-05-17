
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { db } from "../db";
import type { LLMProviderConfig } from "../models";

// Helper function to create a provider instance
const createProvider = (config: LLMProviderConfig) => {
	if (!config.enabled) {
		console.warn(`Provider ${config.name} is disabled.`);
		return null;
	}
  if(!config.baseURL){
    return null
  }
  switch (config.providerKey) {
    case 'google':
      return createGoogleGenerativeAI({
        apiKey: config.apiKey,
      });
    case 'groq':
      return createGroq({
        apiKey: config.apiKey,
      });
    case 'openai':
      return createOpenAI({
        name: config.providerKey, // Use providerKey for the 'name' in createOpenAICompatible
        apiKey: config.apiKey,
        baseURL: config.baseURL,
			})
		default:
      return createOpenAICompatible({
        name: config.providerKey, // Use providerKey for the 'name' in createOpenAICompatible
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      })
		}
};

// Function to get a specific LLM instance
export const getLLMInstance = async (
	providerId: string,
	modelId?: string,
): Promise<LanguageModel | null> => {
	const config = await db.llmProviders.get(providerId);
	if (!config) {
		console.error(`Configuration for provider ${providerId} not found.`);
		return null;
	}
	const provider = createProvider(config);
	if (!provider) return null;
	return provider(modelId || config.defaultModel || ""); // Fallback to empty string if no modelId or defaultModel
};

// Default LLM instances - these will now fetch configuration dynamically
// For simplicity, we'll hardcode which provider to use for 'llm' and 'titleLlm'
// In a more advanced setup, this could be based on user preference stored in DB

export const getChatLlm = async (): Promise<LanguageModel | null> => {
	const generalSettings = await db.generalSettings.get("global");
	if (generalSettings?.chatLlmProviderId && generalSettings.chatLlmModelId) {
		const config = await db.llmProviders.get(
			generalSettings.chatLlmProviderId,
		);
		if (config?.enabled) {
			const provider = createProvider(config);
			if (provider) {
				return provider(generalSettings.chatLlmModelId);
			}
		} else if (config && !config.enabled) {
			console.warn(
				`Globally configured chat LLM provider '${config.name}' is disabled. Falling back.`,
			);
		} else if (!config) {
			console.warn(
				`Globally configured chat LLM provider ID '${generalSettings.chatLlmProviderId}' not found. Falling back.`,
			);
		}
	} else {
		console.log(
			"No global chat LLM configured or configuration incomplete. Falling back to default chat LLM logic.",
		);
	}
	return null;
};

export const getTitleLlm = async (): Promise<LanguageModel | null> => {
	const generalSettings = await db.generalSettings.get("global");
	if (generalSettings?.titleLlmProviderId && generalSettings.titleLlmModelId) {
		const config = await db.llmProviders.get(
			generalSettings.titleLlmProviderId,
		);
		if (config?.enabled) {
			const provider = createProvider(config);
			if (provider) {
				return provider(generalSettings.titleLlmModelId);
			}
		} else if (config && !config.enabled) {
			console.warn(
				`Globally configured title LLM provider '${config.name}' is disabled. Falling back.`,
			);
		} else if (!config) {
			console.warn(
				`Globally configured title LLM provider ID '${generalSettings.titleLlmProviderId}' not found. Falling back.`,
			);
		}
	} else {
		console.log(
			"No global title LLM configured or configuration incomplete. Falling back to default title LLM logic.",
		);
	}
	return null;
};

// Example of how you might get a specific provider if needed elsewhere
// export const llm = async () => await getLLMInstance('lmstudio', 'gemma-3-4b-it-qat');
// export const titleLlm = async () => await getLLMInstance('lmstudio', 'llama3.2-1b');

// For direct use in index.ts, we'll need to adjust how llm and titleLlm are exported or used.
// The simplest immediate change is to make the old exports async functions.

export const llm = getChatLlm();
export const titleLlm = getTitleLlm();


