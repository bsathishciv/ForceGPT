/**
 * Converts the user query to set of tasks
 */

const { AiTask } = require('./ai-task');
const { SalesforceTask } = require('./salesforce-task');
const { TaskManager } = require('./task-manager');
const { CustomMetadataPromptStrategy, SummaryPromptStrategy } = require("../salesforce/components/component-prompt-strategy");
const store = require('data-store')({ path: process.cwd() + '/request-store.json' });

class QueryProcessor {

    type;
    query;
    model;
    componentStrategyExecutor;
    conn;

    constructor(userId, model) {
        this.userId = userId;
        this.model = model;
    }

    setComponentType(type) {
        this.type = type
        return this;
    }

    setQuery(query) {
        this.query = query;
        return this;
    }

    setConnection(con) {
        this.conn = con;
        return this;
    }

    // Generates tasks
    async process() {

        // create task manager instance
        const taskManager = new TaskManager(this);

        switch (this.type) {
            case 'customMetadata':
                this.componentStrategyExecutor = new CustomMetadataPromptStrategy();
                const aiTask = this.createCustomMetadataTasks();
                taskManager.addTask(aiTask);
                await taskManager.execute();
                break;
            case 'summary':
                this.componentStrategyExecutor = new SummaryPromptStrategy();
                const sfTask = this.createSummaryTask()
                taskManager.addTask(sfTask);
                await taskManager.execute();
                break;
            default:
                break;
        }
    }

    generateNextTask(oldTask, result) {
        try {
            // TO DO: determine next task dynamically
            console.log('generating new task');
            if (this.componentStrategyExecutor.requiresFurtherAiPrompt(result)) {
                return this.generateAiTask(
                    this.componentStrategyExecutor.getNextPrompt(result, this.query)
                );
            } else if (this.componentStrategyExecutor.requiresFurtherSfPrompt((oldTask instanceof SalesforceTask), result)) { // TODO: this must be updated 
                return this.generateSalesforceTask(
                    result
                );
            } else {
                if (this.type == 'summary') {
                    this.generateDbUpdateTask(JSON.stringify(result.summary));
                } else {
                    this.generateDbUpdateTask(JSON.stringify(result));
                }
            }
        } catch(e) {
            console.log(e);
            if (e instanceof NoSufficientInformation) {
                this.generateDbUpdateTask(JSON.stringify(result));
            }
        }
        return null;
    }

    mergeObj() {
        return function(result) {
            this.result = {...this.result, ...result};
        }
    }

    generateAiTask(prompt) {
        return new AiTask()
            .setModel(this.model)
            .setPrompt(prompt)
            .setResultWorker(this.mergeObj);
    }

    generateSalesforceTask(result) {
        console.log('sathish');
        console.log(result);
        return new SalesforceTask()
            .setResultObj(this.componentStrategyExecutor.formatResultforSalesforce(result))
            .setConnection(this.conn);
    }

    generateDbUpdateTask(response) {
        const requestData = store.get(this.userId);
        store.set(this.userId, {...requestData, response: response, isDone: true});
    }

    createCustomMetadataTasks() {
        return this.generateAiTask(
            this.componentStrategyExecutor.getInitialPrompt(this.query)
        );
    }

    createSummaryTask() {
        return this.generateAiTask(
            this.componentStrategyExecutor.getInitialPrompt(this.query)
        );
    }

}

module.exports = {
    QueryProcessor
}