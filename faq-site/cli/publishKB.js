const qnaMakerApi = require('@ads-vdh/qnamaker-api');
const STATUS_SUCCESS = 204;



module.exports = main;


async function main(environment) {

    // load env file
    let sourceEnv = require('dotenv').config({ path: `.env.${environment}` })

    // validate we loaded file correctly
    if (sourceEnv.error) {
        console.error("Source Environment file not found: ", sourceEnv.error.path)
        return;
    }

    let client = qnaMakerApi({
        endpoint: process.env.Endpoint,
        apiKey: process.env.OcpApimSubscriptionKey,
        kbId: process.env.kbId
    })


    console.log("\n" + 'Publishing Knowledgebase...')
    let publishResponse = await client.knowledgeBase.publish();
    let publishSuccessful = publishResponse.status === STATUS_SUCCESS;
    let publishResultMsg = publishSuccessful ? "Knowledgebase Published Successfully" : "Failed to Publish Knowledgebase";
    console.log(publishResultMsg)


}