import { z } from "zod";

export const ActionSchema = z.object({
  name: z.string().describe("The name of the action."),
  tag: z
    .array(z.string())
    .describe("Tags representing the feature or domain of the action."),
  description: z
    .string()
    .describe(
      "Details about the action, including what it does and its expected return value."
    ),
  parameters: z
    .array(z.string())
    .describe("List of all potential parameter names for this action."),
  requiredParameters: z
    .array(z.string())
    .describe(
      "Subset of parameters that are mandatory for this action to execute."
    ),
  dependencies: z
    .array(z.string())
    .describe("Actions that must run before this action."),
});
