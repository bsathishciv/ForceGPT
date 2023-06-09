const fs = require('fs');
const path = require('path');
const { AiTask } = require('../task/ai-task');
const { PromptGenerator } = require("../prompts/default");

const COMPONENT_DIR = './components';

class Component {

    name;
    
    createNextTask(creator, objective, prevTask) {
        if (prevTask.isLast) {
            return;
        }
        if (prevTask && prevTask.result && prevTask.result.command && prevTask.isInitial) {
            // Create an AiTask to generate a payload to feed into JSForce
            let prompt = this.getPromptFor(
                objective, 
                this.getConcreteCommand(prevTask.result.command)
            );
            if (!prompt) {
                console.log('sathish here');
                creator.createAiTask(
                    PromptGenerator.getDefaultPrompt(objective),
                    false,
                    true
                );
            } else {
                creator.createAiTask(
                    prompt
                );
            }
            
        } else if (prevTask && prevTask.result && prevTask instanceof AiTask) {
            creator.createSalesforceTask(prevTask.result[0])
        }
    }
    
    getPromptFor(objective, command) {
        throw new Error("Method not implemented");
    }

    onPreExecution(creator, task, taskList) {
        return;
    }

    onPostExecution(creator, task, taskList) {
        return;
    }

    getConcreteCommand(cmd) {
        const parts = cmd.split('.');
        return parts.length == 2 ? parts[1] : parts[0];
    }

    mergeObjects(obj1, obj2) {
        for (let prop in obj2) {
          if (obj2.hasOwnProperty(prop)) {
            if (typeof obj1[prop] !== 'boolean' && !obj1[prop]) {
              obj1[prop] = obj2[prop];
            }
          }
        }
    }
}

class ComponentRegistry {

    components = {};

    init() {

        const dirPath = path.resolve(__dirname, COMPONENT_DIR);
        
        const componentFiles = fs.readdirSync(dirPath);

        componentFiles.forEach((file) => {
            // Import the component dynamically
            const cmp = require(path.join(dirPath, file));

            // Register the component
            this.register(cmp);
        });

    }

    register(cmp) {
        this.components[cmp.name] = cmp;
    }

    unregister(cmp) {
        delete this.components[cmp.name];
    }

    hasComponent(name) {
        return this.components[name] !== undefined;
    }

    getComponent(name) {
        return this.components[name];
    }

}

module.exports = {
    ComponentRegistry,
    Component
}