import axios from "axios";
import {
  CompletionRequest,
  CompletionResponse,
  ModelChoice,
  ModelInterface,
} from "../../shared/types/model";

export class DeepSeekProvider extends ModelInterface {
  private apiKey: string;
  private baseURL: string = "https://api.deepseek.com";
  private model: string;

  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    this.model = config.model || "deepseek-chat"; // Default to DeepSeek-V3
  }

  async completion(request: CompletionRequest): Promise<CompletionResponse> {
    const messages = this.buildFullHistory(request);

    const deepseekRequest: any = {
      model: this.model,
      messages: messages,
      temperature: request.temperature,
      stream: false, // Set to true for streaming responses
    };

    // Add functions if they exist
    if (request.actions && request.actions.length > 0) {
      deepseekRequest.functions = request.actions;
      deepseekRequest.function_call = "auto";
    }

    // Add any additional parameters
    if (request.additionalParams) {
      Object.assign(deepseekRequest, request.additionalParams);
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        deepseekRequest,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer`,
          },
        }
      );

      console.log(`DeepSeek completion response:`, response.data.choices[0]);
      if (response.data.usage) {
        console.log(
          `DeepSeek token usage: ${JSON.stringify(response.data.usage)}`
        );
      }

      return this.parseCompletionResponse(response.data);
    } catch (error) {
      console.error("Error calling DeepSeek API:", error);
      throw error;
    }
  }

  private buildFullHistory(request: CompletionRequest): Array<{
    role: string;
    content: string;
  }> {
    const messages: Array<{ role: string; content: string }> = [];

    // Add system message (preamble) if it exists
    if (request.preamble) {
      messages.push({
        role: "system",
        content: request.preamble,
      });
    }

    // Add chat history
    if (request.chatHistory) {
      messages.push(...request.chatHistory);
    }

    // Add documents as context in the prompt
    const promptWithContext = this.buildPromptWithContext(request);
    messages.push({
      role: "user",
      content: promptWithContext,
    });

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

  private parseCompletionResponse(response: any): CompletionResponse {
    const choice = response.choices[0];

    if (choice.message?.function_call) {
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
        message: choice.message?.content || "",
        usage: response.usage,
        rawResponse: response,
      };
    }
  }
}
