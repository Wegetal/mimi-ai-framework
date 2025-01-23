import { z } from "zod";

export const AgentConfigSchema = z.object({
  model: z.string(),
  provider: z.string(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  systemPrompt: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const AgentStateSchema = z.object({
  isActive: z.boolean(),
  lastActive: z.date(),
  currentTask: z.string().optional(),
  context: z.record(z.any()).optional(),
});

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  config: AgentConfigSchema,
  state: AgentStateSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional(),
});
