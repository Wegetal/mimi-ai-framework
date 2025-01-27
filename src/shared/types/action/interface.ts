import { Context } from "../../context";
import { ActionDefinition, StoredAction } from ".";

export interface BaseActionHandler {
  registry: Map<string, StoredAction>;
  register(action: ActionDefinition): void;
  execute<T>(
    name: string,
    agentContext: Context,
    args: Record<string, any>
  ): Promise<T>;
  getRegistered(): StoredAction[];
}
