import { ActionDefinition } from "../action";

// Type definitions
export interface Message {
  role: string;
  content: string;
}

export interface Document {
  id: string;
  text: string;
  additionalProps: Record<string, string>;
}

export interface CompletionRequest {
  prompt: string;
  preamble?: string;
  chatHistory: Message[];
  documents: Document[];
  actions: ActionDefinition[];
  temperature?: number;
  maxTokens?: number;
  additionalParams?: any;
}

export enum ModelChoice {
  Message = "message",
  Action = "action",
}

export interface CompletionResponse<T = any> {
  message?: string;
  choice: ModelChoice;
  rawResponse: T;
  actionName?: string;
  args?: Record<string, any>;
  usage: any;
}

// Error types
export class PromptError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = "PromptError";
  }
}

export class CompletionError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = "CompletionError";
  }
}

// Interfaces
export interface Prompt {
  prompt(prompt: string): Promise<string>;
}

export interface Chat {
  chat(prompt: string, chatHistory: Message[]): Promise<string>;
}

export interface Completion {
  completion(
    prompt: string,
    chatHistory: Message[]
  ): Promise<CompletionRequestBuilderType>;
}

export abstract class ModelInterface {
  abstract completion(
    request: CompletionRequest
  ): Promise<CompletionResponse<any>>;
  abstract completionRequest(prompt: string): CompletionRequestBuilderType;
  abstract completionRequest(prompt: string): CompletionRequestBuilderType;
}

// CompletionRequestBuilder interface
export interface CompletionRequestBuilderType {
  setPreamble(preamble: string): this;
  addMessage(message: Message): this;
  addMessages(messages: Message[]): this;
  addDocument(document: Document): this;
  addDocuments(documents: Document[]): this;
  addAction(action: ActionDefinition): this;
  addActions(actions: ActionDefinition[]): this;
  setAdditionalParams(additionalParams: any): this;
  setTemperature(temperature: number): this;
  create(): CompletionRequest;
  send(): Promise<CompletionResponse<any>>;
}
