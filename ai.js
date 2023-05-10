const { OpenAI } = require("langchain/llms/openai");
const { PromptGenerator } = require("./prompt-generator");
import { LLMChain } from "langchain/chains";

export async function askAi(component, query) {

    const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.9 });

    const prompt = new PromptGenerator()
                        .forComponent(component)
                        .generate();

    const chain = new LLMChain({ llm: model, prompt: prompt });

    const res = await chain.call({ userText: query });

    return res;

}


