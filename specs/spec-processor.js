const fs = require('fs');

class SpecProcessor {

    jsonObj;

    constructor() {
        this.jsonObj = JSON.parse(fs.readFileSync(`${process.cwd()}/specs/cake-project.json`, 'utf8'));
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