/**
 * 
 */

const {updateMetadata} = require('../salesforce');

class ComponentAction {
    con;
    
    constructor(con) {
        this.con = con;
    }

    perform(action) {
        throw new Error('Method not implemented');
    }
}

export class CustomMetadataAction extends ComponentAction {

    mdata;

    constructor(con) {
        super(con);
    }

    setComponentMetadata(metadata) {
        this.mdata = metadata;
    }
    
    async perform(action) {
        switch (action) {
            case 'query':
                
                break;
            case 'update', 'activate', 'inactivate':
                return await updateMetadata(this.con, 'CustomMetadata', this.mdata);
            case 'delete':
                
                break;
            default:
                break;
        }
    }

}

/*class CustomObjectAction extends ComponentAction {

    setComponent()
    
    perform(action) {
        switch (action) {
            case 'query':
                
                break;
            case 'update':
                
                break;
            case 'delete':
                
                break;
            case 'activate', 'inactivate': // this is just an update to the state field from the spec sheet

                break;
            default:
                break;
        }
    }

}*/