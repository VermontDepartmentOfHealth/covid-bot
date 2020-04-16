require('dotenv').config()
const {promises: fs} = require("fs");
const qnaMakerApi = require('@ads-vdh/qnamaker-api');
const GENERATED_FILE_WARNING = "// GENERATED FILE - only update by re-running deployToProd.js - local changes will be wiped out\r\n"
const jsoncParser = require("jsonc-parser");
const chalk = require("chalk");
const successStatus = 204;


module.exports = deployToProd();

async function deployToProd() {

    let targetClient = qnaMakerApi({
        endpoint: process.env.PROD_Endpoint,
        apiKey: process.env.PROD_OcpApimSubscriptionKey,
        kbId: process.env.PROD_kbId
    })

    let sourceClient = qnaMakerApi({
        endpoint: process.env.Endpoint,
        apiKey: process.env.OcpApimSubscriptionKey,
        kbId: process.env.kbId
    })

    console.log("\n" + chalk.blue.bold('Deploying Alterations...'))
    let replaceAlterationsResultMsg = await deployAlterations(sourceClient,targetClient);
    console.log(chalk.blue.bold(replaceAlterationsResultMsg))


    console.log("\n" + chalk.blue.bold('Deploying Knowledgebase...'))  
    let replaceKbWasSuccessful = await replaceKnowledgeBase(sourceClient,targetClient);
    replaceKbResultMsg = replaceKbWasSuccessful ? 'KnowledgeBase Deployed Successfully' : 'Failed to Deploy KnowledgeBase';
    console.log( chalk.blue.bold(replaceKbResultMsg))


    if(replaceKbWasSuccessful){
        console.log("\n" + chalk.blue.bold('Publishing Knowledgebase...'))
        let publishResponse = await targetClient.knowledgeBase.publish();
        let resultMsg = publishResponse.status === successStatus ? 'Knowledgebase Published Successfully' : 'Failed to Publish Knowledgebase';
        console.log(chalk.blue.bold(resultMsg))
    }

}

async function replaceKnowledgeBase(sourceClient,targetClient){
    //download KB from test
    let sourceKnowledgeBase = await sourceClient.knowledgeBase.download();
    //call replace
    let knowledgeBaseReplaceResonse = await targetClient.knowledgeBase.replace(targetClient.kbId, {qnaList: sourceKnowledgeBase.qnaDocuments});
    //return bool to indicate if relace was successful
    return knowledgeBaseReplaceResonse.status === successStatus;
}

async function deployAlterations(sourceClient,targetClient){
    //get alterations from test
    let sourceAlterations = await sourceClient.alterations.get();  
    //call replace
    let replaceAlterationsResponse = await targetClient.alterations.replace(sourceAlterations);
    //return status message 
    return replaceAlterationsResponse.status === successStatus ? 'Alterations Deployed Successfully' : 'Failed to Deploy alterations';
}



