import OpenAI from "openai";
import {
  LLMConfig,
  CompletionRequest,
  ChatRequest,
  CompletionResponse,
  StreamResponse,
} from "../types";
import { LLMInterface } from "../llm";

export class OpenAIProvider extends LLMInterface {
  private client: OpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId,
    });
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    try {
      const response = await this.client.completions.create({
        model: this.config.modelName,
        prompt: request.prompt,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        ...request.config,
      });

      return {
        content: response.choices[0].text || "",
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async streamComplete(
    request: CompletionRequest,
    callback: (response: StreamResponse) => void
  ): Promise<void> {
    try {
      const stream = await this.client.completions.create({
        model: this.config.modelName,
        prompt: request.prompt,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        stream: true,
        ...request.config,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0].text;
        callback({
          content,
          isComplete: chunk.choices[0].finish_reason !== null,
        });
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async chat(request: ChatRequest): Promise<CompletionResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: request.messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        ...request.config,
      });

      return {
        content: response.choices[0].message.content || "",
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
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
      const stream = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: request.messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        stream: true,
        ...request.config,
      });

      let accumulatedContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0].delta.content || "";
        accumulatedContent += content;
        callback({
          content: accumulatedContent,
          isComplete: chunk.choices[0].finish_reason !== null,
        });
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getTokenCount(text: string): number {
    // For accurate token counting, consider using GPT-3 Tokenizer
    // npm install gpt-3-encoder
    return Math.ceil(text.length / 4);
  }

  private handleError(error: any): Error {
    if (error instanceof OpenAI.APIError) {
      const { status, message } = error;
      return new Error(`OpenAI API error: ${status} - ${message}`);
    }
    return new Error(`OpenAI API error: ${error.message}`);
  }
}
