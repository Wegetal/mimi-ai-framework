import axios from "axios";
import { ActionHandler } from "./action/handler";
import { AgentBuilder } from "./agent/builder";
import { OpenAIProvider } from "./models/openai";
import { Context } from "./shared/context";
import { Agent } from "./agent/agent";
import { DeepSeekProvider } from "./models/deepseek";
import { AnthropicProvider } from "./models/anthropic";

const teste = async () => {
  const model = new AnthropicProvider({
    apiKey: "",
  });
  const actionHandler = new ActionHandler();
  const initialContext = new Context();
  actionHandler.register({
    tags: [""],
    name: "Log1",
    description: "Logs the balance",
    handler: async (context: Context) => {
      console.log("Teste");
    },
  });
  actionHandler.register({
    tags: [""],
    name: "Log2",
    description: "Transfer 200 usd to Robert",
    dependencies: ["Log1"],
    handler: async (context: Context) => {
      console.log("Teste1");
    },
  });
  const agent = new Agent(
    model,
    "You are a AI agent, and you have access to tools",
    initialContext,
    actionHandler
  );

  await agent.chat("I want you to transfer 200 usd to Robert", []);
};

teste();
