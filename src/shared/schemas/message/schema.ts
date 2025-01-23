import { z } from "zod";

export const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.date(),
});
