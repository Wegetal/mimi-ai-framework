import { z } from "zod";
import { Context } from "../../context";
import { ActionSchema } from "../../schemas/action/schema";

export type ActionFunction = (context: Context) => Promise<any>;

export type Action = z.infer<typeof ActionSchema>;
