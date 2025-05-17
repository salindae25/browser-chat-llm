import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { db } from '../db';
import type { LLMProviderConfig } from '../models';
import type { LanguageModel } from "ai";

// Helper function to create a provider instance
const createProvider = (config: LLMProviderConfig) => {
  if (!config.enabled) {
    console.warn(`Provider ${config.name} is disabled.`);
    return null;
  }
  return config.baseURL?createOpenAICompatible({
    name: config.providerKey, // Use providerKey for the 'name' in createOpenAICompatible
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  }):null;
};

// Function to get a specific LLM instance
export const getLLMInstance = async (providerId: string, modelId?: string): Promise<LanguageModel | null> => {
  const config = await db.llmProviders.get(providerId);
  if (!config) {
    console.error(`Configuration for provider ${providerId} not found.`);
    return null;
  }
  const provider = createProvider(config);
  if (!provider) return null;
  return provider(modelId || config.defaultModel || ''); // Fallback to empty string if no modelId or defaultModel
};

// Default LLM instances - these will now fetch configuration dynamically
// For simplicity, we'll hardcode which provider to use for 'llm' and 'titleLlm'
// In a more advanced setup, this could be based on user preference stored in DB

export const getChatLlm = async (): Promise<LanguageModel | null> => {
  // Attempt to get the 'lmstudio' provider, or the first enabled one as a fallback
  let config = await db.llmProviders.get('lmstudio');
  if (!config || !config.enabled) {
    const enabledProviders = await db.llmProviders.where('enabled').equals(1).toArray();
    if (enabledProviders.length > 0) {
      config = enabledProviders[0]; // Use the first enabled provider
    } else {
      console.error("No enabled LLM providers found for chat.");
      return null;
    }
  }
  const provider = createProvider(config);
  return provider ? provider(config.defaultModel || 'default-model') : null;
};

export const getTitleLlm = async (): Promise<LanguageModel | null> => {
  // Attempt to get the 'lmstudio' provider for titles, or fallback
  let config = await db.llmProviders.get('lmstudio'); // Assuming titleLlm also uses lmstudio by default
  if (!config || !config.enabled) {
    const enabledProviders = await db.llmProviders.where('enabled').equals(1).toArray();
    if (enabledProviders.length > 0) {
      // Prefer a potentially lighter model or a specific title generation model if configured
      config = enabledProviders.find(p => p.id === 'ollama') || enabledProviders[0]; 
    } else {
      console.error("No enabled LLM providers found for title generation.");
      return null;
    }
  }
  const provider = createProvider(config);
  // Use a specific model for titles if defined, or defaultModel, or a generic fallback
  return provider ? provider(config.defaultModel || 'default-title-model') : null; 
};

// Example of how you might get a specific provider if needed elsewhere
// export const llm = async () => await getLLMInstance('lmstudio', 'gemma-3-4b-it-qat');
// export const titleLlm = async () => await getLLMInstance('lmstudio', 'llama3.2-1b');

// For direct use in index.ts, we'll need to adjust how llm and titleLlm are exported or used.
// The simplest immediate change is to make the old exports async functions.

export const llm = getChatLlm();
export const titleLlm = getTitleLlm();