/**
 * Converts the user query to set of tasks
 */

const { AiTask } = require('./ai-task');
const { SalesforceTask } = require('./salesforce-task');
const { TaskManager } = require('./task-manager');
const { PromptGenerator } = require("../prompts/default");
const { JSFConvertor } = require("../jsforce/convertor");
//const store = require('data-store')({ path: process.cwd() + '/request-store.json' });
const fs = require('fs');

class TaskCreator {

    type;
    objective;
    model;
    conn;
    db;
    taskManager;
    convertor;
    cmpRegistry;
    cmp;
    orgId;

    constructor(userId, orgId, model, db) {
        this.userId = userId;
        this.orgId = orgId;
        this.model = model;
        this.db = db;
        this.taskManager = new TaskManager(this);
    }

    setObjective(objective) {
        this.objective = objective;
        return this;
    }

    setConnection(con) {
        this.conn = con;
        return this;
    }

    setComponentRegistry(cmp) {
        this.cmpRegistry = cmp;
        return this;
    }

    // Generates initial task
    async create() {
        try {
            this.convertor = new JSFConvertor(this.conn);
            // Create an AiTask to resolve the command and 
            // type the user is talking about
            this.createAiTask(
                PromptGenerator.getInitialPrompt(this.objective),
                true
            );
            const result = await this.taskManager.execute();
            // update to db
            await this.db.completeJob(this.userId, this.orgId, JSON.stringify(result));
        } catch (e) {
            await this.db.completeJob(this.userId, this.orgId, JSON.stringify(e));
            console.log(e);
        }
    }

    async createNextTask(oldTask) {
        try {
            if (oldTask.isLast) {
                return;
            }
            if (!this.cmp) {
                this.cmp = this.cmpRegistry.getComponent(oldTask.result.type);
            }
            if (this.cmp) {
                this.cmp.createNextTask(this, this.objective, oldTask);
            } else {
                this.createAiTask(
                    PromptGenerator.getDefaultPrompt(this.objective), false, true,
                );
            }
        } catch (e) {
            await this.db.completeJob(this.userId, this.orgId, JSON.stringify(e));
            console.log(e);
        }
    }

    createAiTask(prompt, isInitial=false, isLast=false) {
        console.log(isInitial, isLast);
        this.taskManager.addTask(
            new AiTask()
                .setModel(this.model)
                .setPrompt(prompt)
                .setIsInitial(isInitial)
                .setIsLast(isLast)
        );
    }

    createSalesforceTask(result) {
        const {type, command, argsArray} = this.convertor.convert(
            result
        );
        this.taskManager.addTask(
            new SalesforceTask(this.taskManager.taskList.length, 'sf-'+this.taskManager.taskList.length)
                .setConnection(this.conn)
                .setType(type)
                .command(command)
                .setArgs(argsArray)
        );
    }

    // Hooks

    onPreExecution(task, taskList) {
        if (this.cmp) {
            this.cmp.onPreExecution(this, task, taskList);
        }
    }

    onPostExecution(task, taskList) {
        if (this.cmp) {
            this.cmp.onPostExecution(this, task, taskList);
        }
    }

}

module.exports = {
    TaskCreator
}