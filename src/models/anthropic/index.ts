import Client from "@anthropic-ai/sdk";
import {
  CompletionRequest,
  CompletionResponse,
  ModelChoice,
  ModelInterface,
} from "../../shared/types/model";
import {
  MessageCreateParamsNonStreaming,
  MessageParam,
  Tool,
  ToolChoice,
  ToolChoiceAuto,
} from "@anthropic-ai/sdk/resources";

interface AnthropicMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class AnthropicProvider extends ModelInterface {
  private client: Client;
  private model: string;

  constructor(config: { apiKey: string; model?: string }) {
    super();
    this.client = new Client({
      apiKey: config.apiKey,
    });
    this.model = config.model || "claude-3-opus-latest";
  }

  async completion(request: CompletionRequest): Promise<CompletionResponse> {
    const messages = this.buildFullHistory(request);

    const anthropicRequest: MessageCreateParamsNonStreaming = {
      model: this.model,
      messages: messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    };

    if (request.actions && request.actions.length > 0) {
      anthropicRequest.tools = this.convertActionsToTools(request.actions);
      anthropicRequest.tool_choice = { type: "any" };
    }

    if (request.additionalParams) {
      Object.assign(anthropicRequest, request.additionalParams);
    }

    try {
      const response = await this.client.messages.create(anthropicRequest);
      console.log(response);
      console.log("Anthropic completion response:", response.content);
      if (response.usage) {
        console.log(`Anthropic token usage: ${JSON.stringify(response.usage)}`);
      }

      return this.parseCompletionResponse(response);
    } catch (error) {
      console.error("Error calling Anthropic API:", error);
      throw error;
    }
  }

  private buildFullHistory(request: CompletionRequest): MessageParam[] {
    const messages: MessageParam[] = [];

    if (request.preamble) {
      messages.push({ role: "assistant", content: request.preamble });
    }

    if (request.chatHistory) {
      messages.push(
        ...request.chatHistory.map(
          (msg) =>
            ({
              role: msg.role === "system" ? "assistant" : msg.role,
              content: msg.content,
            } as MessageParam)
        )
      );
    }

    const promptWithContext = this.buildPromptWithContext(request);
    messages.push({ role: "user", content: promptWithContext });

    return messages;
  }

  private buildPromptWithContext(request: CompletionRequest): string {
    let prompt = request.prompt;
    if (request.documents && request.documents.length > 0) {
      const context = request.documents.map((doc) => doc.text).join("\n\n");
      prompt = `Context:\n${context}\n\n${prompt}`;
    }
    return prompt;
  }

  private convertActionsToTools(actions: any[]): Tool[] {
    return actions.map((action) => ({
      name: action.name,
      description: action.description,
      input_schema: { type: "object", properties: {}, required: [] },
    }));
  }

  private parseCompletionResponse(response: any): CompletionResponse {
    if (response.content[0].type === "text") {
      return {
        choice: ModelChoice.Message,
        message: response.content[0].text,
        usage: response.usage,
        rawResponse: response,
      };
    } else if (response.content[0].type === "tool_call") {
      const toolCall = response.content[0].tool_call;
      return {
        choice: ModelChoice.Action,
        actionName: toolCall.function.name,
        args: JSON.parse(toolCall.function.arguments),
        usage: response.usage,
        rawResponse: response,
      };
    } else {
      throw new Error("Unexpected response type from Anthropic API");
    }
  }
}
