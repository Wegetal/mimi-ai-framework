import { UpdateOptions } from "mongodb";
import { AgentData } from "../shared/types/agent/types";
import { CollectionInterface, QueryOptions } from "../shared/types/db/types";

export interface Database {
  createAgent(
    data: Omit<AgentData, "id" | "createdAt" | "updatedAt">
  ): Promise<AgentData>;
  getAgent(id: string): Promise<AgentData | null>;
  updateAgent(
    id: string,
    data: Partial<AgentData>,
    options?: UpdateOptions
  ): Promise<AgentData>;
  //   deleteAgent(id: string): Promise<boolean>;
  listAgents(
    query?: Partial<AgentData>,
    options?: QueryOptions
  ): Promise<AgentData[]>;

  //   collection<T>(name: string): CollectionInterface<T>;

  //   // Utility Operations
  //   exists(collection: string, query: Record<string, any>): Promise<boolean>;
  //   count(collection: string, query: Record<string, any>): Promise<number>;
}
