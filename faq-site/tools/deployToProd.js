const qnaMakerApi = require('@ads-vdh/qnamaker-api');
const STATUS_SUCCESS = 204;


module.exports = deployToProd();


async function deployToProd() {

    let sourceEnv = require('dotenv').config({ path: ".env.prod" })
    let targetEnv = require('dotenv').config({ path: ".env.test" })

    if (sourceEnv.error) {
        console.error("Source Environment file not found: ", sourceEnv.error.path)
        return;
    }
    if (targetEnv.error) {
        console.error("Target Environment file not found: ", targetEnv.error.path)
        return;
    }

    let sourceClient = qnaMakerApi({
        endpoint: sourceEnv.parsed.Endpoint,
        apiKey: sourceEnv.parsed.OcpApimSubscriptionKey,
        kbId: sourceEnv.parsed.kbId
    })

    let targetClient = qnaMakerApi({
        endpoint: targetEnv.parsed.Endpoint,
        apiKey: targetEnv.parsed.OcpApimSubscriptionKey,
        kbId: targetEnv.parsed.kbId
    })

    console.log('Deploying Alterations...')
    let replaceAlterationsWasSuccessful = await replaceAlterations(sourceClient, targetClient);
    let deployResultMsg = replaceAlterationsWasSuccessful ? "Alterations Deployed Successfully" : "Failed to Deploy Alterations";
    console.log(deployResultMsg)

    console.log("\n" + 'Deploying Knowledgebase...')
    let replaceKbWasSuccessful = await replaceKnowledgeBase(sourceClient, targetClient);
    let replaceResultMsg = replaceKbWasSuccessful ? "KnowledgeBase Deployed Successfully" : "Failed to Deploy KnowledgeBase";
    console.log(replaceResultMsg)

    if (replaceKbWasSuccessful) {
        console.log("\n" + 'Publishing Knowledgebase...')
        let publishResponse = await targetClient.knowledgeBase.publish();
        let publishSuccessful = publishResponse.status === STATUS_SUCCESS;
        let publishResultMsg = publishSuccessful ? "Knowledgebase Published Successfully" : "Failed to Publish Knowledgebase";
        console.log(publishResultMsg)
    }

}

async function replaceAlterations(sourceClient, targetClient) {
    //get alterations from test
    let sourceAlterations = await sourceClient.alterations.get();
    //call replace
    let replaceAlterationsResponse = await targetClient.alterations.replace(sourceAlterations);
    //return status message
    return replaceAlterationsResponse.status === STATUS_SUCCESS;
}

async function replaceKnowledgeBase(sourceClient, targetClient) {
    //download KB from test
    let sourceKnowledgeBase = await sourceClient.knowledgeBase.download();
    let testKbid = targetClient.knowledgeBase.kbId;
    //call replace 
    let knowledgeBaseReplaceResponse = await targetClient.knowledgeBase.replace(0, { qnaList: sourceKnowledgeBase.qnaDocuments });
    //return bool to indicate if replace was successful
    return knowledgeBaseReplaceResponse.status === STATUS_SUCCESS;
}