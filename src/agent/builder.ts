import { BaseActionHandler } from "../shared/types/action/interface";
import { VectorStoreIndex } from "../shared/types/db/vector";
import { Agent } from "./agent";
import { ModelInterface } from "../shared/types/model";
import { Context } from "../shared/context";

export class AgentBuilder<M extends ModelInterface> {
  private preamble: string = "";
  private initialContext: Context;
  private dynamicContext: [string, number, VectorStoreIndex][] = [];
  private actionHandler: BaseActionHandler;

  constructor(private model: M, actionHandler: BaseActionHandler) {
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
