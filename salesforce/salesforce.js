/**
 * JSforce operations
 * @author Rajasneha Chidambaranathan <rajasneha20@gmail.com>
 */

const jsforce =  require('jsforce');

function initializeSalesforceConnection(instanceUrl, sessionId) {

    var conn = new jsforce.Connection({
        serverUrl : instanceUrl,
        sessionId : sessionId
    });

    return conn;
}

async function query(con, command, args) {
    try {
        const result = await con[command](...args);
        console.log(result);
        if (result.records && result.records.length) {
            result.records.forEach(
                rec => {
                    delete rec.attributes;
                }
            )
        }
        return result;
    } catch(e) {
            console.log(e)
        }
}

async function search(con, query) {
    try {
        const results = await con.search(query);
        console.log(results);
        return results;
    } catch(e) {
        console.log(e);
    }
    return [];
}


async function metadata(con, command, args) {
    try {
        console.log(args);
        const results = await con.metadata[command](...args);
        console.log(results);
        return results;
    } catch(e) {
        console.log(e)
    }
}

async function describe(con, command, args) {
    try {
        console.log(args);
        const results = await con.describe(...args);
        console.log(results);
        return results;
    } catch(e) {
        console.log(e)
    }
}

async function tooling(con, command, args) {
    try {
        console.log(command);
        console.log(args);
        let commands = command.split('.');
        let results; 
        if (commands.length == 1) {
            results = await con.tooling[command](...args);   
        } else if (commands[0] == 'sobject') {
            results = await con.tooling.sobject(commands[1])[commands[2]](...args);
        }
        console.log(results);
        return results;
    } catch(e) {
        console.log(e)
    }
}

async function sobject(con, command, args) {
    try {
        console.log(command);
        console.log(args);
        let commands = command.split('.');
        const results = await con.sobject(commands[0])[commands[1]](...args);
        console.log(results);
        return results;
    } catch(e) {
        console.log(e)
    }
}

module.exports = {
    initializeSalesforceConnection,
    query,
    search,
    metadata,
    describe,
    tooling,
    sobject
};