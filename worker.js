const { connectQueue } = require('./redis-config');
const store = require('data-store')({ path: process.cwd() + '/request-store.json' });
const { QueryProcessor } = require("./task/query-processor");
const { initializeSalesforceConnection } = require("./salesforce/salesforce");

const queueName = 'request-queue';
const queue = connectQueue(queueName);

console.log('Queue connected: ' +queueName);

const { OpenAI } = require("langchain/llms/openai");
const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.9 });

console.log('model configured!');

queue.process(
    async (job) => {
        jobHandler(job);
    }
);

async function jobHandler(job) {
    const requestData = store.get(job.data.userId);
    if (requestData) {
        const conn = initializeSalesforceConnection(requestData.instanceUrl, requestData.sessionId);
        const processor = new QueryProcessor(job.data.userId, model)
                                .setComponentType(requestData.component)
                                .setSfConnection(conn)
                                .setQuery(requestData.text);
        
        await processor.process();
    }
}