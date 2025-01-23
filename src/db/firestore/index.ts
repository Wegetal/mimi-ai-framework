import {
  Firestore,
  CollectionReference,
  FieldValue,
} from "@google-cloud/firestore";
import { Database } from "../interface";
import {
  AgentData,
  AgentMessage,
  ConversationData,
} from "../../shared/types/agent/types";
import { AgentSchema } from "../../shared/schemas/agent/schema";
import { MessageSchema } from "../../shared/schemas/message/schema";
import { QueryOptions, UpdateOptions } from "../../shared/types/db/types";

export class FirestoreDatabase implements Database {
  private firestore: Firestore;
  private agents: CollectionReference;
  private conversations: CollectionReference;

  constructor(config: { projectId: string; credentials?: any }) {
    this.firestore = new Firestore({
      projectId: config.projectId,
      credentials: config.credentials,
    });
    this.agents = this.firestore.collection("agents");
    this.conversations = this.firestore.collection("conversations");
  }

  async createAgent(
    data: Omit<AgentData, "id" | "createdAt" | "updatedAt">
  ): Promise<AgentData> {
    try {
      const now = new Date();
      const id = this.agents.doc().id;
      const agentData: AgentData = {
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      // Validate with Zod
      const validated = AgentSchema.parse(agentData);

      await this.agents.doc(id).set(validated);
      return validated;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAgent(id: string): Promise<AgentData | null> {
    try {
      const doc = await this.agents.doc(id).get();
      if (!doc.exists) return null;

      const data = doc.data() as AgentData;
      // Convert Firestore Timestamps to Dates
      return this.convertTimestamps(data);
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
      const ref = this.agents.doc(id);
      const now = new Date();

      const updateData = {
        ...data,
        updatedAt: now,
      };

      if (options?.upsert) {
        await ref.set(updateData, { merge: true });
      } else {
        await ref.update(updateData);
      }

      const updated = await this.getAgent(id);
      if (!updated) throw new Error("Agent not found after update");
      return updated;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listAgents(
    query?: Partial<AgentData>,
    options?: QueryOptions
  ): Promise<AgentData[]> {
    try {
      let ref = this.agents;

      // // Apply filters
      // if (query) {
      //   Object.entries(query).forEach(([key, value]) => {
      //     ref = ref.where(key, "==", value);
      //   });
      // }

      // // Apply sorting
      // if (options?.sort) {
      //   Object.entries(options.sort).forEach(([key, direction]) => {
      //     ref = ref.orderBy(key, direction === 1 ? "asc" : "desc");
      //   });
      // }

      // // Apply pagination
      // if (options?.limit) {
      //   ref = ref.limit(options.limit);
      // }
      // if (options?.offset) {
      //   ref = ref.offset(options.offset);
      // }

      // const snapshot = await ref.get();
      return;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private convertTimestamps<T>(data: T): T {
    const converted = { ...data };
    Object.entries(converted).forEach(([key, value]) => {
      if (value?.toDate instanceof Function) {
        converted[key] = value.toDate();
      } else if (value && typeof value === "object") {
        converted[key] = this.convertTimestamps(value);
      }
    });
    return converted;
  }

  private handleError(error: any): Error {
    if (error.name === "ZodError") {
      return new Error(`Validation Error: ${error.message}`);
    }
    return new Error(`Database Error: ${error.message}`);
  }
}
