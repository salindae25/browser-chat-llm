# LLM Chat Interface

A browser-based chat interface for interacting with multiple Large Language Models. No server-side component; all data is stored locally in your browser's IndexedDB.

## Key Features

*   **Browser-Based**: Runs entirely in your web browser, no installation needed beyond cloning and serving.
*   **Multiple LLM Support**: Designed to interact with various Large Language Models.
*   **Local Data Storage**: All conversation data is stored securely in your browser's IndexedDB, ensuring privacy.
*   **Serverless Architecture**: Operates without a backend, enhancing data control and privacy.
*   **Modern Tech Stack**: Built with React, TypeScript, and Vite for a fast and responsive experience.

## Tech Stack

*   **Frontend**: React, TypeScript
*   **UI Components**: Likely [Shadcn/UI](https://ui.shadcn.com/) (inferred from `components.json`)
*   **Build Tool**: Vite
*   **Package Manager**: pnpm
*   **Linting/Formatting**: Biome (configured in `biome.json`)
*   **State Management**: Potentially Zustand or similar (inferred from `lib/chat-store.ts`)
*   **Data Fetching/Caching**: Tanstack Query (inferred from `integrations/tanstack-query/`)
*   **Styling**: Global CSS (`src/styles.css`) and component-specific styles.

## Getting Started

### Prerequisites

*   Node.js (LTS version recommended)
*   pnpm (Package manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url> llm-chat
    cd llm-chat
    ```
    (Replace `<your-repository-url>` with the actual URL of your GitHub repository if you've pushed it there.)

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    This will start the development server, typically at `http://localhost:5173` (Vite's default). Open this URL in your browser.

## Usage

Once the development server is running:

1.  Open your web browser and navigate to the local address provided (e.g., `http://localhost:5173`).
2.  The chat interface will load.
3.  Explore the settings to configure LLM providers or API keys if necessary (details would depend on implementation).
4.  Start your conversations with the available Large Language Models.

## Project Structure Overview

```
llm-chat/
├── public/               # Static assets
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   ├── components/       # Reusable UI components
│   │   ├── Chat/         # Chat-specific UI parts
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── ui/           # Base UI elements (e.g., from Shadcn/UI)
│   ├── hooks/            # Custom React hooks (e.g., use-mobile.ts)
│   ├── integrations/     # Third-party service integrations (e.g., tanstack-query)
│   ├── layout/           # Layout components (e.g., MainLayout.tsx)
│   ├── lib/              # Core logic, utilities, and data management
│   │   ├── chat-store.ts # State management for chat
│   │   ├── db.ts         # IndexedDB setup and operations
│   │   ├── models.ts     # TypeScript interfaces and types
│   │   └── services/     # Business logic services
│   ├── routes/           # Page components and route definitions
│   └── styles.css        # Global stylesheets
├── .gitignore            # Files and directories to ignore for Git
├── biome.json            # Biome (linter/formatter) configuration
├── components.json       # Configuration for UI components (e.g., Shadcn/UI)
├── index.html            # Main HTML file
├── LICENSE               # Project license file
├── package.json          # Project metadata and dependencies
├── pnpm-lock.yaml        # Exact versions of dependencies
├── tsconfig.json         # TypeScript compiler options
└── vite.config.js        # Vite build tool configuration
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-exciting-feature` or `bugfix/issue-tracker-id`).
3.  Make your changes, ensuring they adhere to the project's coding style and conventions (enforced by Biome).
4.  Write tests for your changes if applicable.
5.  Commit your changes with a clear and descriptive commit message.
6.  Push your branch to your fork (`git push origin feature/your-exciting-feature`).
7.  Open a Pull Request against the main repository.

## License

This project is licensed under the terms specified in the `LICENSE` file. Please review it for more details.