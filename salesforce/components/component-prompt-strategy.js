/**
 * 
 */

const { SpecProcessor } = require("../../specs/spec-processor");
const { CustomMetadataPromptGenerator, SummaryPromptGenerator } = require("../../prompt-generator");

class NoSufficientInformation extends Error {
    constructor(message) {
      super(message);
      this.name = "NoSufficientInformation";
    }
}

class ComponentStrategy {

    getPrompt() {
        throw new Error('Method not implemented');
    }

    performAction(action, component) {
        throw new Error('Method not implemented');
    }
}

class CustomMetadataPromptStrategy extends ComponentStrategy {

    promptCount = 0;

    constructor() {
        super();
        this.specParser = new SpecProcessor();
    }
    
    setCustomMetadataType(type) {
        this.mdType = type;
    }

    setRecordName(devName) {
        this.devName = devName
    }

    // get to know the intent (action) and high level component the user is talking about.
    getInitialPrompt(query) {
        this.promptCount++;
        const mdataMap = this.specParser.getAllCustomMetadataAsMap();
        return CustomMetadataPromptGenerator.getPromptToMatchAnyMetadataType(
            query,
            mdataMap,
            `{
                "action": {action},
                "componentName": {componentName}
            }`
        );
    }

    getNextPrompt(result, query) {
		switch (result.action) {
			case 'update':
				return this.determineNextPromptForUpdate(result, query);
			case 'delete':
				//return this.determineNextPromptForDelete(result);
                break;
            case 'list':
				//return this.determineNextPromptForList(result);
                break;
            case 'activate':
            case 'inactivate':
                return this.determineNextPromptForRecordState(result, result.action, query);
			default:
				break;
		}
    }

    requiresFurtherAiPrompt(result) {
        if (!result) {
            return false;
        }
        return this.getNextPrompt(result) != null;
    }

    requiresFurtherSfPrompt(isLastTaskSf, result) {
        if (!result) {
            return false;
        }
        if (!isLastTaskSf) { // needs to be a function to determine in detail whether further prompts are required
            return true;
        }
        return false;
    }

    determineNextPromptForUpdate(result, query) {
        const resultObj = JSON.parse(JSON.stringify(result));
        if (resultObj.componentName == undefined) {
            // Model was not able to figure out the component from the list. 
            // So user has to put more matching phrases.
            throw new NoSufficientInformation('Information is not sufficient to parse custom metadata type');
        }
        if (!resultObj.recordName) {
            // TO DO: enhance promptCount to be aware of which prompts are repeated.
            if (this.promptCount > 2) {
                throw new NoSufficientInformation('Information is not sufficient to parse custom metadata record');
            }
            this.promptCount++;
            const recordMap = this.specParser.getCustomMetadataRecordsFor(resultObj.componentName);
            return CustomMetadataPromptGenerator.getPromptToMatchAnyMetadataRecord(
                query,
                JSON.stringify(recordMap),
                `{
                    "recordName": {record.name}
                    "recordData":{"Label":{record.label}}
                }`
            );
        }
        // we have all required information. No more prompts are required
        return null;
    }

    determineNextPromptForRecordState(result, action, query) {
        const resultObj = JSON.parse(JSON.stringify(result));
        if (resultObj.componentName == undefined) {
            // Model was not able to figure out the component from the list. 
            // So user has to put more matching phrases.
            throw new NoSufficientInformation('Information is not sufficient to parse custom metadata type');
        }
        if (!resultObj.recordName) {
            return this.determineNextPromptForUpdate(result, query);
        }
        // we have all required information. No more prompts are required
        return null;
    }

    formatResultforSalesforce(result) {
        const resultObj = {
            action: result.action,
            componentType: 'CustomMetadata',
            componentName: result.componentName,
            recordData: {
                developerName: result.recordName,
            }
        };
        if (result.action == 'activate') {
            resultObj.recordData[this.specParser.getStateFieldFor(result.componentName)] = true;
            resultObj.recordData = {...resultObj.recordData, ...result.recordData};
        } else if (result.action == 'inactivate') {
            resultObj.recordData[this.specParser.getStateFieldFor(result.componentName)] = false;
            resultObj.recordData = {...resultObj.recordData, ...result.recordData};
        } else if (result.action == 'update') {
            resultObj.recordData = {...resultObj.recordData, ...result.recordData};
        }

        return resultObj;
    }
}

class SummaryPromptStrategy extends ComponentStrategy {
    
    promptCount = 0;
    isEndOfChain = false;

    constructor() {
        super();
        this.specParser = new SpecProcessor();
    }

    // get to know the account user is talking about.
    getInitialPrompt(query) {
        this.promptCount++;
        return SummaryPromptGenerator.getPromptToIdentifyAccount(
            query,
            `{
                "name": {name}
            }`
        );
    }

    getSummaryPrompt(name, acts) {
        this.promptCount++;
        this.isEndOfChain = true;
        return SummaryPromptGenerator.getPromptToSummarizeData(
            name,
            JSON.stringify(acts),
            `{
                "summary": {summary}
            }`
        );
    }

    getNextPrompt(result, query) {
        if (result.name && !result.records) {
            return null
        } else if (result.records) {
            return this.getSummaryPrompt(result.name, result.records);
        } else {
            return this.getInitialPrompt(query);
        }
    }

    requiresFurtherAiPrompt(result) {
        if (this.isEndOfChain) {
            return false;
        }
        if (!result.name) {
            return false;
        }
        console.log('dd');
        return this.getNextPrompt(result) != null;
    }

    requiresFurtherSfPrompt(isLastTaskSf, result) {
        if (this.isEndOfChain) {
            return false;
        }
        console.log(result);
        if (!result) {
            return false;
        }
        if (!result.name || !result.searchRecords || !result.records) {
            return true;
        }
        return false;
    }

    formatResultforSalesforce(result) {
        let resultObj;
        console.log(result);
        console.log(result.name);
        if (result.name && !result.searchRecords) {
            console.log('ff');
            console.log(result);
            resultObj = {
                action: 'search',
                query: `FIND {${result.name}} IN NAME FIELDS RETURNING Account(Id) LIMIT 1`,
                name: result.name
            };
            console.log(resultObj);
        } else if (result.name && result.searchRecords[0].Id && !result.records) {
            const actTable = this.specParser.getActivityTableFor('Account');
            resultObj = {...result,
                action: 'query',
                query: `select id, ${actTable.fields.join(',')}  from ${actTable.name} where account__c = '${result.searchRecords[0].Id}' limit 10`
            };
        }
        console.log(resultObj);
        return resultObj;
    }
}
  
class CustomSettingsPromptStrategy extends ComponentStrategy {
    performAction(component) {
      // Logic to perform actions on custom settings
    }
}
  
class CustomObjectPromptStrategy extends ComponentStrategy {
    performAction(component) {
      // Logic to perform actions on custom objects
    }
}

module.exports = {
    CustomMetadataPromptStrategy,
    SummaryPromptStrategy
};
  