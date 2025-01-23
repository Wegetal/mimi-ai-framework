import { BaseHandler } from "../shared/types/action/interface";
import {
  ActionDefinition,
  ActionFunction,
  ActionWithEmbedding,
} from "../shared/types/action";
import { VectorStoreIndex } from "../shared/types/db/vector";
import { Agent } from "./agent";
import { ModelInterface } from "../shared/types/model";

export class AgentBuilder<M extends ModelInterface> {
  private preamble: string = "";
  private initialContext: Record<string, any> = {};
  private dynamicContext: [string, number, VectorStoreIndex][] = [];
  private actionHandler: BaseHandler;
  private actions: ActionWithEmbedding[] = [];

  constructor(private model: M, actionHandler: BaseHandler) {
    this.actionHandler = actionHandler;
  }

  setPreamble(preamble: string): this {
    this.preamble = preamble;
    return this;
  }

  appendPreamble(doc: string): this {
    this.preamble += `\n${doc}`;
    return this;
  }

  addContext(key: string, value: any): this {
    this.initialContext[key] = value;
    return this;
  }

  async addAction(action: ActionDefinition): Promise<this> {
    // Validate the action definition

    // Register the action function
    this.actionHandler.registerStatic(action);

    // Create embedding for the action definition
    // const actionText = `${name} ${description} ${options.tags?.join(" ")}`;
    // const embedding = await this.model.embedTexts({ documents: [actionText] });

    // if (!embedding.embeddings[0]) {
    //   throw new Error("Failed to generate embedding for action");
    // }

    // Store the action with its embedding
    // this.actions.push({
    //   action: actionDef,
    //   embedding: {
    //     document: actionText,
    //     vec: embedding.embeddings[0].embedding,
    //   },
    // });

    return this;
  }

  addDynamicContext(
    key: string,
    sample: number,
    dynamicContext: VectorStoreIndex
  ): this {
    this.dynamicContext.push([key, sample, dynamicContext]);
    return this;
  }

  create(): Agent<M> {
    return new Agent(
      this.model,
      this.preamble,
      this.initialContext,
      this.actionHandler
    );
  }
}
