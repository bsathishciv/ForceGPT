const { SalesforceTask } = require("../../task/salesforce-task");
const { Component } = require("../component");

class ApexLog extends Component {

    name = 'ApexLog'

    getPromptFor(objective, command) {
        switch (command) {
            case 'query':
                return `
                    Act as a salesforce expert having deep knowledge in generating SOQL queries for Tooling API.
                    Generate a JSON response in the below format by extracting data from user-text below. Component names and field names must be exactly matched to user input. 
                    The format should be strictly followed and query must be a valid SOQL query. And limit must always be 30
                    ---Example format 1: list all apex logs.
                    [{
                        "command": "tooling.query",
                        "args": {
                            "query": "SELECT Id FROM ApexLog"
                        }
                    }]
                    ---
                    user-text: "${objective}"
                    --
                    Note that '*' is not supported as fields in SOQL
                    Respond in JSON with the above format and with no other explanations.
                    `;
            case 'delete':
            case 'destroy':
                return `
                    Act as a salesforce expert having deep knowledge in generating SOQL queries.
                    Generate a JSON response in the below format by extracting data from user-text below. Component names and field names must be exactly matched to user input. 
                    The format should be strictly followed with only changes to Id attribute, if there are any ids specified include those, otherwise it should be empty.
                    ---Example format 1: delete apex logs.
                    [{
                        "command": "tooling.delete",
                        "args": {
                            "type": "ApexLog",
                            "id": ["07LDn000004PTIKMA4"]
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

    onPreExecution(creator, task, taskList) {
        if (task instanceof SalesforceTask) {
            if (task.isDeferred()) { // do not process deferred task
                return;
            }
            switch (task.cmd) {
                case 'delete':
                    if (this.isMissingMandatoryAttributesForUpdate(task.args)) {
                        // Defer until all mandatory information is resolved.
                        task.defer();
                        // create an ai task to prepare query tooling payload
                        creator.createSalesforceTask(
                            {
                                command: "tooling.query",
                                args: {
                                    query: "select id from ApexLog"
                                }
                            }
                        );
                    }
                default:
                    break;
            }
        }
    }

    // @param args - It is the argument array that is passed into the JSForce command.
    // [0] is the type - 'ApexLog'
    // [1] is the id list.
    isMissingMandatoryAttributesForUpdate(args) {
        if (args && args[1] && args[1].length) {
            return false;
        }
        return true;
    }

    onPostExecution(creator, task, taskList) {
        if (task instanceof SalesforceTask) {
            if (task.result) {
                if (taskList && taskList.length) {
                    console.log(taskList[0]);
                    if (taskList[0].isDeferred() && this.getConcreteCommand(taskList[0].cmd) == 'delete') {
                        this.setMandatoryAttributesForUpdate(taskList[0], task.result);
                        taskList[0].expedite();
                    }
                }
            }
        }
    }

    setMandatoryAttributesForUpdate(newTask, oldTask) {
        if (oldTask.records && oldTask.records.length) {
            const idArr = oldTask.records.map(rec => rec.Id);
            newTask.args[1] = idArr;
        }
    }

}

module.exports = new ApexLog();