/**
 * 
 */

const { SpecProcessor } = require("../../specs/spec-processor");
const { CustomMetadataPromptGenerator } = require("../../prompt-generator");

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

export class CustomMetadataPromptStrategy extends ComponentStrategy {

    promptCount = 0;
    
    setCustomMetadataType(type) {
        this.mdType = type;
    }

    setRecordName(devName) {
        this.devName = devName
    }

    // get to know the intent (action) and high level component the user is talking about.
    getInitialPrompt() {
        promptCount++;
        const mdataMap = SpecProcessor.getAllCustomMetadataAsMap();
        return CustomMetadataPromptGenerator.getPromptToMatchAnyMetadataType(
            mdataMap,
            `{
                action: {action},
                componentName: {componentName}
            }`
        );
    }

    getNextPrompt(result) {
		switch (action) {
			case 'update':
				return this.determineNextPromptForUpdate(result);
			case 'delete':
				//return this.determineNextPromptForDelete(result);
                break;
            case 'list':
				//return this.determineNextPromptForList(result);
                break;
            case 'activate', 'inactivate':
                return this.determineNextPromptForRecordState(result, action);
			default:
				break;
		}
    }

    requiresFurtherPrompt(result) {
        return this.getNextPrompt(result) != null;
    }

    determineNextPromptForUpdate(result) {
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
            promptCount++;
            const recordMap = SpecProcessor.getCustomMetadataRecordsFor(resultObj.componentName);
            return CustomMetadataPromptGenerator.getPromptToMatchAnyMetadataRecord(
                recordMap,
                `{
                    recordName: {recordName}
                }`
            );
        }
        // we have all required information. No more prompts are required
        return null;
    }

    determineNextPromptForRecordState(result, action) {
        const resultObj = JSON.parse(JSON.stringify(result));
        if (resultObj.componentName == undefined) {
            // Model was not able to figure out the component from the list. 
            // So user has to put more matching phrases.
            throw new NoSufficientInformation('Information is not sufficient to parse custom metadata type');
        }
        if (!resultObj.recordName) {
            return this.determineNextPromptForUpdate(result);
        }
        // we have all required information. No more prompts are required
        return null;
    }

    formatResultforSalesforce(result) {
        const resultObj = {
            componentType: 'CustomMetadata',
            componentName: result.componentName,
            recordData: {
                developerName: result.recordName,
            }
        };
        if (result.action == 'activate') {
            resultObj.recordData[SpecParser.getStateFieldFor(result.componentName)] = true;
        } else if (result.action == 'inactivate') {
            resultObj.recordData[SpecParser.getStateFieldFor(result.componentName)] = false;
        } else if (result.action == 'update') {
            resultObj.recordData = {...resultObj.recordData, ...result.recordData};
        }

        return resultObj;
    }
}
  
export class CustomSettingsPromptStrategy extends ComponentStrategy {
    performAction(component) {
      // Logic to perform actions on custom settings
    }
}
  
export class CustomObjectPromptStrategy extends ComponentStrategy {
    performAction(component) {
      // Logic to perform actions on custom objects
    }
}
  