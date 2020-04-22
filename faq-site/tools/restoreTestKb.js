let filePath = process.env.AZURE_ENVIRONMENT ? `.env.${process.env.AZURE_ENVIRONMENT}` : ".env"
require('dotenv').config({ path: filePath })
const { promises: fs } = require("fs");
const qnaMakerApi = require('@ads-vdh/qnamaker-api');
const jsoncParser = require("jsonc-parser")
const utilities = require('./utilities')

// set input file
const LOCAL_KB_PARTIAL_FILE_PATH = "_data/faqs.jsonc"

module.exports = restoreTestKb();

async function restoreTestKb() {

    let clientFromTest = qnaMakerApi({
        endpoint: process.env.Endpoint,
        apiKey: process.env.OcpApimSubscriptionKey,
        kbId: process.env.kbId
    })

    //get kb base as it currently is on test
    let currentlyOnTestKB = await clientFromTest.knowledgeBase.download();

    //get local kb
    let localKb = await utilities.readJsonc(LOCAL_KB_PARTIAL_FILE_PATH)

    //get kb details for test, we need the current kbName
    let knowledgeBaseDetails = await clientFromTest.knowledgeBase.getDetails();

    //create update object by comparing test kb to local kb
    let updateObject = getKbUpdateObject(localKb, currentlyOnTestKB, knowledgeBaseDetails);

    let updateAndPublishResponse = await clientFromTest.marshaling.updateAndPublish(process.env.kbId, updateObject);

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

        let hasBeenUpdated = false;
        //look for matching qna id on test
        let testQnaPair = currentlyOnTestKB.qnaDocuments.find(item => item.id === localQnaPair.id);

        // return null if we don't even have a match
        if (!testQnaPair) return null;

        //if you can find it compare using stringify, if it is different, add it to the list

        const qnaPairStr_local = JSON.stringify(localQnaPair);
        let qnaPairStr_test = JSON.stringify(testQnaPair);
        hasBeenUpdated = qnaPairStr_local !== qnaPairStr_test;

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

    let updateObjects = [];

    //for each QnA pair that has been updated, find updated elements and use them to build object to 
    updatedQnaPairs.forEach(function(qnaPair) {
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
                promptsToDelete: promptsToDelete.map(prompt => prompt.id)
            }
        }

        //Create the update list element and add it to list 
        updateObjects.push(updateObject);
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




// async function getCurrentLocalKb(){
//     let partialPath = "_data/faqs.jsonc";
//     let projectRoot = __dirname.replace(/tools$/, "");
//     let fullPath = `${projectRoot}/${partialPath}`;
//     let contents = await fs.readFile(fullPath, "utf8");
//     let currentKB = jsoncParser.parse(contents);
//     return currentKB;
// }

// //TODO remove when development complete, Method saves generated update object locally for inspection
// async function saveUpdateJson(updateobject){

//     let contents = JSON.stringify(updateobject, null, 4);

//     //await utilities.writeFile("_data/updateObject.jsonc", {test: "yup"});
//     await writeFile("_data/updateObject.jsonc", contents);
// }

// async function writeFile(path, contents) {

//     let projectRoot = __dirname.replace(/tools$/, "");
//     let fullPath = `${projectRoot}/${path}`;

//     try {
//         await fs.writeFile(fullPath, GENERATED_FILE_WARNING + contents)

//         console.log(`Data has been written to ${path}`);

//     } catch (error) {
//         console.error(error)
//     }
// }