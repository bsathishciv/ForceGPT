const { SalesforceTask } = require("../../task/salesforce-task");
const { Component } = require("../component");

class CustomObject extends Component {

    name = 'CustomField'

    getPromptFor(objective, command) {
        switch (command) {
            case 'update':
                return `  
                Act as a salesforce expert having deep knowledge in how to use JSForce to programatically customize salesforce.
                Generate a JSON response in the below format by extracting data from user-text below. Component names and field names must be exactly matched to user input. 
                ---Example format 1: update custom field 'yyy__c' in object 'xxx__c' set description to 'Orders'.
                [{
                    "command": "metadata.update",
                    "args": {
                        "type": "CustomField"
                        "metadata" : [{
                            "fullName": "xxx__c.yyy__c",
                            "label": <field label>,
                            "description": "Orders"
                        }]
                    }
                }]
                ---
                user-text: "${objective}"
                Respond in JSON with the above format and with no other explanations.
                `;
            case 'read':
                return `
                Act as a salesforce expert having deep knowledge in how to use JSForce to programatically customize salesforce.
                Generate a JSON response in the below format by extracting data from user-text below. Component names and field names must be exactly matches to what user input. 
                The format should be strictly followed and the command should be metadata.read only as we need to read the custom metadata from the org. Just update the
                "fullNames" array by resolving the component name and record name and do not change anything else. Ignore the action user is talking and just parse component and record
                ---Example format 1: read a custom metadata types.
                [{
                    "command": "metadata.read",
                    "args": {
                        "type": "CustomField",
                        "fullNames": ["xxx__c.yyy__c"]
                    }
                }]
                ---
                user-text: "${objective}"
                Respond in JSON with the above format and with no other explanations.
                `
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
                case 'update':
                    if (this.isMissingMandatoryAttributesForUpdate(task.args)) {
                        // Defer until all mandatory information is resolved.
                        task.defer();
                        // create an ai task to prepare read metadata payload
                        creator.createAiTask(
                            this.getPromptFor(creator.objective, 'read')
                        );
                    }
                default:
                    break;
            }
        }
    }

    isMissingMandatoryAttributesForUpdate(args) {
        if (args && args[1][0].label && args[1][0].type) {
            return false;
        }
        return true;
    }

    onPostExecution(creator, task, taskList) {
        if (task instanceof SalesforceTask) {
            if (task.result) {
                if (taskList && taskList.length) {
                    if (taskList[0].isDeferred() && this.getConcreteCommand(taskList[0].cmd) == 'update') {
                        this.setMandatoryAttributesForUpdate(taskList[0], task.result);
                        taskList[0].expedite();
                    }
                }
            }
        }
    }

    setMandatoryAttributesForUpdate(newTask, oldTask) {
        this.mergeObjects(newTask.args[1][0], oldTask);
    }

}

module.exports = new CustomObject();