/**
 * 
 */
export class TaskManager {

    taskList = [];
    taskIdCounter = 1;
    maxIterations = 3;
    taskCreator;

    constructor(taskCreator) {
        this.taskCreator = taskCreator;
    }
  
    addTask(task) {
        console.log(`---Adding new task: ${task}`);
        this.taskList.push(task);
        return this;
    }

    async execute() {
        while (true) {
            if (this.taskList.length == 0) {
                break;
            }
            const task = this.taskList.shift();
            await task.prepare();
            if (task) {
                const result = await task.perform();
                if (this.hasError(result)) {
                    await logError(result);
                    break;
                }
                const task = this.taskCreator.generateNextTask(task, result);
                if (task) {
                    this.addTask(task);
                }
            }
        }
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

    getNextTaskIndex(id) {
        return this.taskList.findIndex(task => task.id == id + 1);
    }

}

