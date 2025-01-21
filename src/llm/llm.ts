import {
  ChatRequest,
  CompletionRequest,
  CompletionResponse,
  LLMConfig,
  StreamResponse,
} from "./types";

export abstract class LLMInterface {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      ...config,
    };
  }

  abstract complete(request: CompletionRequest): Promise<CompletionResponse>;
  abstract streamComplete(
    request: CompletionRequest,
    callback: (response: StreamResponse) => void
  ): Promise<void>;
  abstract chat(request: ChatRequest): Promise<CompletionResponse>;
  abstract streamChat(
    request: ChatRequest,
    callback: (response: StreamResponse) => void
  ): Promise<void>;
  abstract getTokenCount(text: string): number;

  updateConfig(config: Partial<LLMConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
