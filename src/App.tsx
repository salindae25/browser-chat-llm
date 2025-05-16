import { ChatInput } from "./components/Chat/chat-input";
import { GeneratingMessage, MessagesSection } from "./components/Chat/message-section";


function App() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="m-auto flex h-[calc(100vh-6rem)] w-full max-w-(--breakpoint-md) items-center justify-center">
				<div className="flex h-full w-full flex-col items-center justify-center space-y-4">
					<div className="flex flex-col overflow-y-auto relative w-full flex-1 space-y-4 pe-2" style={{scrollbarWidth: "none"}}>
						<MessagesSection />
						<GeneratingMessage />
					</div>
					<ChatInput />
				</div>
			</div>
		</div>
	);
}

export default App;
