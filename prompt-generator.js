import { PromptTemplate } from "langchain/prompts";

const ACTION_MAP = {
    inactivate: ['turn off', 'inactivate', 'deactivate'],
    activate: ['turn on', 'activate'],
    update: ['update', 'change'],
    delete: ['delete', 'purge'],
    list: ['list', 'get all']
};

const HANDLER_MAP = {
    "AffiliationDCRHandler": "To create Validation Request (DCR) record on account affiliations insert / update",
    "AddressDCRHandler": "To Update a DCR for an Address."
};

class PromptGenerator {
    generate() {
        throw new Error('Method not implemented')
    }
}

export class CustomMetadataPromptGenerator extends PromptGenerator {
    static getPromptToMatchAnyMetadataType(mdataMap, expectedResult) {
        const template = `
            {userText}
            ---
            Resolve the above given text with respect to following maps and respond with matched keys 
            of what user intends. 
            Respond with format: 
            "${expectedResult}". 
            If matches cannot be found in both of the maps, then respond with format: 
            "{
                error: "No matches"
            }"
            
            action map: ${ACTION_MAP}
            
            componentName map: ${mdataMap}
        `;

        return new PromptTemplate({
            template: template,
            inputVariables: ["userText"],
        });
    }

    static getPromptToMatchAnyMetadataRecord(recordMap, expectedResult) {
        const template = `
            {userText}
            ---
            Resolve the above given text with respect to following map and respond with matched value 
            of what user intends. 
            Respond with format: 
            "${expectedResult}". 
            If matches cannot be found in the map, then respond with format: 
            "{
                error: "No matches"
            }"
            
            recordName map: ${recordMap}
        `;

        return new PromptTemplate({
            template: template,
            inputVariables: ["userText"],
        });
    }
}
