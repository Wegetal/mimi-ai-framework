import { Context } from "../shared/context";
import { ActionFunction } from "../shared/types/action";
import { BaseHandler } from "./interface";

export class ActionHandler implements BaseHandler {
  registry: Map<string, ActionFunction>;

  constructor() {
    this.registry = new Map();
  }

  /**
   * Registers a new action by name.
   * @param name - Name of the action.
   * @param actionFn - The action function to register.
   */
  register(name: string, actionFn: ActionFunction): void {
    if (this.registry.has(name)) {
      throw new Error(`Action "${name}" is already registered.`);
    }
    this.registry.set(name, actionFn);
  }

  /**
   * Executes a registered action by name.
   * @param name - Name of the action to execute.
   * @param context - The context object providing necessary data.
   * @returns The result of the action execution.
   */
  async execute(name: string, context: Context): Promise<any> {
    const actionFn = this.registry.get(name);

    if (!actionFn) {
      throw new Error(`Action "${name}" not found.`);
    }

    return await actionFn(context);
  }

  /**
   * Returns the list of all registered actions.
   */
  getRegistered(): string[] {
    return Array.from(this.registry.keys());
  }
}
