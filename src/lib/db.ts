import Dexie, { type EntityTable, type Table } from "dexie";
import type { ChatSession, Project, User, LLMProviderConfig } from "./models";

export class AppDatabase extends Dexie {
  // Declare tables by their type and primary key type
  chatSessions!: Table<ChatSession, string>; // Primary key is 'id' (string)
  projects!: Table<Project, string>;         // Primary key is 'id' (string)
  users!: Table<User, string>;             // Primary key is 'id' (string)
  llmProviders!: Table<LLMProviderConfig, string>; // Primary key is 'id' (string)
  // Note: CoreMessage is stored within ChatSession, no need for a separate table unless required

  constructor() {
    super('chatLLMDB'); // Database name

    // Define the database schema
    // Version 1
    this.version(1).stores({
      // Schema syntax: keyPath, index1, index2, ...
      // 'id' is the primary key. Use '++id' for auto-incrementing numbers, but your IDs are strings.
      // Add indexes for properties you'll frequently query on.
      chatSessions: '&id, projectId, *tags, activeModel.model, updatedAt', // & indicates unique index, * for multi-entry index (arrays) [8]
      projects: '&id',
      users: '&id, username', // Index username for lookups
      llmProviders: '&id, name, providerKey' // & indicates unique index
    });

    // If you had class-based models, you would use mapToClass here.
    // For interfaces, this step is not needed.
  }
}

// 3. Create an instance of the database
export const db = new AppDatabase();