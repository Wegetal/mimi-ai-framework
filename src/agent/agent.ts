import { InMemoryVectorStore } from "../db/inMemory";
import { ActionDefinition } from "../shared/types/action";
import {
  CompletionError,
  CompletionRequest,
  PromptError,
} from "../shared/types/model";
import { Document, Message, ModelInterface } from "../shared/types/model";
import { ActionHandler } from "../action/handler";
import { Context } from "../shared/context";

export class Agent<M extends ModelInterface> {
  private model: M;
  private preamble: string;
  private context: Context;
  private temperature?: number;
  private maxTokens?: number;
  private additionalParams?: Record<string, any>;
  public actionHandler: ActionHandler;

  constructor(
    model: M,
    preamble: string,
    initialContext: Context,
    actionHandler: ActionHandler
  ) {
    this.model = model;
    this.preamble = preamble || "";
    this.context = initialContext;
    this.actionHandler = actionHandler;
    this.additionalParams = {};
  }

  /**
   * Creates a completion request builder with the agent's configuration
   */
  async generateCompletionRequest(
    prompt: string,
    chatHistory: Message[] = []
  ): Promise<CompletionRequest> {
    try {
      const staticActions = this.actionHandler.getRegistered();

      const completionRequest: CompletionRequest = {
        prompt,
        preamble: this.preamble,
        chatHistory,
        documents: [],
        actions: [...staticActions],
        temperature: this.temperature || 0.5,
        maxTokens: this.maxTokens || 150,
        additionalParams: this.additionalParams || {},
      };

      return completionRequest;
    } catch (error) {
      throw new CompletionError(
        "Failed to create completion request",
        error instanceof Error ? error : undefined
      );
    }
  }

  addContext(key: string, value: any): this {
    this.context.set(key, value);
    return this;
  }

  /**
   * Sends a prompt with chat history to the agent
   */
  async chat(prompt: string, chatHistory: Message[] = []): Promise<string> {
    try {
      const completionRequest = await this.generateCompletionRequest(
        prompt,
        chatHistory
      );

      const response = await this.model.completion(completionRequest);

      if (response.choice === "message") {
        return response.message;
      } else {
        const { actionName: name, args } = response;
        return this.actionHandler.execute(name, this.context, args);
      }
    } catch (error) {
      throw new PromptError(
        "Failed to generate chat response",
        error instanceof Error ? error : undefined
      );
    }
  }
  /**
   * Calls an action with the given name and arguments
   */
  private async callAction(
    name: string,
    args: Record<string, any>
  ): Promise<string> {
    // const action = this.actions.get(name);
    // if (!action) {
    //   throw new Error(`Action not found: ${name}`);
    // }
    // Implement action calling logic here
    return "";
  }
}

// Supporting types (if not already defined elsewhere)
export interface AgentConfig<M extends ModelInterface> {
  model: M;
  preamble?: string;
  staticContext?: Document[];
  staticActions?: string[];
  temperature?: number;
  maxTokens?: number;
  additionalParams?: Record<string, any>;
  dynamicContext?: Array<[number, InMemoryVectorStore<any>]>;
  dynamicActions?: Array<[number, InMemoryVectorStore<any>]>;
  actions?: Map<string, ActionDefinition>;
}
