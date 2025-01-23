import {
  AgentConfig,
  AgentContext,
  AgentResponse,
  AgentState,
} from "../shared/types/agent/types";

export interface Agent {
  // Core Properties
  readonly id: string;
  readonly config: AgentConfig;

  // Lifecycle Methods
  initialize(): Promise<void>;

  // State Management
  getState(): Promise<AgentState>;
  updateState(state: Partial<AgentState>): Promise<void>;

  // Core Communication
  sendMessage(message: string, context?: AgentContext): Promise<AgentResponse>;
  streamMessage(
    message: string,
    callback: (response: Partial<AgentResponse>) => void,
    context?: AgentContext
  ): Promise<void>;

  // // Context & Memory Management
  // getContext(): Promise<AgentContext>;
  // updateContext(context: Partial<AgentContext>): Promise<void>;
  // clearContext(): Promise<void>;

  // Configuration
  updateConfig(config: Partial<AgentConfig>): Promise<void>;
}
