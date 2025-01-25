import { Context } from "../../context";
import { ActionDefinition, ActionFunction, ActionWithEmbedding } from ".";

export interface BaseHandler {
  registry: Map<string, ActionDefinition>;
  dynamicRegistry: Map<string, ActionWithEmbedding>;
  registerStatic<T>(action: ActionDefinition): void;
  registerDynamic<T>(action: ActionWithEmbedding): void;
  execute<T>(name: string, agentContext: Context): Promise<T>;
  getRegistered(): ActionDefinition[];
}
