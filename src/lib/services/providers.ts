import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const LMStudioProvider = createOpenAICompatible({
	name: "lmstudio",
	apiKey: "lmstudio",
	baseURL: "http://localhost:1234/v1",
});
const OllamaProvider = createOpenAICompatible({
	name: "ollama",
	apiKey: "ollama",
	baseURL: "http://localhost:11434",
});
const GoogleProvider = createOpenAICompatible({
	name: "gemini",
	apiKey: "AIzaSyDbLBw8UuhuULxMekHecHt-sC3L7rBMOtg",
	baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
});
// const model =GoogleProvider("gemini-2.0-flash-lite");
export const llm = LMStudioProvider("gemma-3-4b-it-qat");

