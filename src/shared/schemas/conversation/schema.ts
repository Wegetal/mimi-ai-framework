import { z } from "zod";
import { MessageSchema } from "../message/schema";

export const ConversationSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  messages: z.array(MessageSchema),
  context: z.record(z.any()).optional(),
  startedAt: z.date(),
  endedAt: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});
