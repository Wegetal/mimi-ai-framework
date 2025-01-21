export interface LLMConfig {
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  provider: "openai" | "vertex-ai" | "anthropic" | "custom";
  apiKey?: string;
  organizationId?: string;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  prompt: string;
  config?: Partial<LLMConfig>;
}

export interface ChatRequest {
  messages: Message[];
  config?: Partial<LLMConfig>;
}

export interface CompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface StreamResponse {
  content: string;
  isComplete: boolean;
}
