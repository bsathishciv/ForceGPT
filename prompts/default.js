const { PromptTemplate } = require("langchain/prompts");
const { StructuredOutputParser } = require("langchain/output_parsers");

class PromptGenerator {

    static getInitialPrompt(objective) {
        const template = `Act as a salesforce expert having deep knowledge in how to use JSForce to programatically customize salesforce. 
            For the user-query below identify the JSForce command function as illustrated in examples and generate a JSON response in below format.
            Notice that the type is mandatory for all the responses. And the response must be parsable using JSON.parse() with no comments.
            --- Example 1: When user talks about updating any metadata components
            {
                "command": "metadata.create", // represents the JSForce command. It takes the pattern of classname.function name 
                "type": "CustomMetadata"
            }
            ---
            --- Example task 2: When user talks about querying for some record information in salesforce.
            {
                "command": "query", // represents the function to call in the connection object. should be strictly 'query'
                "type": "SObject" // should be strictly SObject
            }
            ---
            if something is possible only in tooling the command should include tooling.<function-name>
            ---
            user-query: "${objective}"
            ---
            Your response must be in JSON with only command attribute and should not contain any other explanations.`;
        console.log(template);
        return template;
    }

    static getDefaultPrompt(objective) {
        return `
            As a salesforce expert, Explain how to acheive user's objective.
            objective: ${objective}
            respond strictly in a JSON format that can be parsed using JSON.parse() as below:
            {
                result: "your response here"
            }
        `;
    }
}

module.exports = {
    PromptGenerator
};
