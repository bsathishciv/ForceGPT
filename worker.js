const { connectQueue } = require('./redis-config');
const store = require('data-store')({ path: process.cwd() + '/request-store.json' });
const { QueryProcessor } = require("./task/query-processor");
const { initializeSalesforceConnection } = require("./salesforce/salesforce");

const queueName = 'request-queue';
const queue = connectQueue(queueName);

console.log('Queue connected: ' +queueName);

const { ChatOpenAI } = require("langchain/chat_models/openai");
const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.9 });

console.log('model configured!');

queue.process(
    async (job) => {
        console.log('Message: ' +job.data);
        jobHandler(job);
    }
);

async function jobHandler(job) {
    const requestData = store.get(job.data.userId);
    if (requestData) {
        const conn = initializeSalesforceConnection(requestData.instanceUrl, requestData.sessionId);
        await new QueryProcessor(job.data.userId, model)
                                .setComponentType(requestData.component)
                                .setConnection(conn)
                                .setQuery(requestData.text)
                                .process();
        console.log(`--done--`);
    }
}