import { VertexAI } from "@google-cloud/vertexai";
import {
  LLMConfig,
  CompletionRequest,
  ChatRequest,
  CompletionResponse,
  StreamResponse,
  Message,
} from "../interface";
import { LLMInterface } from "../llm";

interface VertexConfig extends LLMConfig {
  project?: string;
  location?: string;
}

export class VertexAIProvider extends LLMInterface {
  private client: VertexAI;
  private model: any;

  constructor(config: VertexConfig) {
    super(config);
    this.client = new VertexAI({
      project: config.project || process.env.GOOGLE_CLOUD_PROJECT,
      location: config.location || "us-central1",
    });

    this.model = this.client.preview.getGenerativeModel({
      model: config.modelName,
    });
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    try {
      const generationConfig = {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: this.config.topP,
      };

      const result = await this.model.generateContent({
        contents: [{ text: request.prompt }],
        generationConfig,
      });

      const response = await result.response;
      const content = response.candidates[0].content.parts[0].text;

      return {
        content,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        model: this.config.modelName,
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
      const generationConfig = {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: this.config.topP,
      };

      const result = await this.model.generateContentStream({
        contents: [{ text: request.prompt }],
        generationConfig,
      });

      let accumulatedContent = "";
      for await (const chunk of result.stream) {
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
          accumulatedContent += chunk.candidates[0].content.parts[0].text;
          callback({
            content: accumulatedContent,
            isComplete: false,
          });
        }
      }

      callback({
        content: accumulatedContent,
        isComplete: true,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async chat(request: ChatRequest): Promise<CompletionResponse> {
    try {
      const generationConfig = {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: this.config.topP,
      };

      const contents = this.convertMessages(request.messages);
      const result = await this.model.generateContent({
        contents,
        generationConfig,
      });

      const response = await result.response;
      const content = response.candidates[0].content.parts[0].text;

      return {
        content,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        model: this.config.modelName,
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
      const generationConfig = {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: this.config.topP,
      };

      const contents = this.convertMessages(request.messages);
      const result = await this.model.generateContentStream({
        contents,
        generationConfig,
      });

      let accumulatedContent = "";
      for await (const chunk of result.stream) {
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
          accumulatedContent += chunk.candidates[0].content.parts[0].text;
          callback({
            content: accumulatedContent,
            isComplete: false,
          });
        }
      }

      callback({
        content: accumulatedContent,
        isComplete: true,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private convertMessages(
    messages: Message[]
  ): Array<{ role: string; text: string }> {
    return messages.map((msg) => ({
      role: this.mapRole(msg.role),
      text: msg.content,
    }));
  }

  private mapRole(role: string): string {
    switch (role) {
      case "system":
        return "user";
      case "assistant":
        return "model";
      case "user":
      default:
        return "user";
    }
  }

  private handleError(error: any): Error {
    const message = error.message || "Unknown error";
    const details = error.details || "";
    return new Error(`Vertex AI error: ${message} ${details}`);
  }
}
