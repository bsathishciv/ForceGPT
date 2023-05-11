/**
 * 
 */

const jsforce =  require('jsforce');

function initializeSalesforceConnection(instanceUrl, sessionId) {

    var conn = new jsforce.Connection({
        serverUrl : instanceUrl,
        sessionId : sessionId
    });

    return conn;
}

async function query(con, queryString) {
    try {
        const result = await con.query(
            queryString
        );
        console.log(result);
        if (result) {
            return result;
        }
    } catch(e) {
        console.log(e);
    }
    return [];
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

async function updateMetadata(con, component, metadata) {
    try {
        const results = await con.metadata.update(
            component, 
            metadata
        );
        console.log(results);
        if (results) {
            return results;
        }
    } catch(e) {
        console.log(e);
    }
    return null;
}

module.exports = {
    initializeSalesforceConnection,
    query,
    search,
    updateMetadata
};