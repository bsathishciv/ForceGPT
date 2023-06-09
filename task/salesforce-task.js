const { Task } = require('./task');
const { query, search, metadata, describe, tooling, sobject } = require('../salesforce/salesforce');

const functionMap = {
    metadata: metadata,
    query: query,
    describe: describe,
    tooling: tooling,
    sobject: sobject
};

/**
 * Task that performs action against salesforce
 */
class SalesforceTask extends Task {
    
    error;
    detail = {};
    response;
    conn;
    result;
    cmd;
    deferred = false;

    constructor(id, name) {
        super();
        this.name = name;
        this.id = id;
    }

    setConnection(con) {
        this.conn = con;
        return this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    command(cmd) {
        this.cmd = cmd;
        return this;
    }

    setArgs(args) {
        this.args = args;
        return this;
    }

    isDeferred() {
        return this.deferred;
    }

    defer() {
        this.deferred = true;
    }

    expedite() {
        this.deferred = false;
    }

    setIsLast(last) {
        this.isLast = last;
        return this;
    }

    async perform() {
        const func = functionMap[this.type];
        if (func) {
            this.result = await func.call(null, this.conn, this.cmd, this.args);
        }
        /*switch (this.type) {
            case 'metadata':
                this.result = await metadata(this.conn, this.cmd, this.args);
                break;
            case 'query':
                this.result = await query(this.conn, this.cmd, this.args);
                break;
            case 'describe':
                this.result = await describe(this.conn, this.cmd, this.args);
                break;
            case 'tooling':
                this.result = await tooling(this.conn, this.cmd, this.args);
                break;
            case 'sobject':
                this.result = await sobject(this.conn, this.cmd, this.args);
                break;
            default:
                break;
        }
        return null;*/
    }

}

module.exports = {
    SalesforceTask
};