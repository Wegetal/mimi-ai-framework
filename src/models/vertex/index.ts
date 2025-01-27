import { GenerateContentRequest, VertexAI } from "@google-cloud/vertexai";
import {
  CompletionRequest,
  CompletionResponse,
  Message,
  ModelChoice,
  ModelInterface,
} from "../../shared/types/model";
import { ActionDefinition } from "../../shared/types/action";

interface VertexConfig {
  project?: string;
  location?: string;
  model: string;
}

export class VertexAIProvider extends ModelInterface {
  private client: VertexAI;
  private model: any;

  constructor(config: VertexConfig) {
    super();
    this.client = new VertexAI({
      googleAuthOptions: {
        projectId: config.project,
        keyFile: "./teste.json",
        apiKey: "",
      },
      project: config.project || process.env.GOOGLE_CLOUD_PROJECT,
      location: config.location || "us-central1",
    });

    this.model = this.client.preview.getGenerativeModel({
      model: "gemini-1.0-pro",
    });
  }

  get modelName(): string {
    return this.model.model;
  }

  async completion(request: CompletionRequest): Promise<CompletionResponse> {
    const fullHistory = this.buildFullHistory(request);

    const vertexRequest: GenerateContentRequest = {
      contents: fullHistory,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
      },
      systemInstruction: request.preamble,
    };

    if (request.actions && request.actions.length > 0) {
      console.log(request.actions);
      vertexRequest.tools = [{ functionDeclarations: request.actions }];
    }

    if (request.additionalParams) {
      Object.assign(vertexRequest, request.additionalParams);
    }

    const result = await this.model.generateContent(vertexRequest);
    const response = await result.response;
    console.log(response.candidates[0].content.parts[0]);
    console.log(
      `Vertex AI completion response: ${JSON.stringify(response.candidates[0])}`
    );

    return this.parseCompletionResponse(response);
  }

  private buildFullHistory(
    request: CompletionRequest
  ): Array<{ role: string; parts: { text: string }[] }> {
    const fullHistory: Array<{ role: string; parts: { text: string }[] }> = [];

    fullHistory.push(...this.convertMessages(request.chatHistory));

    const promptWithContext = this.buildPromptWithContext(request);
    fullHistory.push({ role: "user", parts: [{ text: promptWithContext }] });

    return fullHistory;
  }

  private buildPromptWithContext(request: CompletionRequest): string {
    let prompt = request.prompt;
    if (request.documents && request.documents.length > 0) {
      const context = request.documents.map((doc) => doc.text).join("\n\n");
      prompt = `Context:\n${context}\n\n${prompt}`;
    }
    return prompt;
  }

  private convertMessages(
    messages: Message[]
  ): Array<{ role: string; parts: { text: string }[] }> {
    return messages.map((msg) => ({
      role: this.mapRole(msg.role),
      parts: [{ text: msg.content }],
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

  private getActions(action: ActionDefinition): any {
    return {
      functionDeclarations: [
        {
          name: action.name,
          description: action.description,
          parameters: action.parameters,
        },
      ],
    };
  }

  private parseCompletionResponse(response: any): CompletionResponse {
    const candidate = response.candidates[0];
    if (candidate.content.parts[0].functionCall) {
      const functionCall = candidate.content.parts[0].functionCall;
      return {
        choice: ModelChoice.Action,
        actionName: functionCall.name,
        args: functionCall.args,
        usage: null, // Vertex AI doesn't provide token usage
        rawResponse: response,
      };
    } else {
      return {
        choice: ModelChoice.Message,
        message: candidate.content.parts[0].text || "",
        usage: null, // Vertex AI doesn't provide token usage
        rawResponse: response,
      };
    }
  }
}
