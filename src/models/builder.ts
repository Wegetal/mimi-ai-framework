import { ActionDefinition } from "../shared/types/action";
import {
  CompletionRequest,
  CompletionRequestBuilderType,
  CompletionResponse,
  Document,
  Message,
  ModelInterface,
} from "../shared/types/model";

// Example model provider imports
export class CompletionRequestBuilder implements CompletionRequestBuilderType {
  private prompt: string;
  private preamble: string | null = null;
  private chatHistory: Message[] = [];
  private documents: Document[] = [];
  private actions: ActionDefinition[] = [];
  private temperatureValue: number | null = null;
  private tokenLimit: number | null = null;
  private extraParams: Record<string, any> | null = null;

  constructor(private model: ModelInterface, prompt: string) {
    this.prompt = prompt;
  }

  setPreamble(preamble: string): this {
    this.preamble = preamble;
    return this;
  }

  addMessage(message: Message): this {
    this.chatHistory.push(message);
    return this;
  }

  addMessages(messages: Message[]): this {
    this.chatHistory = [...messages];
    return this;
  }

  addDocument(document: Document): this {
    this.documents.push(document);
    return this;
  }

  addDocuments(documents: Document[]): this {
    this.documents = [...documents];
    return this;
  }

  addAction(action: ActionDefinition): this {
    this.actions.push(action);
    return this;
  }

  addActions(actions: ActionDefinition[]): this {
    this.actions = [...actions];
    return this;
  }

  setAdditionalParams(params: Record<string, any>): this {
    this.extraParams = { ...params };
    return this;
  }

  setTemperature(temperature: number): this {
    this.temperatureValue = temperature;
    return this;
  }

  setMaxTokens(maxTokens: number): this {
    this.tokenLimit = maxTokens;
    return this;
  }

  create(): CompletionRequest {
    return {
      prompt: this.prompt,
      preamble: this.preamble,
      chatHistory: this.chatHistory,
      documents: this.documents,
      actions: this.actions,
      temperature: this.temperatureValue,
      maxTokens: this.tokenLimit,
      additionalParams: this.extraParams,
    };
  }

  async send(): Promise<CompletionResponse> {
    const request = this.create();
    return this.model.completion(request);
  }
}
