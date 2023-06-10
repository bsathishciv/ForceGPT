const { SalesforceTask } = require("../../task/salesforce-task");
const { Component } = require("../component");

class Apex extends Component {

    name = 'Apex'

    getPromptFor(objective, command) {
        switch (command) {
            case 'executeAnonymous':
                return `
                    Act as a salesforce expert having deep knowledge in generating SOQL queries for Tooling API.
                    Generate a JSON response in the below format by extracting data from user-text below. Component names and field names must be exactly matched to user input. 
                    The format should be strictly followed.
                    The user entered apex must be validated and corrected and assigned to the apex attribute below to be executed anonymously.
                    ---
                    [{
                        "command": "tooling.executeAnonymous",
                        "args": {
                            "apex": "system.debug('Hello!');"
                        }
                    }]
                    ---
                    user-text: "${objective}"
                    --
                    Respond in JSON with the above format and with no other explanations.
                    `;
            case 'delete':
            case 'beautify':
                return `
                    From the user-text below extract only the actual code under "Execute Anonymous:" and meaningful DEBUG statements and respond as below format in JSON
                    ---
                    {
                        "code": "<the apex code here>",
                        "result": "the debug info here "
                    }
                    ---
                    user-text: "${objective}"
                    --
                    Note: Make the result attribute more descriptive with the debug info. It should definitely contain the debug info, but you have to enrich it more descriptive fashion
                    Respond in JSON with the above format and with no other explanations.
                    `;
            default:
                break;
        }
    }

    

    onPreExecution(creator, task, taskList) {}

    onPostExecution(creator, task, taskList) {
        if (task instanceof SalesforceTask) {
            if (task.result) {
                if (this.getConcreteCommand(task.cmd) == 'executeAnonymous') {
                    if (!task.result.success) {
                        return;
                    }
                    creator.createSalesforceTask(
                        {
                            command: "tooling.query",
                            args: {
                                query: "SELECT Id FROM ApexLog WHERE Request = 'API' AND Location = 'Monitoring' AND Operation like '%executeAnonymous%' ORDER BY StartTime DESC, Id DESC LIMIT 1"
                            }
                        }
                    );
                }
                else if (this.getConcreteCommand(task.cmd) == 'query') {
                    creator.createSalesforceTask(
                        {
                            command: "sobject.ApexLog.retrieve",
                            args: {
                                id: `${task.result.records[0].Id}/Body`
                            }
                        }
                    );
                } else {
                    if (this.getConcreteCommand(task.cmd) == 'retrieve') {
                        if (process.env.BEAUTIFY_DEBUG_LOGS) { // it is costly as it feeds many token to the model for summarization
                            creator.createAiTask(
                                this.getPromptFor(task.result, 'beautify'),
                                false,
                                true
                            );
                        }
                    }
                }
            }
        }
    }

    getExpDate(hour) {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + hour);
        return expirationDate.toISOString();
    }

}

module.exports = new Apex();