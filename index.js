const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { connectQueue } = require('./redis-config');
const Db = require("./db");

const db = new Db();
db.init();

const queueName = 'request-queue';
const queue = connectQueue(queueName);

const app = express();
app.use(bodyParser.json());


// Endpoint to handle incoming requests
app.post('/process', async (req, res) => {
    console.log(req.body);
    const requestId = uuidv4();
    const requestData = req.body;

    // overwrite the latest message for the orgId and userId for simplicity and prototype phase.
    // no need to store history
    try {
        await db.createJob(requestData.userId, requestData.orgId, requestData);

        // Store the request in Redis
        queue.add({
            status: true,
            ...requestData
        });
        return res.send({ status: true, error: null });
    } catch(e) {
        return res.send({ status: false, error: JSON.stringify(e) });
    }

});

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(
       `<textarea style="width: -webkit-fill-available;height: -webkit-fill-available;border: none;">
            '########::'#######::'########:::'######::'########::'######:::'########::'########:
             ##.....::'##.... ##: ##.... ##:'##... ##: ##.....::'##... ##:: ##.... ##:... ##..::
             ##::::::: ##:::: ##: ##:::: ##: ##:::..:: ##::::::: ##:::..::: ##:::: ##:::: ##::::
             ######::: ##:::: ##: ########:: ##::::::: ######::: ##::'####: ########::::: ##::::
             ##...:::: ##:::: ##: ##.. ##::: ##::::::: ##...:::: ##::: ##:: ##.....:::::: ##::::
             ##::::::: ##:::: ##: ##::. ##:: ##::: ##: ##::::::: ##::: ##:: ##::::::::::: ##::::
             ##:::::::. #######:: ##:::. ##:. ######:: ########:. ######::: ##::::::::::: ##::::
            ..:::::::::.......:::..:::::..:::......:::........:::......::::..::::::::::::..:::::
             ------------------------------------------------------------------------------------
             Created by www.rsforce.net | Powered by chatGPT
        </textarea>`
    ); 
});

app.get('/status/:id', async (req, res) => {
    const resp = await db.getJob(req.params.id);
    if (resp.is_done && !resp.result) {
        resp.result = "An unexpected error occurred. Please try again!"
    }
    res.send(JSON.stringify(resp)); 
});

// Start the Express server
app.listen(process.env.PORT || 8080, () => {
  console.log('Server listening on port 8080');
});
