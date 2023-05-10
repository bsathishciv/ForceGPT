/**
 * 
 */

const { CustomMetadataAction } = require("../salesforce/components/component-action-handler")

export class SalesforceTask extends Task {
    
    error;
    detail = {};
    response;
    conn;
    resultObj;

    constructor(id, name) {
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
        }
        return null;
    }

    generateMetadata(componentName, recordData) {
        const mdata = {
            fullName: `${componentName}.${recordData.developerName}`,
            values: []
        };
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