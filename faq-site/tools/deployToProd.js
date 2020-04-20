require('dotenv').config()
const qnaMakerApi = require('@ads-vdh/qnamaker-api');
const SUCCESS_STATUS = 204;

module.exports = deployToProd();

async function deployToProd() {

    let targetClient = qnaMakerApi({
        endpoint: process.env.PROD_Endpoint,
        apiKey: process.env.PROD_OcpApimSubscriptionKey,
        kbId: process.env.PROD_kbId
    })

    let targetKbid = process.env.PROD_kbId;

    let sourceClient = qnaMakerApi({
        endpoint: process.env.Endpoint,
        apiKey: process.env.OcpApimSubscriptionKey,
        kbId: process.env.kbId
    })

    console.log('Deploying Alterations...')
    let replaceAlterationsWasSuccessful = await deployAlterations(sourceClient, targetClient);
    let deployResultMsg = replaceAlterationsWasSuccessful ? "Alterations Deployed Successfully" : "Failed to Deploy alterations";
    console.log(deployResultMsg)

    console.log("\n" + 'Deploying Knowledgebase...')
    let replaceKbWasSuccessful = await replaceKnowledgeBase(sourceClient, targetClient, targetKbid);
    let replaceResultMsg = replaceKbWasSuccessful ? "KnowledgeBase Deployed Successfully" : "Failed to Deploy KnowledgeBase";
    console.log(replaceResultMsg)

    if(replaceKbWasSuccessful){
        console.log("\n" + 'Publishing Knowledgebase...')
        let publishResponse = await targetClient.knowledgeBase.publish();
        let publishSuccessful = publishResponse.status === SUCCESS_STATUS;
        let publishResultMsg = publishSuccessful ? "Knowledgebase Published Successfully" : "Failed to Publish Knowledgebase";
        console.log(publishResultMsg)
    }

}


async function deployAlterations(sourceClient,targetClient){
    //get alterations from test
    let sourceAlterations = await sourceClient.alterations.get();
    //call replace
    let replaceAlterationsResponse = await targetClient.alterations.replace(sourceAlterations);
    //return status message
    return replaceAlterationsResponse.status === SUCCESS_STATUS;
}

async function replaceKnowledgeBase(sourceClient,targetClient, targetKbId){
    //download KB from test
    let sourceKnowledgeBase = await sourceClient.knowledgeBase.download();
    let testKbid = targetClient.knowledgeBase.kbId;
    //call replace 
    let knowledgeBaseReplaceResonse = await targetClient.knowledgeBase.replace(targetKbId, {qnaList: sourceKnowledgeBase.qnaDocuments});
    //return bool to indicate if relace was successful
    return knowledgeBaseReplaceResonse.status === SUCCESS_STATUS;
}
