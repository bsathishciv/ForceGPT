const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { connectQueue } = require('./redis-config');
const {db} = require("./db");
//const store = require('data-store')({ path: process.cwd() + '/request-store.json' });

//const fs = require('fs');

//dotenv.config()

const queueName = 'request-queue';
const queue = connectQueue(queueName);

const app = express();
app.use(bodyParser.json());


// Endpoint to handle incoming requests
app.post('/process', (req, res) => {
    console.log(req.body);
    const requestId = uuidv4();
    const requestData = req.body;

    if (requestData.userId) {
        // overwrite the latest message for the orgId for simplicity and POC
        const obj = {
            [requestData.userId]: {
                ...requestData,
                response: null,
                isDone: false
            }
        }
        //fs.writeFileSync(`${process.cwd()}/request-store.json`, JSON.stringify(obj));
        db.delete(requestData.userId);
        db.set(requestData.userId, {
            ...requestData,
            response: null,
            isDone: false
        }); 
        //db.sync();
    }
    // Store the request in Redis
    queue.add({
        status: true,
        ...requestData
    });

    return res.send({ status: true, error: null });

});

app.get('/status/:id', (req, res) => {
    const resp = db.get(req.params.id);
    //const jsonObj = JSON.parse(fs.readFileSync(`${process.cwd()}/request-store.json`, 'utf8'));
    //const resp = jsonObj[req.params.id];
    console.log(resp);
    res.send(JSON.stringify(resp)); 
});

// Start the Express server
app.listen(process.env.PORT || 8086, () => {
  console.log('Server listening on port 8080');
});
