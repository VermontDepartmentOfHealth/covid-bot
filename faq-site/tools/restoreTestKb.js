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

        //create update object by comparing test kb to local kb
        let updateObjectCreationResult = await compareLocalToTestAndCreateUpdateResult(clientFromTest);

        let updateObject = updateObjectCreationResult.updateKbObject

        //updates to follow up prompts require a two part update process
        if(updateObjectCreationResult.promptHasBeenUpdated){

            await updateOneOfTwo(clientFromTest, process.env.kbId, updateObject);

            //This update object is created by comparing the kb on test that has already been updated by step one to the local kb.
            //Only updated prompts that were deleted as part one will be included in this updated object, as prompt additions
            updateResultForStepTwo = await compareLocalToTestAndCreateUpdateResult(clientFromTest)
            updateObject = updateResultForStepTwo.updateKbObject;
        }

        let updateResponse = await initiateUpdate(clientFromTest, process.env.kbId, updateObject);

        //get operation id from update response
        let updateJson = await updateResponse.json();
        let opId = updateJson.operationId;

        await pollForUpdateComplete(clientFromTest, opId)

        await publishKb(clientFromTest)

    } catch (error) {
        console.error(error)
        return;
    }
}

//updateResult returned by this function will include the update object and
//a flag that indicates if a multi part update is requried
async function compareLocalToTestAndCreateUpdateResult(clientFromTest){
    let currentlyOnTestKB = await getTestKb(clientFromTest);

    let localKb = await getLocalKb();

    //get kb details for test, we need the current kbName
    let knowledgeBaseDetails = await clientFromTest.knowledgeBase.getDetails();

    // //create update object by comparing test kb to local kb
    let updateResponse = getKbUpdateResult(localKb, currentlyOnTestKB, knowledgeBaseDetails);

    return updateResponse;
}

//prompt updates require a multi part update process
//prompts are updated as an add and delete, this cannot be done in a single update, the update object
//will not include the prompt additions for updated prompts in the first update.
//The second phase of the update will only include prompt additions for updated prompts.
async function updateOneOfTwo(clientFromTest, kbId, updateObject){

    console.log("\n" + 'Update includes changes to existing follow up prompts.')
    console.log('These types of updates must be handled in a two step process, starting the first update now...')

    let updateResponse = await initiateUpdate(clientFromTest, kbId, updateObject);
    let updateJson = await updateResponse.json();
    let opId = updateJson.operationId;

    await pollForUpdateComplete(clientFromTest, opId)
    //publish is not needed as part of first update

    //updateResponse = await compareLocalToTestAndCreateUpdateResult(clientFromTest)
    console.log('Step one update complete')
    return updateResponse;

}

async function getTestKb(clientFromTest){

    console.log("\n" + 'Downloading test knowledge base...')
    //get kb base as it currently is on test
    //passing the 'TEST' lookup  means that the kb returned will reflect what is currently in editor rather than what is published.
    let currentlyOnTestKB = await clientFromTest.knowledgeBase.download(undefined, clientFromTest.lookups.ENVIRONMENT.TEST);

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

//Get kb from local json file, path defined at top of this file
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

//Call update api, this will only kick off the update process, it will take a
//significant amount of time for the kb to complete the update
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

//Check update operation for completion once a second until it's done or timed out
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
 * @param {knowledgeBase} currentlyOnTestKB object as downloaded https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/download
 * @param {KnowledgebaseDTO} kbDetails as dowloaded https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/getdetails
 * @description Returns result that includes update object built to pass to https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/update
 * if promptHasBeenUpdated then a two step operation will be required, and this update object will not include all updates
 */
function getKbUpdateResult(localKb, currentlyOnTestKB, kbDetails) {

    let deletedQnaPairs = getDeletedQnaPairs(localKb, currentlyOnTestKB);

    let addedQnaPairs = getAddedQnaPairs(localKb, currentlyOnTestKB);

    let updatedQnaPairs = getUpdatedQnaPairs(localKb, currentlyOnTestKB);

    //Build the update objects for within the updateKbObject
    let updateObjectListResult = getQnaPairUpdateObjectsResult(updatedQnaPairs, currentlyOnTestKB);
    let updateObjectsList = updateObjectListResult.updateObjList;


    //build update object that can be sent to api
    let updateKbObject = {
        add: { qnaList: addedQnaPairs },
        delete: { ids: deletedQnaPairs.map(a => a.id) },
        update: { name: kbDetails.name, qnaList: updateObjectsList },
    }

    let updateEvalObjectResult = {
        updateKbObject: updateKbObject,
        promptHasBeenUpdated : updateObjectListResult.promptsHaveBeenUpdated
    }

    return updateEvalObjectResult;
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
function getQnaPairUpdateObjectsResult(updatedQnaPairs) {

    let promptHasBeenUpdated = false;
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
        let promptsFromTest = qnaPairFromTest.context.prompts;
        let promptsFromLocalKb = qnaPairFromLocalKb.context.prompts;
        let promptsToAdd = getListOfItemsToAdd(promptsFromLocalKb, promptsFromTest);
        let promptsToDelete = getListOfItemsToDelete(promptsFromLocalKb, promptsFromTest)
        //updated prompts must be processed as a delete and an add but the kb is not able to do this in a single update
        //when an prompt is updated it will be deleted, then a second comparison will be made between the local kb and the test
        //kb and the updated prompt will be processed as an add.
        let promptsNotUpdated = promptsToAdd.filter((elem) => !promptsToDelete.find(({ id }) => elem.id === id))
        promptHasBeenUpdated = !(promptsNotUpdated.length === promptsToAdd.length)
        promptsToAdd = promptsNotUpdated;

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
                promptsToAdd: promptsToAdd,
                promptsToDelete: promptsToDelete.map(prompt => prompt.qnaId)
            }
        }

        return updateObject
    });

    let UpdateObjectWithPromptUpdateFlag = {
        updateObjList: updateObjects,
        promptsHaveBeenUpdated: promptHasBeenUpdated  //Flag that indicates if a two part update is required
    }

    //return updateObjects;
    return UpdateObjectWithPromptUpdateFlag;
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