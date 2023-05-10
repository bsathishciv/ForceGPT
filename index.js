const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { connectQueue } = require('./redis-config');
const store = require('data-store')({ path: process.cwd() + '/request-store.json' });

//dotenv.config()

const queueName = 'request-queue';
const queue = connectQueue(queueName);

const app = express();
app.use(bodyParser.json());


// Endpoint to handle incoming requests
app.post('/process', async (req, res) => {
    const requestId = uuidv4();
    const requestData = req.body;

    if (requestData.userId) {
        // overwrite the latest message for the orgId for simplicity and POC
        store.set(requestData.userId, {
            ...requestData,
            response: null,
            isDone: false
        }); 
    }

    // Store the request in Redis
    queue.add({
        status: true,
        requestData
    });

    return res.send({ status: true, error: null });

});

// Start the Express server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
