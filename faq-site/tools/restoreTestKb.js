let filePath = process.env.AZURE_ENVIRONMENT ? `.env.${process.env.AZURE_ENVIRONMENT}` : ".env"
require('dotenv').config({ path: filePath })
const { promises: fs } = require("fs");
const qnaMakerApi = require('@ads-vdh/qnamaker-api');
const jsoncParser = require("jsonc-parser")
const utilities = require('./utilities')

const STATUS_ACCEPTED = 202;

// set input file
const LOCAL_KB_PARTIAL_FILE_PATH = "_data/faqs.jsonc"

module.exports = restoreTestKb();

async function restoreTestKb() {

    let clientFromTest = qnaMakerApi({
        endpoint: process.env.Endpoint,
        apiKey: process.env.OcpApimSubscriptionKey,
        kbId: process.env.kbId
    })

    try{

        let currentlyOnTestKB = await getTestKb(clientFromTest);

        let localKb = await getLocalKb();

        //get kb details for test, we need the current kbName
        let knowledgeBaseDetails = await clientFromTest.knowledgeBase.getDetails();

        //create update object by comparing test kb to local kb
        let updateObject = getKbUpdateObject(localKb, currentlyOnTestKB, knowledgeBaseDetails);

        let updatedPairs = updateObject.update.qnaList.context
        let updateResponse = await initiateUpdate(clientFromTest, process.env.kbId, updateObject);

        //get operation id from update response
        let updateJson = await updateResponse.json();   
        let opId = updateJson.operationId;

        await pollForUpdateComplete(clientFromTest, opId)

        publishKb(clientFromTest)

    } catch (error) {
        console.error(error)
        return;
    }
}

async function getTestKb(clientFromTest){
    //get kb base as it currently is on test
    console.log("\n" + 'Downloading test knowledge base...')
    let currentlyOnTestKB = await clientFromTest.knowledgeBase.download();

    let downLoadSuccessful = JSON.stringify(currentlyOnTestKB) !== '{}'

    let errorInfo = "";
    if (currentlyOnTestKB.hasOwnProperty("error")) {
        downLoadSuccessful = false;
        errorInfo = currentlyOnTestKB.error.code;
    }

    if(downLoadSuccessful){
        console.log('Download of test Knowledge base was successful')
    }else{
        let errorMsg = 'Failed to download knowledge base'
        //If we got error info, append it
        errorMsg = errorInfo === "" ? errorMsg : errorMsg + ': ' + errorInfo

        throw errorMsg;
    }
    return currentlyOnTestKB;
}

async function getLocalKb(){
    try {
        console.log("\n" + 'Retrieving local knowledge base...')
        localKb = await utilities.readJsonc(LOCAL_KB_PARTIAL_FILE_PATH)
        console.log('Local knowledge base retrieved')
        return localKb

    } catch (error) {
        throw 'Failed to retrieve local Knowledge base\n' + error
    }

}

async function initiateUpdate(clientFromTest, kbId, updateObject){

    console.log("\n" + 'Initiating update of test knowledge base...')

    let updateResponse = await clientFromTest.knowledgeBase.update(kbId, updateObject)
    if(updateResponse && updateResponse.status === STATUS_ACCEPTED){
        console.log('Update initiated')
        return updateResponse;
    }else{
        throw "Failed to initiate update";
    }
}

async function pollForUpdateComplete(clientFromTest, opId){
    console.log("\n" + 'Polling for completion of update operation...')
    //poll to see when operation is complete

    updateOperationState = await clientFromTest.operations.pollForOperationComplete(opId);
    let updateWasSuccessful = updateOperationState === clientFromTest.lookups.OPERATION_STATE.SUCCEEDED
    if(updateWasSuccessful){
       console.log('Update was successful')
       return;
    }else{
        throw "Update was called but knowledge base was unable to complete operation";
    }
    

}

async function publishKb(clientFromTest){
    console.log("\n" + 'Publishing test knowledge base...')
    let publishResponse = await clientFromTest.knowledgeBase.publish(process.env.kbId)
    let publishWasSuccessful = JSON.stringify(publishResponse) !== '{}' && !publishResponse.hasOwnProperty("error")
    if(publishWasSuccessful){
        console.log('Publish successful')
        return;
    }else{
        throw "Failed to publish"
    }
}

/**
 * Get update Knowledgebase object that can be passed to kn update api
 * @param {knowledgeBase} localKb object as downloaded https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/download
 * @param {knowledgeBase} decurrentlyOnTestKB object as downloaded https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/download
 * @returns {KnowledgebaseDTO} kbDetails as dowloaded https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/getdetails
 * @description Returns update object built to pass to https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/update
 */
function getKbUpdateObject(localKb, currentlyOnTestKB, kbDetails) {

    let deletedQnaPairs = getDeletedQnaPairs(localKb, currentlyOnTestKB);

    let addedQnaPairs = getAddedQnaPairs(localKb, currentlyOnTestKB);

    let updatedQnaPairs = getUpdatedQnaPairs(localKb, currentlyOnTestKB);

    //Build the update objects for within the updateKbObject
    let updateObjectsList = getQnaPairUpdateObjects(updatedQnaPairs, currentlyOnTestKB);

    //build update object that can be sent to api
    let updateKbObject = {
        add: { qnaList: addedQnaPairs },
        delete: { ids: deletedQnaPairs.map(a => a.id) }, 
        update: { name: kbDetails.name, qnaList: updateObjectsList }

    }

    return updateKbObject;
}

//returns qna pairs that ARE on test, but ARE NOT on the local kb
function getDeletedQnaPairs(localKb, currentlyOnTestKB) {
    return currentlyOnTestKB.qnaDocuments.filter((elem) => !localKb.qnaDocuments.find(({ id }) => elem.id === id));
}

//returns qna pairs that ARE NOT on test, but ARE on the local kb
function getAddedQnaPairs(localKb, currentlyOnTestKB) {
    return localKb.qnaDocuments.filter((elem) => !currentlyOnTestKB.qnaDocuments.find(({ id }) => elem.id === id));
}

//build a list of qna pairs that:
//are in both the local and test kbs and have been changed
function getUpdatedQnaPairs(localKb, currentlyOnTestKB) {

    //foreach local qna pair
    return localKb.qnaDocuments.map(localQnaPair => {

        //look for matching qna id on test
        let testQnaPair = currentlyOnTestKB.qnaDocuments.find(item => item.id === localQnaPair.id);

        // return null if we don't even have a match
        if (!testQnaPair) return null;

        //if you can find it compare using stringify, if it is different, add it to the list

        const qnaPairStr_local = JSON.stringify(localQnaPair);
        let qnaPairStr_test = JSON.stringify(testQnaPair);
        let hasBeenUpdated = qnaPairStr_local !== qnaPairStr_test;

        // if not updated, return null
        if (!hasBeenUpdated) return null;

        return {
            id: testQnaPair.id,
            old: testQnaPair,
            new: localQnaPair
        };
    }).filter(x => x);

}

//Create collection of update objects for each qna pair that has been updated
function getQnaPairUpdateObjects(updatedQnaPairs) {


    //for each QnA pair that has been updated, find updated elements and use them to build object to 
    let updateObjects = updatedQnaPairs.map(function(qnaPair) {
        //TODO test context updates

        let qnaPairFromLocalKb = qnaPair.new
        let qnaPairFromTest = qnaPair.old

        //For the next three updated item types, updates will be processed as replacements  (delete and add)

        //Build list of questions for this QnA pair that have been added, and deleted 
        let questionsFromLocalKb = qnaPairFromLocalKb.questions;
        let questionsFromTest = qnaPairFromTest.questions;
        let questionsToAdd = getListOfItemsToAdd(questionsFromLocalKb, questionsFromTest);
        let questionsToDelete = getListOfItemsToDelete(questionsFromLocalKb, questionsFromTest);

        //Build list of meta data items for this QnA pair that have been added, and deleted 
        let metaFromTest = qnaPairFromTest.metadata;
        let metaFromLocalKb = qnaPairFromLocalKb.metadata;
        let metaToAdd = getListOfItemsToAdd(metaFromLocalKb, metaFromTest);
        let metaToDelete = getListOfItemsToDelete(metaFromLocalKb, metaFromTest);

        //Build list of conext prompts for this QnA pair that have been added, and deleted 
        //At the time of writing this we rarely if ever take advantage of this field.    
        let promptsFromTest = qnaPairFromTest.context.prompts; // TODO: check promptsdata
        let promptsFromLocalKb = qnaPairFromLocalKb.context.prompts; // TODO: check promptsdata
        let promptsToAdd = getListOfItemsToAdd(promptsFromLocalKb, promptsFromTest);
        let promptsToDelete = getListOfItemsToDelete(promptsFromLocalKb, promptsFromTest)

        let updateObject = {
            id: qnaPair.id,
            answer: qnaPairFromLocalKb.answer,
            source: qnaPairFromLocalKb.source,
            questions: {
                add: questionsToAdd,
                delete: questionsToDelete
            },
            metadata: {
                add: metaToAdd,
                delete: metaToDelete
            },
            context: {
                isContextOnly: qnaPairFromLocalKb.context.isContextOnly,
                promptsToAdd: promptsToAdd, // todo potentially map array to include "qna": null on each item
                promptsToDelete: promptsToDelete.map(prompt => prompt.id) //I think everything here is right except the way I'm getting the ID to delete
            }
        }

        return updateObject
    });

    return updateObjects;
}


//if an item is on target and not on source add it to the delete list
function getListOfItemsToAdd(sourceList, targetList) {
    let itemsToAdd = sourceList.filter(sourceItem => {

        let thisIsNewItem = !targetList.find(targetItem => JSON.stringify(targetItem) === JSON.stringify(sourceItem));

        return thisIsNewItem;
    });

    return itemsToAdd;
}

//if an item is on source and not on target add it to add list
function getListOfItemsToDelete(sourceList, targetList) {
    let itemsToDelete = targetList.filter(targetItem => {

        let thisItemWasRemoved = !sourceList.find(sourceItem => JSON.stringify(sourceItem) === JSON.stringify(targetItem));

        return thisItemWasRemoved;
    });
    return itemsToDelete;

}