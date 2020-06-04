const qnaMakerApi = require('@ads-vdh/qnamaker-api');
const STATUS_SUCCESS = 204;


// get command line args
const { program } = require('commander');
program
    .option('-e, --environment <value>', 'either test or prod', 'test')
    .parse(process.argv);

// load env file
let sourceEnv = require('dotenv').config({ path: `.env.${program.environment}` })

// validate we loaded file correctly
if (sourceEnv.error) {
    console.error("Source Environment file not found: ", sourceEnv.error.path)
    return;
}

module.exports = publishKB();


async function publishKB() {



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