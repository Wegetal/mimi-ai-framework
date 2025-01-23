import { Context } from "../../context";
import { ActionDefinition, ActionFunction } from ".";

export interface BaseHandler {
  registry: Map<string, ActionDefinition>;
  dynamicRegistry: Map<string, (context: Context) => Promise<ActionFunction>>;
  registerStatic<T>(action: ActionDefinition): void;
  registerDynamic<T>(
    name: string,
    fnGenerator: (context: Context) => Promise<ActionFunction<T>>
  ): void;
  execute<T>(name: string, agentContext: Context): Promise<T>;
  getRegistered(): ActionDefinition[];
}
