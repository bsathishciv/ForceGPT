/**
 * 
 */

const { CustomMetadataAction } = require("../salesforce/components/component-action-handler");
const { Task } = require('./task');
const { query, search } = require('../salesforce/salesforce');

class SalesforceTask extends Task {
    
    error;
    detail = {};
    response;
    conn;
    resultObj;

    constructor(id, name) {
        super()
        this.name = name;
        this.id = id;
    }

    setResultObj(obj) {
        this.detail = obj;
        return this;
    }

    setConnection(con) {
        this.conn = con;
        return this;
    }

    async perform() {
        if (this.detail.componentType == 'CustomMetadata') {
            if (this.detail.action == 'activate' || this.detail.action == 'inactivate') {
                const mdata = this.generateMetadata(
                    this.detail.componentName,
                    this.detail.recordData
                );
                const result = await new CustomMetadataAction(this.conn)
                    .setComponentMetadata(
                        mdata
                    )
                    .perform(this.detail.action);
                return result;
            }
        } else if (this.detail.action == 'query') {
            let result = await query(this.conn, this.detail.query);
            result = {...result, ...this.detail};
            return result;
        } else if (this.detail.action == 'search') {
            let result = await search(this.conn, this.detail.query);
            result = {...result, ...this.detail};
            return result;
        }
        return null;
    }

    generateMetadata(componentName, recordData) {
        const mdata = {
            fullName: `${componentName}.${recordData.developerName}`,
            label: recordData.Label,
            values: []
        };
        delete recordData.Label;
        Object.keys(recordData).forEach((key) => {
            if (key == 'developerName') {
                return;
            }
            mdata.values.push(
                {
                    field: key,
                    value: recordData[key]
                }
            )
        });
        return mdata;
    }

}

module.exports = {
    SalesforceTask
};