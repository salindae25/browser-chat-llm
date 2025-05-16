import type { CoreMessage } from "ai";

export interface ChatSession {
  id: string;
  messages: CoreMessage[];
  activeModel: { model: string; provider: string };
  forkedChatIds: string[] | undefined;
  projectId: string | undefined;
  tags: string[];
  title: string;
}
export interface Project {
  id: string;
  title: string;
}
export interface Profile {
  providers: Record<string, { url: string; apiKey: string; name: string }>;
}
export interface User extends Profile {
  id: string;
  username: string;
  password: string;
}
