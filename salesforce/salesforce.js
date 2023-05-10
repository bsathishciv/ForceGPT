/**
 * 
 */

import jsforce from 'jsforce';

export function initializeSalesforceConnection(instanceUrl, sessionId) {

    var conn = new jsforce.Connection({
        serverUrl : instanceUrl,
        sessionId : sessionId
    });

    return conn;
}

export async function query(con, queryString) {
    try {
        const result = await con.query(
            queryString
        );
        if (result && result.length) {
            return result.records;
        }
    } catch(e) {
        console.log(e);
    }
    return [];
}

export async function updateMetadata(con, component, metadata) {
    try {
        const results = await con.metadata.update(
            component, 
            metadata
        );
        if (results && results.length) {
            if (results[i].success) {
                return results;
            }
        }
    } catch(e) {
        console.log(e);
    }
    return null;
}