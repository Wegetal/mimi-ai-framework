import OpenAI from "openai";
import {
  CompletionRequest,
  CompletionResponse,
  Message,
  ModelChoice,
  ModelInterface,
} from "../../shared/types/model";
import { ActionDefinition } from "../../shared/types/action";
import { ChatCompletionMessageParam } from "openai/resources";
import { CompletionRequestBuilder } from "../builder";

export class OpenAIProvider extends ModelInterface {
  private client: OpenAI;
  private model: string;
  constructor(config) {
    super();
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId,
    });
    this.model = config.model;
  }

  completionRequest(prompt: string): CompletionRequestBuilder {
    return new CompletionRequestBuilder(this as ModelInterface, prompt);
  }

  async completion(request: CompletionRequest): Promise<CompletionResponse> {
    const fullHistory = this.buildFullHistory(request);

    const openAIRequest: any = {
      model: this.model,
      messages: fullHistory,
      temperature: request.temperature,
    };
    if (request.actions && request.actions.length > 0) {
      openAIRequest.functions = request.actions.map(this.getActions);
      openAIRequest.function_call = "auto";
    }

    if (request.additionalParams) {
      Object.assign(openAIRequest, request.additionalParams);
    }

    const response = await this.client.chat.completions.create(openAIRequest);

    console.log(response.choices[0].message);
    console.log(
      `OpenAI completion token usage: ${JSON.stringify(response.usage)}`
    );

    return this.parseCompletionResponse(response);
  }

  private buildFullHistory(
    request: CompletionRequest
  ): ChatCompletionMessageParam[] {
    const fullHistory: ChatCompletionMessageParam[] = [];

    if (request.preamble) {
      fullHistory.push({ role: "system", content: request.preamble });
    }

    fullHistory.push(...(request.chatHistory as ChatCompletionMessageParam[]));

    const promptWithContext = this.buildPromptWithContext(request);
    fullHistory.push({ role: "user", content: promptWithContext });

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

  private getActions(action: ActionDefinition): any {
    return {
      name: action.name,
      description: action.description,
      parameters: action.parameters,
      dependencies: action.dependencies,
      tag: action.tag,
    };
  }

  private parseCompletionResponse(response: any): CompletionResponse {
    const choice = response.choices[0];
    if (choice.message.function_call) {
      return {
        choice: ModelChoice.Action,
        actionName: choice.message.function_call.name,
        args: JSON.parse(choice.message.function_call.arguments),
        usage: response.usage,
        rawResponse: response,
      };
    } else {
      return {
        choice: ModelChoice.Message,
        message: choice.message.content || "",
        usage: response.usage,
        rawResponse: response,
      };
    }
  }
}
