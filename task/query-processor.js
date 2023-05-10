/**
 * Converts the user query to set of tasks
 */

const { AiTask } = require('./ai-task');
const { SalesforceTask } = require('./salesforce-task');
const { TaskManager } = require('./task-manager');
const { CustomMetadataPromptStrategy } = require("../salesforce/components/component-prompt-strategy");
const store = require('data-store')({ path: process.cwd() + '/request-store.json' });

export class QueryProcessor {

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
    }

    // Generates tasks
    async process() {

        // create task manager instance
        const taskManager = new TaskManager(this);

        switch (this.type) {
            case 'customMetadataType':
                this.componentStrategyExecutor = new CustomMetadataPromptStrategy();
                const aiTask = this.createCustomMetadataTasks();
                taskManager.addTask(aiTask);
                await taskManager.execute();
                break;
            default:
                break;
        }
    }

    generateNextTask(oldTask, result) {
        try {
            if (this.componentStrategyExecutor.requiresFurtherPrompt(result)) {
                return this.generateAiTask(
                    this.componentStrategyExecutor.getNextPrompt(result),
                    {userText: this.query}
                );
            } else if (!oldTask instanceof SalesforceTask) { // TODO: this must be updated 
                return this.generateSalesforceTask(
                    result
                );
            } else {
                generateDbUpdateTask(JSON.stringify(e));
            }
        } catch(e) {
            console.log(e);
            if (e instanceof NoSufficientInformation) {
                generateDbUpdateTask(JSON.stringify(result));
            }
        }
        return null;
    }

    mergeObj() {
        return function(result) {
            this.result = {...this.result, ...result};
        }
    }

    generateAiTask(prompt, inputVars) {
        return new AiTask()
            .setModel(this.model)
            .setPrompt(prompt)
            .setResultWorker(this.mergeObj)
            .setInputVars(inputVars);
    }

    generateSalesforceTask(result) {
        return new SalesforceTask()
            .setResultObj(this.componentStrategyExecutor.formatResultforSalesforce(result))
            .setConnection(this.conn);
    }

    generateDbUpdateTask(response) {
        const requestData = store.get(this.userId);
        store.set(this.userId, {...requestData, response: response, isDone: true});
    }

    createCustomMetadataTask() {
        return this.generateAiTask(
            this.componentStrategyExecutor.getInitialPrompt(),
            {userText: this.query}
        );
    }


}