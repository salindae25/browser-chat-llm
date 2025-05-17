import { ChatInput } from "./components/Chat/chat-input";

function App() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
			<div className="m-auto flex h-[calc(100vh-6rem)] w-full max-w-(--breakpoint-md) items-center justify-center">
				<div className="flex h-full w-full flex-col items-center justify-center space-y-4">
					<ChatInput />
				</div>
			</div>
		</div>
	);
}

export default App;
