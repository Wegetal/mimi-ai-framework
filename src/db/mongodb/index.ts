import { MongoClient, Collection, Db, ObjectId, UpdateOptions } from "mongodb";

import { z } from "zod";
import { Database } from "../interface";
import { AgentData } from "../../shared/types/agent/types";
import { AgentSchema } from "../../shared/schemas/agent/schema";
import { QueryOptions } from "../../shared/types/db/types";

export class MongoDatabase implements Database {
  private client: MongoClient;
  private db: Db;
  private agents: Collection<AgentData>;

  constructor(private readonly url: string, private readonly dbName: string) {
    this.client = new MongoClient(url);
    this.db = this.client.db(this.dbName);
    this.agents = this.db.collection("agents");
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();

      // Create indexes
      // await this.setupIndexes();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async createAgent(
    data: Omit<AgentData, "id" | "createdAt" | "updatedAt">
  ): Promise<AgentData> {
    try {
      const now = new Date();
      const agentData: AgentData = {
        id: new ObjectId().toString(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      // Validate with Zod
      const validated = AgentSchema.parse(agentData);

      await this.agents.insertOne(validated);
      return validated;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAgent(id: string): Promise<AgentData | null> {
    try {
      const agent = await this.agents.findOne({ id });
      return agent;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAgent(
    id: string,
    data: Partial<AgentData>,
    options?: UpdateOptions
  ): Promise<AgentData> {
    try {
      const now = new Date();
      const updateData = {
        $set: {
          ...data,
          updatedAt: now,
        },
      };

      const result = await this.agents.findOneAndUpdate({ id }, updateData, {
        upsert: options?.upsert,
        returnDocument: "after",
      });

      // if (!result.value) {
      //   throw new Error("Agent not found");
      // }

      return;
      // return result.value;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      const result = await this.agents.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listAgents(
    query?: Partial<AgentData>,
    options?: QueryOptions
  ): Promise<AgentData[]> {
    try {
      let cursor = this.agents.find(query || {});

      if (options?.sort) {
        cursor = cursor.sort(options.sort);
      }

      if (options?.limit) {
        cursor = cursor.limit(options.limit);
      }

      if (options?.offset) {
        cursor = cursor.skip(options.offset);
      }

      return await cursor.toArray();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error instanceof z.ZodError) {
      return new Error(`Validation Error: ${error.message}`);
    }

    if (error.code === 11000) {
      return new Error("Duplicate key error");
    }

    return new Error(`Database Error: ${error.message}`);
  }
}
