import { useLiveQuery } from "dexie-react-hooks";
import { ChatInput } from "./components/Chat/chat-input";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { db } from "./lib/db";

function App() {
  const llmProviders = useLiveQuery(() => db.llmProviders.toArray());
  const llmModels = useLiveQuery(() => db.llmModels.toArray());

  if (llmProviders?.length === 0 || llmModels?.length === 0) {
    return <OnboardingScreen isLLMProvidersEmpty={llmProviders?.length === 0} isLLMModelsEmpty={llmModels?.length === 0} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="m-auto flex h-[calc(100vh-6rem)] w-full max-w-(--breakpoint-md) items-center justify-center">
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
          <ChatInput isFromRoot={true} />
        </div>
      </div>
    </div>
  );
}

export default App;
