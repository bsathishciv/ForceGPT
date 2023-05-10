const { LLMChain } = require("langchain/chains");
const { Task } = require('./task');

export class AiTask extends Task {

    prompt;
    model;
    inputVarObj;
    workerFunc;
    result = {};

    setModel(model) {
        this.model = model;
        return this;
    }

    setPrompt(prompt) {
        this.prompt = prompt;
        return this;
    }

    // function that will process the previous task result
    setResultWorker(func) {
        this.workerFunc = func;
        return this;
    }

    async injectDetail(result) {
        await this.workerFunc(this.prompt, result);
    }

    setInputVars(obj) {
        this.inputVarObj = obj;
        return this;
    }

    // prepare for execution
    async prepare() {
        // TO DO
    }

    async perform() {
        const chain = new LLMChain({ llm: this.model, prompt: this.prompt });
        const res = await chain.call(
            this.inputVarObj
        );
        if (res instanceof string) {
            this.result = {...this.result, ...JSON.parse(res)}
        } else {
            this.result = {...this.result, ...res}
        }
        return this.result;
    }

}