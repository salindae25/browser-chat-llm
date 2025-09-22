# Copilot Instructions for Browser Chat LLM

## Repository Overview

This is a browser-based chat interface for interacting with multiple Large Language Models (LLMs). The application runs entirely in the browser with no server-side component - all conversation data is stored locally in IndexedDB for privacy.

**Repository Type**: Frontend web application  
**Primary Languages**: TypeScript, React  
**Size**: Medium (50+ source files)  
**Target Runtime**: Modern web browsers  

### Key Features
- Multiple LLM provider support (OpenAI, Google Gemini, Groq, OpenAI-compatible endpoints like LM Studio and Ollama)
- Local IndexedDB storage for conversations and settings
- Serverless architecture with client-side only operation
- Project organization and chat tagging capabilities
- Modern React with TypeScript and Vite build system

## Build and Validation Instructions

### Prerequisites
- **Node.js**: LTS version (currently using v20.19.5)
- **pnpm**: Package manager (v9.15.1) - **ALWAYS** use pnpm, not npm

### Environment Setup
1. **ALWAYS run `pnpm install` before any other command** - this is required for all operations
2. The project uses pnpm workspaces and exact dependency versions via `pnpm-lock.yaml`

### Build Commands (in order of typical workflow)

#### Installation and Dependencies
```bash
pnpm install  # Always run first, takes ~15-20 seconds
```

#### Linting and Code Quality
```bash
pnpm lint      # Biome linter - will show errors, expect ~2-8 errors typically
pnpm format    # Biome formatter - will show format violations 
pnpm check     # Combined lint + format check - most comprehensive
```

**Important**: The project currently has known linting/formatting issues:
- Import type issues in UI components (`src/components/ui/dialog.tsx`, `src/components/ui/tabs.tsx`)
- Format violations in some files (quote styles, import organization)
- These are NOT blocking issues - the build will still succeed

#### Building
```bash
pnpm build     # Vite build + TypeScript compilation, takes ~8-10 seconds
```
- Creates `dist/` directory with production assets
- Includes TypeScript compilation step
- Build succeeds even with linting issues
- Expect warnings about large chunks (>500KB) - this is normal

#### Development Server
```bash
pnpm dev       # Starts dev server on http://localhost:3000, takes ~2-3 seconds
# or
pnpm start     # Alias for pnpm dev
```

#### Testing
```bash
pnpm test      # Vitest unit tests - KNOWN TO FAIL currently
```

**Important**: Tests currently fail due to:
- Missing RouterProvider context in test setup
- IndexedDB API not available in test environment  
- This is a known issue and NOT something you need to fix unless specifically tasked

#### Preview Built Application
```bash
pnpm serve     # Preview production build locally on http://localhost:4173
```

### Timing Expectations
- `pnpm install`: 15-20 seconds (first time or after lock file changes)
- `pnpm build`: ~13-14 seconds total (8s Vite + 5s TypeScript)
- `pnpm dev`: 2-3 seconds to start
- `pnpm serve`: Instant start (requires prior build)
- `pnpm lint/format/check`: 1-2 seconds
- `pnpm test`: Will fail in ~1-2 seconds (known issue)

## Project Architecture and Layout

### Core Configuration Files
- `package.json` - Dependencies and scripts, uses pnpm as package manager
- `vite.config.js` - Vite build configuration with React plugin and manual chunking
- `tsconfig.json` - TypeScript configuration with strict settings
- `biome.json` - Linting and formatting rules (Biome instead of ESLint/Prettier)
- `components.json` - Shadcn/UI component configuration
- `vercel.json` - Deployment configuration with SPA routing

### Source Code Structure (`src/`)

#### Main Application Files
- `src/main.tsx` - Application entry point with router setup
- `src/App.tsx` - Main application component  
- `src/styles.css` - Global CSS styles

#### Core Architecture
- `src/lib/` - **Core business logic and utilities**
  - `db.ts` - IndexedDB database setup using Dexie
  - `models.ts` - TypeScript interfaces and type definitions
  - `chat-store.ts` - Zustand state management for chat functionality
  - `utils.ts` - Common utility functions
  - `services/` - Business logic services for LLM providers

#### UI Components
- `src/components/` - **React UI components**
  - `ui/` - Base UI components from Shadcn/UI library
  - `Chat/` - Chat-specific components
  - `Header.tsx`, `Sidebar.tsx` - Layout components
  - `OnboardingScreen.tsx` - Initial setup screen

#### Application Structure  
- `src/routes/` - **Page components and routing**
  - `chat.section.tsx` - Main chat interface
  - `settings.llm.tsx` - LLM provider configuration
  - `settings.general.tsx` - General application settings
- `src/layout/` - Layout wrapper components
- `src/hooks/` - Custom React hooks (e.g., `use-mobile.ts`)
- `src/integrations/` - Third-party service integrations (TanStack Query)

### Dependencies and Tech Stack
- **React 19** with TypeScript for UI
- **Vite** as build tool and dev server
- **TanStack Router** for client-side routing  
- **TanStack Query** for async state management
- **Zustand** for global state management
- **Dexie** for IndexedDB database operations
- **Shadcn/UI** + **Radix UI** for component library
- **Tailwind CSS v4** for styling
- **Biome** for linting and formatting (not ESLint/Prettier)
- **AI SDK** for LLM provider integrations

### Data Storage
- **IndexedDB** via Dexie for local data persistence
- Tables: `chatSessions`, `projects`, `llmProviders`, `llmModels`, `generalSettings`
- No backend required - fully client-side data management

### LLM Provider Integration
Supports multiple providers via AI SDK:
- OpenAI (GPT models)
- Google (Gemini models)  
- Groq
- OpenAI-compatible endpoints (LM Studio, Ollama)
- Configuration stored in IndexedDB

## Validation and CI/CD
Currently no GitHub Actions workflows are configured. Validation is manual via the commands above.

### Pre-commit Validation Steps
1. Run `pnpm check` (expect some linting issues - not blocking)
2. Run `pnpm build` (should succeed)
3. Manually test dev server with `pnpm dev`

### Common Issues and Workarounds

### Known Build Issues
1. **Linting errors are not blocking** - build succeeds despite lint failures
2. **Large bundle warnings** - expected due to syntax highlighting and AI SDK dependencies  
3. **Test failures** - known issue with RouterProvider and IndexedDB mocking
4. **CSS warning during build** - Tailwind CSS syntax issue in output, does not affect functionality

### Component Library Usage
- Uses **Shadcn/UI** components - add new components with: `pnpx shadcn@latest add <component-name>`
- Components are installed to `src/components/ui/`
- Configuration is in `components.json`

### Common Fixes
- If dependencies seem out of sync: delete `node_modules` and run `pnpm install`
- If build fails: ensure you're using pnpm, not npm
- If dev server won't start: check port 3000 is available (or 4173 for preview)
- If syntax highlighting seems broken: it's included in the large syntax_highlighter chunk

### File Locations Reference
- Package manager: `pnpm` (never use npm)
- Lock file: `pnpm-lock.yaml`
- Build output: `dist/`
- Static assets: `public/`
- Main HTML: `index.html`
- Environment files: Not used (client-side only)

## Development Workflow

1. **Always start with `pnpm install`**
2. For quick validation: `pnpm check && pnpm build`
3. For development: `pnpm dev` 
4. The application will be available at `http://localhost:3000`
5. Linting issues are informational - don't block on them unless specifically fixing code quality

## Important Notes for Agents

- **TRUST THESE INSTRUCTIONS** - only search/explore if information is missing or incorrect
- Always use `pnpm` commands, never `npm`
- Expect and ignore current linting/formatting issues unless specifically tasked to fix them
- Tests currently fail - this is a known issue, not a blocker
- Build output warnings about large chunks are expected and normal
- The app is client-side only - no server setup needed
- Focus on `src/lib/` for business logic, `src/components/` for UI, `src/routes/` for pages