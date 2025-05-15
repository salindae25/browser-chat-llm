import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { Store, useStore } from "@tanstack/react-store";
import {
  type CoreAssistantMessage,
  type CoreMessage,
  type CoreUserMessage,
  streamText,
} from "ai";
import { ArrowUpIcon } from "lucide-react";
import { memo, useRef } from "react";
import { AppSidebar } from "./components/Sidebar";
import { Button } from "./components/ui/button";
import MessageLoading from "./components/ui/message-loading";
import { Textarea } from "./components/ui/textarea";
import { cn } from "./lib/utils";

const LocalProvider = createOpenAICompatible({
  name: "provider-name",
  apiKey: "3434",
  baseURL: "http://localhost:1234/v1",
});
const GoogleProvider = createOpenAICompatible({
  name: "gemini",
  apiKey: "AIzaSyDbLBw8UuhuULxMekHecHt-sC3L7rBMOtg",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
});
// const model =GoogleProvider("gemini-2.0-flash-lite");
const model =LocalProvider("gemma-3-4b-it-qat");
const activeStore = new Store<{
  activeMessage: string;
  userMessage: string;
  generating: boolean;
}>({
  activeMessage: "",
  userMessage: "",
  generating: false,
});
const messageStore = new Store<{ messages: CoreMessage[] }>({
  messages: [],
});
const fetchChat = async () => {
  messageStore.setState((s) => {
    const newMessage: CoreUserMessage = {
      role: "user",
      content: activeStore.state.userMessage,
    };
    const messages = [...s.messages];
    messages.push(newMessage);
    return { ...s, messages, generating: true };
  });
  activeStore.setState((s) => ({ ...s, generating: true }));
  const { textStream } = streamText({
    model: model,
    system: "You are a helpful assistant.",
    messages: messageStore.state.messages,
  });
  for await (const text of textStream) {
    activeStore.setState((s) => ({
      ...s,
      activeMessage: s.activeMessage + text,
    }));
  }
  messageStore.setState((s) => {
    const newMessage: CoreAssistantMessage = {
      role: "assistant",
      content: activeStore.state.activeMessage,
    };
    const messages = [...s.messages];
    messages.push(newMessage);
    return { ...s, messages };
  });
  activeStore.setState((s) => ({ ...s, generating: false }));
};
function App() {
  const chatRef = useRef(null);
  const onSend = async () => {
    activeStore.setState((s) => ({
      ...s,
      activeMessage: "",
    }));
    if (chatRef.current) {
      //@ts-ignore
      chatRef.current.value = "";
    }
    await fetchChat();
  };
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="m-auto flex h-[calc(100vh-6rem)] w-full max-w-(--breakpoint-md) items-center justify-center">
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
              <div className="flex flex-col overflow-y-auto relative w-full flex-1 space-y-4 pe-2">
                <MessagesSection />
                <GeneratingMessage />
              </div>
              <div className="border-input bg-background rounded-3xl border p-2 shadow-xs w-full max-w-(--breakpoint-md)">
                <Textarea
                  ref={chatRef}
                  onChange={(e) => {
                    activeStore.setState((s) => ({
                      ...s,
                      userMessage: e.target.value,
                    }));
                  }}
                  onKeyDown={async (event) => {
                    if (event.metaKey && event.key === "Enter") {
                      event.preventDefault();
                      event.stopPropagation();
                      await onSend();
                    }
                  }}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content rounded-md border px-3 py-2 text-base transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-background min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="flex w-full">
                  <Button
                    onClick={onSend}
                    variant="noShadow"
                    className="ml-auto"
                    size="icon"
                  >
                    <ArrowUpIcon />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
const GeneratingMessage = memo(() => {
  const activeMessage = useStore(activeStore, (s) => s.activeMessage);
  const generating = useStore(activeStore, (s) => s.generating);
  return generating ? (activeMessage==="" ? <MessageLoading /> : (
    <MessageItem
      key={-3}
      data={{ role: "assistant", content: activeMessage }}
    />
  )) : null;
});
const MessagesSection = memo(() => {
  const messages = useStore(messageStore, (s) => s.messages);
  return (
    <>
      {messages.map((item, i) => {
        return <MessageItem key={i} data={item} />;
      })}
    </>
  );
});
const MessageItem = ({ data }: { data: CoreMessage }) => {
  const isUserMessage = data.role === "user";
  return (
    <div
      className={cn("flex gap-3", {
        "justify-start": !isUserMessage,
        "justify-end": isUserMessage,
      })}
    >
      <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
        <div className="bg-muted text-foreground prose rounded-lg border px-3 py-2">
          {typeof data.content == "string" && (
            <div className="space-y-4">{data.content}</div>
          )}
        </div>
      </div>
    </div>
  );
};
export default App;
