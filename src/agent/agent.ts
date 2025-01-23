import { InMemoryVectorStore } from "../db/inMemory";
import { ActionDefinition } from "../shared/types/action";
import { CompletionError, PromptError } from "../shared/types/model";
import { AgentBuilder } from "./builder";
import { Document, Message, ModelInterface } from "../shared/types/model";
import { ActionHandler } from "../action/handler";
import { CompletionRequestBuilder } from "../models/builder";

export class Agent<M extends ModelInterface> {
  private model: M;
  private preamble: string;
  private staticContext: Document[];
  private temperature?: number;
  private maxTokens?: number;
  private additionalParams?: Record<string, any>;
  public actionHandler: ActionHandler;

  constructor(model, preamble, initialContext, actionHandler) {
    this.model = model;
    this.preamble = preamble || "";
    this.staticContext = initialContext;
    this.actionHandler = actionHandler;
    this.temperature = 0.7;
    this.maxTokens = 5000;
    this.additionalParams = {};
  }

  /**
   * Creates a completion request builder with the agent's configuration
   */
  async completion(
    prompt: string,
    chatHistory: Message[] = []
  ): Promise<CompletionRequestBuilder> {
    try {
      const staticActions = this.actionHandler.getRegistered();

      return (
        new CompletionRequestBuilder(this.model, prompt)
          .setPreamble(this.preamble)
          .addMessages(chatHistory)
          // .addDocuments([...this.staticContext])
          .addActions([...staticActions])
          .setTemperature(this.temperature)
          .setMaxTokens(this.maxTokens)
          .setAdditionalParams(this.additionalParams)
      );
    } catch (error) {
      throw new CompletionError(
        "Failed to create completion request",
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Sends a simple prompt to the agent
   */
  // async prompt(prompt: string): Promise<string> {
  //   return this.chat(prompt, []);
  // }

  /**
   * Sends a prompt with chat history to the agent
   */
  async chat(prompt: string, chatHistory: Message[] = []): Promise<string> {
    try {
      const completionRequest = await this.completion(prompt, chatHistory);
      const response = await completionRequest.send();

      if (response.choice === "message") {
        return response.message;
      } else {
        const { actionName: name, args } = response;
        // return this.callAction(name, args);
      }
    } catch (error) {
      throw new PromptError(
        "Failed to generate chat response",
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Gets dynamic context based on the prompt
   */
  // private async getDynamicContext(prompt: string): Promise<Document[]> {
  //   const results = await Promise.all(
  //     this.dynamicContext.map(async ([numSamples, store]) => {
  //       const matches = await store.topN(prompt, numSamples);
  //       return matches.map(([_, id, text]) => ({
  //         id,
  //         text,
  //         additionalProps: {},
  //       }));
  //     })
  //   );

  //   return results.flat();
  // }

  // /**
  //  * Gets dynamic actions based on the prompt
  //  */
  // private async getDynamicActions(prompt: string): Promise<ActionDefinition[]> {
  //   const results = await Promise.all(
  //     this.dynamicActions.map(async ([numSamples, store]) => {
  //       const matches = await store.topNIds(prompt, numSamples);
  //       return matches
  //         .map(([_, id]) => this.actions.get(id))
  //         .filter((action): action is ActionDefinition => action !== undefined);
  //     })
  //   );

  //   return results.flat();
  // }

  /**
   * Calls an action with the given name and arguments
   */
  // private async callAction(
  //   name: string,
  //   args: Record<string, any>
  // ): Promise<string> {
  //   const action = this.actions.get(name);
  //   if (!action) {
  //     throw new Error(`Action not found: ${name}`);
  //   }
  //   // Implement action calling logic here
  //   return "";
  // }
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
