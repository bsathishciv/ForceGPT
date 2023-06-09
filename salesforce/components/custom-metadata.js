const { SalesforceTask } = require("../../task/salesforce-task");
const { Component } = require("../component");

class CustomMetadata extends Component {

    name = 'CustomMetadata'

    getPromptFor(objective, command) {
        switch (command) {
            case 'update':
                return `  
                Act as a salesforce expert having deep knowledge in how to use JSForce to programatically customize salesforce.
                Generate a JSON response in the below format by extracting data from user-text below. Component names and field names must be exactly matches to what user input. 
                The format should be strictly followed.
                ---Example format 1: update custom metadata type 'xxx__mdt' set 'order__c' to 34 for record 'yyy'.
                [{
                    "command": "metadata.update",
                    "args": {
                        "type": "CustomMetadata"
                        "metadata" : {
                            "fullName": "xxx__mdt.yyy",
                            "label": "<record label>",
                            "values": [
                                {
                                    "field": "order__c",
                                    "value": 34
                                }
                            ]
                        }
                    }
                }]
                ---
                Notice that label is a mandatory attribute and should contain a value.
                user-text: "${objective}"
                Respond in JSON with the above format and with no other explanations.
                `;
            case 'list':
                return `
                Act as a salesforce expert having deep knowledge in how to use JSForce to programatically customize salesforce.
                Generate a JSON response in the below format by extracting data from user-text below. Component names and field names must be exactly matches to what user input. 
                The format should be strictly followed.
                ---Example format 1: list all custom metadata types.
                [{
                    "command": "metadata.list",
                    "args": {
                        "types": [{"type": "CustomMetadata", "folder": null}]
                        "version": "57.0"
                    }
                }]
                ---
                Notice that label is a mandatory attribute and should contain a value.
                user-text: "${objective}"
                Respond in JSON with the above format and with no other explanations.
                `
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
                        "type": "CustomMetadata"
                        "fullNames": ["xxx__mdt.yyy"] // custom metadata name.record name
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
                case 'list':
                default:
                    break;
            }
        }
    }

    isMissingMandatoryAttributesForUpdate(args) {
        if (args && args[1].label) {
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
        this.mergeObjects(newTask.args[1], oldTask);
    }

}

module.exports = new CustomMetadata();