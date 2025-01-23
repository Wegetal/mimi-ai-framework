import { z } from "zod";

export const VectorSchema = z.object({
  id: z.string(),
  vector: z.array(z.number()),
  metadata: z.record(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
