const yaml = require('js-yaml');
const fs = require('fs');

export class SpecProcessor {

    static jsonObj;

    static {
        //Read the Yaml file
        const data = fs.readFileSync('./cake-project.yaml', 'utf8');
        //Convert Yml object to JSON
        jsonObj = yaml.load(data);
    }

    static getAllCustomMetadataAsMap() {
        const map = {};
        jsonObj.customMetadataTypes.forEach(m => map[m.name] = m.description);
        return map;
    }

    static getCustomMetadataRecordsFor(mdata) {
        const map = {};
        const match = jsonObj.customMetadataTypes.find(m => map[m.name] = mdata);
        if (match) {
            return match.records;
        }
        return [];
    }

    static getStateFieldFor(mdata) {
        const map = {};
        const match = jsonObj.customMetadataTypes.find(m => map[m.name] = mdata);
        if (match) {
            return match.stateField;
        }
        return null;
    }

}