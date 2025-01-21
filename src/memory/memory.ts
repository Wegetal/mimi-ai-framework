import { MemoryEntry } from "./types";

export interface MemoryModule {
  store(entry: Omit<MemoryEntry, "embedding">): Promise<void>;
  search(query: string, limit?: number): Promise<MemoryEntry[]>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}
