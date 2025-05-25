import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [viteReact(), tailwindcss()],
	test: {
		globals: true,
		environment: "jsdom",
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					ai_sdk: [
						"@ai-sdk/google",
						"@ai-sdk/openai",
						"@ai-sdk/openai-compatible",
						"@ai-sdk/groq",
					],
					react: ["react", "react-dom", "@ai-sdk/react"],
					markdown: ["react-markdown"],
					syntax_highlighter: ["react-syntax-highlighter"],
					vendor: [
						"@radix-ui/react-avatar",
						"@radix-ui/react-collapsible",
						"@radix-ui/react-dialog",
						"@radix-ui/react-dropdown-menu",
						"@radix-ui/react-label",
						"@radix-ui/react-select",
						"@radix-ui/react-slot",
						"@radix-ui/react-switch",
						"@radix-ui/react-tooltip",
						"lucide-react",
						"sonner",
						"date-fns",
						"dexie",
					],
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
