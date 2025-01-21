import Anthropic from "@anthropic-ai/sdk";
import {
  LLMConfig,
  CompletionRequest,
  ChatRequest,
  CompletionResponse,
  StreamResponse,
  Message,
} from "../types";
import { LLMInterface } from "../llm";

export class AnthropicProvider extends LLMInterface {
  private client: Anthropic;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    return this.chat({
      messages: [{ role: "user", content: request.prompt }],
      config: request.config,
    });
  }

  async streamComplete(
    request: CompletionRequest,
    callback: (response: StreamResponse) => void
  ): Promise<void> {
    return this.streamChat(
      {
        messages: [{ role: "user", content: request.prompt }],
        config: request.config,
      },
      callback
    );
  }

  async chat(request: ChatRequest): Promise<CompletionResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.config.modelName,
        messages: this.convertMessages(request.messages),
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        ...request.config,
      });

      const textContent = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");

      return {
        content: textContent,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        model: response.model,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async streamChat(
    request: ChatRequest,
    callback: (response: StreamResponse) => void
  ): Promise<void> {
    try {
      const stream = await this.client.messages.stream({
        model: this.config.modelName,
        messages: this.convertMessages(request.messages),
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        ...request.config,
      });

      let accumulatedContent = "";

      for await (const chunk of stream) {
        if (chunk.type === "content_block_start") {
          const block = (chunk as any).content_block;
          if (block?.type === "text") {
            accumulatedContent += block.text;
            callback({
              content: accumulatedContent,
              isComplete: false,
            });
          }
        } else if (chunk.type === "content_block_delta") {
          const delta = (chunk as any).delta;
          if (delta?.type === "text") {
            accumulatedContent += delta.text;
            callback({
              content: accumulatedContent,
              isComplete: false,
            });
          }
        } else if (chunk.type === "message_stop") {
          callback({
            content: accumulatedContent,
            isComplete: true,
          });
        }
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private convertMessages(messages: Message[]): Anthropic.MessageParam[] {
    return messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));
  }

  private handleError(error: any): Error {
    if (error instanceof Anthropic.APIError) {
      const { status, message } = error;
      return new Error(`Anthropic API error: ${status} - ${message}`);
    }
    return new Error(`Anthropic API error: ${error.message}`);
  }
}
