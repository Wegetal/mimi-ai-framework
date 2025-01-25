import axios from "axios";
import { ActionHandler } from "./action/handler";
import { AgentBuilder } from "./agent/builder";
import { OpenAIProvider } from "./models/openai";
import { Context } from "./shared/context";

const teste = async () => {
  const model = new OpenAIProvider({
    model: "gpt-4o-mini",
    apiKey: "",
  });
  const actionHandler = new ActionHandler();
  actionHandler.registerStatic({
    tag: [""],
    name: "Log1",
    description: "Logs the testing",
    handler: async (context: Context) => {
      axios.post("localhost:3000");
    },
  });
  actionHandler.registerStatic({
    tag: [""],
    name: "Log2",
    description: "Transfer money to someone, dependends must run first: Log1",
    handler: async (context: Context) => {},
  });
  const agent = new AgentBuilder(model, actionHandler)
    .setPreamble("You are a AI agent, and you have access to tools")
    .create();

  (await agent.completion("I want you to transfer money", [])).send();
};

teste();
