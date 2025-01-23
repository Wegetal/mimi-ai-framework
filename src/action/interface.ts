import { Context } from "../shared/context";
import { ActionFunction } from "../shared/types/action";

export interface BaseHandler {
  registry: Map<string, ActionFunction>;

  /**
   * Registers a new action by name.
   * @param name - Name of the item to register.
   * @param fn - The function to register.
   * @throws Error if the item is already registered.
   */
  register(name: string, fn: ActionFunction): void;

  /**
   * Executes a registered item by name.
   * @param name - Name of the item to execute.
   * @param context - The context object providing necessary data.
   * @returns The result of the execution.
   * @throws Error if the item is not found.
   */
  execute(name: string, context: Context): Promise<any>;

  /**
   * Returns the list of all registered items.
   * @returns Array of registered item names.
   */
  getRegistered(): string[];
}
