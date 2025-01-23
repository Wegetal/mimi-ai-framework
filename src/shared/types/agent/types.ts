import { z } from "zod";
import { AgentSchema } from "../../schemas/agent/schema";
import { ConversationSchema } from "../../schemas/conversation/schema";
import { MessageSchema } from "../../schemas/message/schema";

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  model: string;
  provider: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AgentContext {
  messages: AgentMessage[];
  memory?: any[]; // Relevant memory entries
  state?: Record<string, any>;
}

export interface AgentState {
  isActive: boolean;
  lastActive: Date;
  currentTask?: string;
  context?: Record<string, any>;
}

export type AgentData = z.infer<typeof AgentSchema>;
export type ConversationData = z.infer<typeof ConversationSchema>;
export type AgentMessage = z.infer<typeof MessageSchema>;
