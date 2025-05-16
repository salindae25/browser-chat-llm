import Dexie, { type EntityTable } from "dexie";
import type { ChatSession, Project, User } from "./models";

export const db = new Dexie("chatLLMDB") as Dexie & {
  users: EntityTable<User, "id">;
  chatSessions: EntityTable<ChatSession, "id">;
  projects: EntityTable<Project, "id">;
};

// Define the database schema using Dexie's versioning API
db.version(1).stores({
  // Users table
  users: `
    id,
    username,
    password,
    *providers
  `,

  // ChatSessions table
  chatSessions: `
    id,
    activeModel.model,
    activeModel.provider,
    projectId,
    *tags,
    title
  `,

  // Projects table
  projects: `
    id,
    title
  `
});
