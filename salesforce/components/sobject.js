const { SalesforceTask } = require("../../task/salesforce-task");
const { Component } = require("../component");

class SObject extends Component {

    name = 'SObject'

    getPromptFor(objective, command) {
        switch (command) {
            case 'query':
                return `
                    Act as a salesforce expert having deep knowledge in generating SOQL queries.
                    Generate a JSON response in the below format by extracting data from user-text below. Component names and field names must be exactly matched to user input. 
                    The format should be strictly followed and query must be a valid SOQL query. And limit must always be 30
                    ---Example format 1: get all accounts whose name starts with 'Andre'.
                    [{
                        "command": "query",
                        "args": {
                            "query": "SELECT Id FROM ACCOUNT LIMIT 10"
                        }
                    }]
                    ---
                    user-text: "${objective}"
                    --
                    Note that '*' is not supported as fields in SOQL
                    Respond in JSON with the above format and with no other explanations.
                    `;
            case 'describe':
                return `
                    Act as a salesforce expert having deep knowledge in generating SOQL queries.
                    Generate a JSON response in the below format by extracting data from user-text below. Component names and field names must be exactly matched to user input. 
                    The format should be strictly followed with only changes to name attribute.
                    ---Example format 1: can you describe TestObject__c.
                    [{
                        "command": "describe",
                        "args": {
                            "name": "TestObject__c"
                        }
                    }]
                    ---
                    user-text: "${objective}"
                    --
                    Respond in JSON with the above format and with no other explanations.
                    `;
            default:
                break;
        }
    }

    onPreExecution(creator, task, taskList) {}

    onPostExecution(creator, task, taskList) {}

}

module.exports = new SObject();