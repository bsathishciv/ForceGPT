const { PromptTemplate } = require("langchain/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");

const ACTION_MAP = {
    inactivate: ['turn off', 'disable', 'inactivate', 'deactivate'],
    activate: ['turn on', 'activate', 'enable'],
    update: ['update', 'change'],
    delete: ['delete', 'purge'],
    list: ['list', 'get all']
};

class PromptGenerator {
    generate() {
        throw new Error('Method not implemented')
    }
}

class CustomMetadataPromptGenerator extends PromptGenerator {
    static getPromptToMatchAnyMetadataType(userText, mdataMap, expectedResult) {

        const template = `
            ${userText}
            ---
            Extract data from the above given text with respect to following action-map and componentName-map.
            action-map contains key,value pairs where key is the action name and its values are close resemblences of the action.
            Your response for 'action' must definitely be any one of the keys from the action-map.
            componentName-map contains component name which you must match to exact key by resolving component asked by user.
            Respond with exact matched key for componentName from the componentName-map and match the action specified
            by user to exact key in action-map by understanding its synonyms, consider the values of each key in action map as its synonyms and respond the exact matched key from action-map. 
            Respond with exact format as below in json: 
            ${expectedResult}. 
            If matches cannot be found in both of the maps, then respond with format: 
            {
                error: "No matches found"
            }
            
            action-map: ${JSON.stringify(ACTION_MAP)}
            
            componentName-map: ${JSON.stringify(mdataMap)}
        `;
        console.log(template);
        return template;
    }

    static getPromptToMatchAnyMetadataRecord(userText, recordMap, expectedResult) {
        const template = `
            ${userText}
            ---
            Extract data from the above given text and map it to the record name and record label from the below record-map.
            Respond with exact matched name and label from the record-map in the below format in JSON
            Respond with format: 
            "${expectedResult}". 
            If matches cannot be found in the map, then respond with format: 
            "{
                error: "No matches"
            }"
            
            record-map: ${recordMap}
        `;
        console.log(template);
        return template
    }
}

class SummaryPromptGenerator extends PromptGenerator {
    static getPromptToIdentifyAccount(userText, expectedResult) {

        const template = `
            ${userText}
            ---
            From the above given text extract the person name user is talking about?. 
            Respond with exact format as below without any other texts in json: 
            ${expectedResult}. 
        `;
        console.log(template);
        return template;
    }

    static getPromptToSummarizeData(account, sfInfo, expectedResult) {
        const template = `
            Summarize the following information about ${account} to describe the activities that are made.
            Activity information: ${sfInfo}
            Respond with format: 
            "${expectedResult}"
        `;
        console.log(template);
        return template
    }
}

module.exports = {
    CustomMetadataPromptGenerator,
    SummaryPromptGenerator
};
