const { connectQueue } = require('./redis-config');
const { TaskCreator } = require("./task/task-creator");
const { initializeSalesforceConnection } = require("./salesforce/salesforce");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { ComponentRegistry } = require('./salesforce/component');
const Db = require("./db");

// DB CONNECTION
const db = new Db();
db.init();

// SETUP REDIS
const queueName = 'request-queue';
const queue = connectQueue(queueName);
console.log('Queue connected: ' +queueName);

// SETUP MODEL
const model = new ChatOpenAI(
    { 
        modelName: process.env.LLM, 
        openAIApiKey: process.env.OPENAI_API_KEY, 
        temperature: 0.9 
    }
);
console.log('model configured!');

// INIT COMPONENT REGISTRY
const registry = new ComponentRegistry();
registry.init();
console.log(registry.components)
console.log('Registry initialized!');

queue.process(
    async (job) => {
        jobHandler(job);
    }
);

async function jobHandler(job) {
   try {
        const requestData = job.data;
        console.log(requestData);
        if (requestData) {
            const conn = initializeSalesforceConnection(requestData.instanceUrl, requestData.sessionId);
            await new TaskCreator(requestData.userId, requestData.orgId, model, db)
                .setConnection(conn)
                .setObjective(requestData.text)
                .setComponentRegistry(registry)
                .create();
            console.log(`--done--`);
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    jobHandler
}