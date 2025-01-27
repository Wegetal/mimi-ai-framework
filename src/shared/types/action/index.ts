import { SchemaType } from "@google-cloud/vertexai";
import { Context } from "../../context";

export type ActionFunction<T = any> = (
  params: Context,
  args: Record<string, any>
) => Promise<T>;

export interface ActionDefinition {
  name: string; // The name of the action.
  tags: string[]; // Tags representing the feature or domain of the action.
  description: string; // Details about the action, including what it does and its expected return value.
  parameters?: {
    type: "object"; // The type of the parameters, which is an object.
    properties: Record<string, any>; // Object describing the properties of the parameters.
    required?: string[]; // Optional array of required parameter names.
  };
  dependencies?: string[]; //Actions that must run before this action.
  handler: ActionFunction; // The function that executes the action.
}

export interface StoredAction {
  name: string; // The name of the action.
  description: string; // Details about the action, including what it does and its expected return value.
  parameters?: {
    type: "object"; // The type of the parameters, which is an object.
    properties: Record<string, any>; // Object describing the properties of the parameters.
    required?: string[]; // Optional array of required parameter names.
  };
  handler: ActionFunction; // The function that executes the action.
}
