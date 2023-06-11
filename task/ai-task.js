/**
 * Executes chat with the configured model.
 * @author Sathish Balaji <bsathish.civ@gmail.com>
 */

const { LLMChain } = require("langchain/chains");
const { Task } = require('./task');
const { HumanChatMessage, SystemChatMessage } = require("langchain/schema");

/**
 * Task that chats with AI model for completion/extraction
 */
class AiTask extends Task {

    prompt;
    model;
    inputVarObj;
    workerFunc;
    result = {};
    isInitial = false;

    setIsInitial(initial) {
        this.isInitial = initial;
        return this;
    }

    setResult(res) {
        this.result = res;
        return this;
    }

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
        this.prompt = this.workerFunc(this.prompt, result);
    }

    setInputVars(obj) {
        this.inputVarObj = obj;
        return this;
    }
    
    setIsLast(last) {
        console.log(last);
        this.isLast = last;
        return this;
    }

    async perform() {
        // TODO: Differentiate the chat message type. System and Human and Bot
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
            this.result = JSON.parse(res.text)
        }
        return this.result;
    }

}

module.exports = {
    AiTask
};