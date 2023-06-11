<h1 align="center">ForceGPT: AI Asssitant for Salesforce users</h1>

ForceGPT is tool that harnesses the power of OpenAI's GPT models to seamlessly perform tasks in Salesforce based on natural language user expressions. This tool is capable of executing tasks, generating new tasks based on the results, and dynamically prioritizing them in real-time.

## 🚀 Features
- 🌐 Executes actions on salesforce.
- Dynamic task creation and prioritization.
- Debug Logs.
- Addition of new components support is easy and extensible.

## Use cases
This is in highly prototype phase and currently supports following few use cases: 
1. 🔍 Performs query against salesforce from natural language user input.
2. 💾 Updates custom metadata type and custom fields
3. Deletes Apex debug logs.
4. describes sobject.
5. 🧠 Generates and executes apex. If you can craft a clear question, you can acheive almost anything from here.
<hr/>

## Setup

# OpenAI API Key
1. Get your OpenAI API key from: https://platform.openai.com/account/api-keys.
3. It is strongly recommended to setup a monthly budget.

# Setting up Heroku
Install the application by clicking the button below:

# [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

This will automatically create an app with desired addons and features.

## Heroku App Configuration
1. From your app dashboard, navigate to the settings page.
2. Click 'Reveal Config vars'.
3. Input the API key under OPENAI_API_KEY variable.
4. If you do not want the debug logs to be sent to LLM(ChatGPT), set the BEAUTIFY_DEBUG_LOGS to false.

# Setting up Salesforce
1. Install the unmanaged package - https://login.salesforce.com/packaging/installPackage.apexp?p0=04tDn0000006uR2
2. Update the Named credential.
    1. From setup, navigate to the named credential.
    2. Open 'Force GPT'. This is a legacy one as no authentication is involved.
    3. Edit the endpoint and substitue your heroku app name created in previous step.
3. Navigate to the tab 'ForceGPT'.
4. Enjoy tasking!

<hr/>
<h2 align="center"> 💖 Help Fund ForceGPT's Development 💖</h2>
<p align="center">
    Spare us a coffee! If you'd like to sponsor this project and have your avatar or company logo appear below <a href="https://github.com/sponsors/bsathishciv">click here</a>.
</p>
<hr/>

## Roadmap

V2:
1. Use GPT-4 model for better accuracy.
2. Display user friendly responses in Salesforce UI.
3. Use the LLM to generate tasks.
4. Enrich the NodeJs app to output debug information to salesforce.
5. Memory management and vector search.
6. Utilize full power of LangChain AI
7. Better error handling.

V3:
1. Fine-tune a base model for salesforce specific tasks - all of th above tasks.
<hr/>

## Privacy

1. Any data that is queried from salesforce remain at the tool level and not exposed to the LLM. The debu logs that are summarized as part of Apex execution can be turned down by a setting.
2. User inputs are fed into the LLM.
<hr/>

## ⚠️ Limitations
This is an experimental project that aims to demonstrate the capabilities of LLMs.
1. It currently uses gpt-3.5-turbo, which is not as accurate as GPT-4 model. So if it produces any unexpected result, try asking the same thing again.
2. If the component or command is not supported, then it answers the questions as a general Question Answering.
3. The database model used to store the user query and response has the primary key of salesforce user Id. Hence if multiple users use the same salesforce user to chat with same app, then there will be inconsistencies.
4. DO NOT USE IN PRODUCTION YET.
<hr/>

## 🛡 Disclaimer
This project, ForceGPT, is an experimental application and is provided "as-is" without any warranty, express or implied. By using this software, you agree to assume all risks associated with its use, including but not limited to data loss, system failure, or any other issues that may arise.

The developers and contributors of this project do not accept any responsibility or liability for any losses, damages, or other consequences that may occur as a result of using this software. You are solely responsible for any decisions and actions taken based on the information provided.
<hr/>

## Join us in Maintaining an Open Source Project!

We believe in the power of collaboration and community-driven development. We need your help to ensure this initiative is better maintained.

## Why Contribute?

By contributing to our project, you become an integral part of a vibrant community of developers, designers, and enthusiasts. Here are some reasons why you should get involved:

1. **Make a Meaningful Impact:** Your contributions can have a significant impact on the project's functionality, usability, and overall quality. You can help shape the future of the software and improve it for users worldwide.

2. **Learn and Grow:** Working on an open source project offers valuable learning opportunities. You can gain hands-on experience with cutting-edge technologies, collaborate with skilled individuals, and sharpen your coding, testing, and documentation skills.

3. **Networking and Recognition:** By contributing to our project, you'll connect with like-minded individuals, expand your professional network, and enhance your reputation as a skilled developer. Your contributions will be recognized and appreciated by the community.

4. **Give Back to the Community:** Open source projects thrive on the collective effort of volunteers. Contributing your time and expertise is a way to give back to the community that has provided you with free and open tools and software.

## How to Contribute?

Contributing is easy, and there are many ways to get involved:

1. **Bug Reports and Feature Requests:** Help us improve the project by reporting bugs and suggesting new features. Visit our issue tracker to submit your findings or ideas.

2. **Code Contributions:** Whether you're a beginner or an experienced developer, we welcome code contributions of all sizes. Check out the open issues and pick one that interests you. If you have an idea for an improvement, feel free to submit a pull request.

3. **Documentation:** Clear and comprehensive documentation is crucial for any project's success. Help us improve our documentation by fixing errors, adding examples, or writing new sections.

4. **User Support:** Join our community forum or discussion channels to help answer questions from users, provide guidance, and share your expertise.

5. **Spread the Word:** If you find value in our project, help us reach more people by sharing it on social media, writing blog posts, or presenting it at conferences or meetups.

## Get Started!

Ready to jump in and contribute? Feel free to reach out to us through following platforms:
- Discord - <will be shared soon>
- Email - <will be shared soon>
- Telegram - <will be shared soon>

Thank you for considering joining us in maintaining this open source project. Together, we can create something amazing!

Happy coding!
