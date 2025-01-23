import { Context } from "../shared/context";
import { ActionDefinition, ActionFunction } from "../shared/types/action";
import { BaseHandler } from "../shared/types/action/interface";

export class ActionHandler implements BaseHandler {
  // Registry of static actions, mapped by their unique name
  registry: Map<string, ActionDefinition>;

  // Dynamic registry: Actions generated dynamically based on context
  dynamicRegistry: Map<string, (context: Context) => Promise<ActionFunction>>;

  constructor() {
    this.registry = new Map();
    this.dynamicRegistry = new Map();
  }

  /**
   * Registers a new static action by name.
   * @param name - Name of the action.
   * @param actionFn - The action function to register.
   */
  registerStatic(action: ActionDefinition): void {
    if (this.registry.has(action.name)) {
      throw new Error(`Action "${name}" is already registered.`);
    }
    this.registry.set(action.name, action);
  }

  /**
   * Registers a dynamic action.
   * The action will be generated based on the current context.
   * @param name - Name of the action.
   * @param actionFnGenerator - Function that returns the action based on context.
   */
  registerDynamic(
    name: string,
    actionFnGenerator: (context: Context) => Promise<ActionFunction>
  ): void {
    if (this.dynamicRegistry.has(name)) {
      throw new Error(`Dynamic action "${name}" is already registered.`);
    }
    this.dynamicRegistry.set(name, actionFnGenerator);
  }

  /**
   * Executes a registered static or dynamic action by name.
   * @param name - Name of the action to execute.
   * @param context - The context object providing necessary data.
   * @returns The result of the action execution.
   */
  async execute<T>(name: string, context: Context): Promise<T> {
    let actionFn: ActionFunction | undefined;

    // First, check if it's a static action
    if (this.registry.has(name)) {
      actionFn = this.registry.get(name).handler;
    }

    // If not static, check if it's a dynamic action
    if (!actionFn && this.dynamicRegistry.has(name)) {
      const dynamicActionFnGenerator = this.dynamicRegistry.get(name);
      actionFn = await dynamicActionFnGenerator!(context); // Await the dynamic action generator
    }

    // If action is found, execute it
    if (!actionFn) {
      throw new Error(`Action "${name}" not found.`);
    }

    return await actionFn(context);
  }

  /**
   * Returns the list of all registered actions (both static and dynamic).
   */
  getRegistered(): ActionDefinition[] {
    return Array.from(this.registry.values());
  }
}
