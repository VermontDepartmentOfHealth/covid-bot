let filePath = process.env.AZURE_ENVIRONMENT ? `.env.${process.env.AZURE_ENVIRONMENT}` : ".env"
require('dotenv').config({ path: filePath })
const {promises: fs} = require("fs");
const qnaMakerApi = require('@ads-vdh/qnamaker-api');
const GENERATED_FILE_WARNING = "// GENERATED FILE - only update by re-running restoreTestKb.js - local changes will be wiped out\r\n"
const LOCAL_KB_PARTIAL_FILE_PATH = "_data/faqs.jsonc"
const jsoncParser = require("jsonc-parser")


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
    let localKb = await getCurrentLocalKb();

    //get kb details for test, we need the current kbName
    let knowledgeBaseDetails = await clientFromTest.knowledgeBase.getDetails();

    //create update object by comparing test kb to local kb
    let updateObject = getKbUpdateObject(localKb, currentlyOnTestKB, knowledgeBaseDetails);

    let updateAndPublishResponse = await clientFromTest.marshaling.UpdateAndPublish(process.env.kbId,updateObject);

}

/**
 * Get local knowledgebase
 * @description Returns the kb that is stored locally and used to build the FAQ site
 */
async function getCurrentLocalKb(){
        //let partialPath = "_data/faqs.jsonc";
    
        let projectRoot = __dirname.replace(/tools$/, "");
    
        let fullPath = `${projectRoot}/${LOCAL_KB_PARTIAL_FILE_PATH}`;
    
        let contents = await fs.readFile(fullPath, "utf8");
    
        let currentKB = jsoncParser.parse(contents);
    
        return currentKB;
    }

/**
 * Get update Knowledgebase object that can be passed to kn update api
 * @param {knowledgeBase} localKb object as downloaded https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/download
 * @param {knowledgeBase} decurrentlyOnTestKB object as downloaded https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/download
 * @returns {KnowledgebaseDTO} kbDetails as dowloaded https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/getdetails
 * @description Returns update object built to pass to https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/update
 */
function getKbUpdateObject(localKb, currentlyOnTestKB, kbDetails){
    
    let deletedQnaPairs = getDeletedQnaPairs(localKb, currentlyOnTestKB);

    let addedQnaPairs = getAddedQnaPairs(localKb, currentlyOnTestKB);

    let updatedQnaPairs = getUpdatedQnaPairs(localKb, currentlyOnTestKB);  

    //Build the update objects for within the updateKbObject
    let updateObjectsList = getQnaPairUpdateObjects(updatedQnaPairs,currentlyOnTestKB);

    //build update object that can be sent to api
    let updateKbObject = {
        add: {qnaList: addedQnaPairs},
        delete: {ids: deletedQnaPairs.map(a => a.id)},
        update: {name: kbDetails.name, qnaList : updateObjectsList}
        
    }

    return updateKbObject;
}

//returns qna pairs that ARE on test, but ARE NOT on the local kb
function getDeletedQnaPairs(localKb, currentlyOnTestKB){
    return currentlyOnTestKB.qnaDocuments.filter((elem) => !localKb.qnaDocuments.find(({ id }) => elem.id === id));
}

//returns qna pairs that ARE NOT on test, but ARE on the local kb
function getAddedQnaPairs(localKb, currentlyOnTestKB){
    return localKb.qnaDocuments.filter((elem) => !currentlyOnTestKB.qnaDocuments.find(({ id }) => elem.id === id));
}

//build a list of qna pairs that:
//are in both the local and test kbs and have been changed
function getUpdatedQnaPairs(localKb, currentlyOnTestKB){

    //foreach local qna pair
    return localKb.qnaDocuments.filter(localQnaPair => {

        let hasBeenUpdated = false;
        //look for matching qna id on test
        let testQnaPair = currentlyOnTestKB.qnaDocuments.find(item => item.id === localQnaPair.id);

        //if you can find it compare using stringify, if it is different, add it to the list
        if(testQnaPair){
            const qnaPairStr_local = JSON.stringify(localQnaPair);
            let qnaPairStr_test = JSON.stringify(testQnaPair);
            hasBeenUpdated = qnaPairStr_local !== qnaPairStr_test;
        }
        return hasBeenUpdated;
    }); 

}

//Create collection of update objects for each qna pair that has been updated
function getQnaPairUpdateObjects(updatedQnaPairs,currentlyOnTestKB){

    let updateObjects = [];

    //for each QnA pair that has been updated, find updated elements and use them to build object to 
    updatedQnaPairs.forEach(function(updatedPair){

        //TODO test context updates

        //get corresponding qna pair from test kb
        let qnaPairFromTest = currentlyOnTestKB.qnaDocuments.find(item => {return item.id === updatedPair.id});
        
        //For the next three updated item types, updates will be processed as replacements  (delete and add)

        //Build list of questions for this QnA pair that have been added, and deleted 
        let questionsFromLocalKb = updatedPair.questions;
        let questionsFromTest = qnaPairFromTest.questions;
        let questionsToAdd =  getListOfItemsToAdd(questionsFromLocalKb, questionsFromTest);
        let questionsToDelete = getListOfItemsToDelete(questionsFromLocalKb, questionsFromTest);

        //Build list of meta data items for this QnA pair that have been added, and deleted 
        let metaFromTest = qnaPairFromTest.metadata;
        let metaFromLocalKb = updatedPair.metadata;
        let metaToAdd = getListOfItemsToAdd(metaFromLocalKb, metaFromTest);
        let metaToDelete =  getListOfItemsToDelete(metaFromLocalKb, metaFromTest);

        //Build list of conext prompts for this QnA pair that have been added, and deleted 
        //At the time of writing this we rarely if ever take advantage of this field.    
        let promptsFromTest = qnaPairFromTest.promptsdata;
        let promptsFromLocalKb = updatedPair.promptsdata;
        let promptsToAdd = getListOfItemsToAdd(promptsFromLocalKb, promptsFromTest);
        let promptsToDelete =  getListOfItemsToDelete(promptsFromLocalKb, promptsFromTest)

        //Create the update list element and add it to list 
        updateObjects.push({id: updatedPair.id, 
                            answer: updatedPair.answer, 
                            source: updatedPair.source, 
                            questions: { add: questionsToAdd, 
                                         delete: questionsToDelete},                
                            metadata:  { add: metaToAdd, 
                                         delete: metaToDelete},
                            context:   { isContextOnly: updatedPair.context.isContextOnly,
                                         promptsToAdd: promptsToAdd,   
                                         promptsToDelete: promptsToDelete ? promptsToDelete.map(prompt => prompt.id) : null}                          
       });
   });

   return updateObjects;
}


//if an item is on target and not on source add it to the delete list
function getListOfItemsToAdd(sourceList, targetList){
    //TODO can i just remove this line?
    if(!targetList){return null};

    let itemsToAdd = sourceList.filter(localItems => {

       let thisIsNewItem = !targetList.find(testItem => JSON.stringify(testItem) === JSON.stringify(localItems));

       return thisIsNewItem;
    }); 

    return itemsToAdd || null;
}

//if an item is on source and not on target add it to add list
function getListOfItemsToDelete(sourceList, targetList){
//TODO can i just remove this line?
    if(targetList == null){return null};

    let itemsToDelete = targetList.filter(testitems => {

        let thisItemWasRemoved = !sourceList.find(localItem => JSON.stringify(localItem) === JSON.stringify(testitems));
        
        return thisItemWasRemoved;
    }); 
    return itemsToDelete || null;

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
