import { Context } from "../shared/context";
import { ActionDefinition, StoredAction } from "../shared/types/action";
import { BaseActionHandler } from "../shared/types/action/interface";

export class ActionHandler implements BaseActionHandler {
  // Registry of static actions, mapped by their unique name
  registry: Map<string, StoredAction>;

  constructor() {
    this.registry = new Map();
  }

  /**
   * Registers a new static action by name.
   * @param name - Name of the action.
   * @param actionFn - The action function to register.
   */
  register(action: ActionDefinition): void {
    if (this.registry.has(action.name)) {
      throw new Error(`Action "${name}" is already registered.`);
    }
    const builtAction: StoredAction = {
      name: action.name,
      description: `## Tags: ${action.tags.join(", ")}## Description: ${
        action.description
      } ## Parameters: ${action.parameters} ## Depends on: ${
        action?.dependencies?.join(", ") ?? "No dependency"
      } to Run First ##`,
      handler: action.handler,
      parameters: action.parameters,
    };

    this.registry.set(action.name, builtAction);
  }

  /**
   * Executes a registered static or dynamic action by name.
   * @param name - Name of the action to execute.
   * @param context - The context object providing necessary data.
   * @returns The result of the action execution.
   */
  execute<T>(
    name: string,
    context: Context,
    args: Record<string, any>
  ): Promise<T> {
    const actionFn = this.registry.get(name).handler;

    // If action is found, execute it
    if (!actionFn) {
      throw new Error(`Action "${name}" not found.`);
    }

    return actionFn(context, args);
  }

  /**
   * Returns the list of all registered actions (both static and dynamic).
   */
  getRegistered(): StoredAction[] {
    return Array.from(this.registry.values());
  }
}
