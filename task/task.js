/**
 * abstract high level task container
 */

class Task {
    id;
    name;
    isLast = false;

    async perform() {
        throw new Error('Method not implemented');
    }

    isDeferred() {
        return false;
    }
}

module.exports = {
    Task
};