/**
 * Runs the task from task list. Emits hooks for pre and post execution.
 * @author Sathish Balaji <bsathish.civ@gmail.com>
 */

class TaskManager {

    taskList = [];
    taskIdCounter = 1;
    maxIterations = 3;
    taskCreator;
    currentTask;

    constructor(taskCreator) {
        this.taskCreator = taskCreator;
    }

    addTask(task) {
        console.log(`---Adding new task---`);
        this.taskList.push(task);
        return this;
    }

    async execute() {
        while (true) {
            if (this.taskList.length == 0) {
                break;
            }
            this.currentTask = this.taskList.shift();
            if (this.currentTask) {
                // emit pre hook
                this.taskCreator.onPreExecution(this.currentTask, this.taskList);
                if (this.currentTask.isDeferred()) {
                    this.taskList.push(this.currentTask);
                    continue;
                }
                await this.currentTask.perform();
                if (this.hasError(this.currentTask.result)) {
                    // TODO: ask user for more details
                    await logError(this.currentTask.result);
                    break;
                }
                // emit post hook
                this.taskCreator.onPostExecution(this.currentTask, this.taskList);
                await this.taskCreator.createNextTask(this.currentTask);
            }
        }
        return this.currentTask.result;
    }

    hasError(result) {
        if (result && result.error) {
            return true;
        }
        return false;
    }

    logError(result) {
        // TO DO
    }

}

module.exports = {
    TaskManager
};
