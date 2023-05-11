const { LLMChain } = require("langchain/chains");
const { Task } = require('./task');
const { HumanChatMessage, SystemChatMessage } = require("langchain/schema");

class AiTask extends Task {

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
        const res = await this.model.call([
            new HumanChatMessage(
                this.prompt
            )
        ]
        );
        console.log(res);
        if (res instanceof String) {
            this.result = {...this.result, ...JSON.parse(res)}
        } else {
            this.result = {...this.result, ...JSON.parse(res.text)}
        }
        return this.result;
    }

}

module.exports = {
    AiTask
};