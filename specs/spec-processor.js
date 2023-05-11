const yaml = require('js-yaml');
const fs = require('fs');

class SpecProcessor {

    jsonObj;

    constructor() {
        this.jsonObj = JSON.parse(fs.readFileSync(`${process.cwd()}/specs/cake-project.json`, 'utf8'));
    }

    getAllCustomMetadataAsMap() {
        const mapy = {};
        this.jsonObj.customMetadataTypes.forEach(m => {
            mapy[m.name] = m.description;
        });
        return mapy;
    }

    getCustomMetadataRecordsFor(mdata) {
        const map = {};
        const match = this.jsonObj.customMetadataTypes.find(m => map[m.name] = mdata);
        if (match) {
            return match.records;
        }
        return [];
    }

    getStateFieldFor(mdata) {
        const map = {};
        const match = this.jsonObj.customMetadataTypes.find(m => map[m.name] = mdata);
        if (match) {
            return match.stateField;
        }
        return null;
    }

    getMediaFieldsFor(objName) {
        return this.jsonObj[objName].mediaFields;
    }

    getActivityTableFor(objName) {
        return this.jsonObj[objName].activityTable;
    }

}

module.exports = {
    SpecProcessor
};