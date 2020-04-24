const API_VERSION = "v4.0"
const fetch = require('node-fetch');
const NUMBER_SECONDS_FOR_TIMEOUT = 45;


const METHOD = {
    GET: "get",
    PUT: "put",
    POST: "post",
    DELETE: "delete",
    PATCH: "patch"
}

//test refers to qna editor environment
//prod refers to publised kb
const ENVIRONMENT = {
    TEST: "test",
    PROD: "prod"

}

//operation state types defined here: https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/operations/getdetails
const OPERATION_STATE = {
    FAILED: "Failed",
    NOT_STARTED: "NotStarted",
    RUNNING: "Running",
    SUCCEEDED: "Succeeded"
}

/**
 * QnA Maker API Client Builder
 * @param {object} config 
 * @param {string} config.apiKey   Ocp-Apim-Subscription-Key
 * @param {string} config.endpoint Supported Cognitive Services endpoints 
 * @param {string} [config.kbId]   (Optional) Knowledgebase id
 */
let QnAMakerAPI = function(config) {

    /**
     * Fetch url and return json
     * @param {string} url api url
     * @param {('get'|'post'|'put'|'delete'|'patch')} method http method
     */
    let fetchJson = async function(url, method) {

        try {

            // get data
            let resp = await fetch(url, {
                method: method,
                headers: {
                    "Ocp-Apim-Subscription-Key": config.apiKey
                },
            })

            let obj = await resp.json();
            return obj

        } catch (error) {
            console.error("Error fetching URL: ", url)
            return {}
        }

    }


    /**
     * Fetch url and return json
     * @param {string} url api url
     * @param {('get'|'post'|'put'|'delete'|'patch')} method http method
     * @param {string} [body] (optional) request body
     */
    let sendRequest = async function(url, method, body) {

        // options
        let options = {
            method: method,
            headers: {
                "Ocp-Apim-Subscription-Key": config.apiKey
            },
        }

        // add body if set
        if (body) {
            // https://github.com/node-fetch/node-fetch#post-with-json
            options.headers["Content-Type"] = "application/json"
            options.body = JSON.stringify(body)
        }

        // get data
        let resp = await fetch(url, options)

        return resp

    }


    /**
     * Check kb operation once a second to see if operation state is updated to either a success of failure state
     * @param {string} operationId operation ID
     * @param {number} [secondsWaited] (optional) number of seconds waited already
     * @description Returns details of kb operation https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/operations/getdetails
     */
    let pollForOperationComplete = async function(operationId, secondsWaited) {
        let seconds = secondsWaited || 0

        //success and failure are both completed states
        let completeStates = [OPERATION_STATE.FAILED, OPERATION_STATE.SUCCEEDED]

        //get operation details
        let details = await operations.getDetails(operationId)

        //get operation state
        let operationState = details.operationState;

        //If operation is complete (failure or success), or if operation has timed out, return the current state
        if (completeStates.includes(operationState) || seconds > NUMBER_SECONDS_FOR_TIMEOUT) {

            return operationState;

        } else {
            //if operation is not complete, and it has not timed out, wait a second and then call this method again recursively 
            await sleepForOneSecond() //TODO test this

            return await pollForOperationComplete(operationId, seconds + 1); //todo use incrementor
        }

    }

    //function to delay execution for one second
    let sleepForOneSecond = () => {
        return new Promise(resolve => setTimeout(resolve, 1000))
    }


    let knowledgeBase = {
        /**
         * Download the knowledgebase.
         * @param {string} kbId Knowledgebase id
         * @param {('test'|'prod'))} environment Specifies whether environment is Test or Prod 
         * @description test => kb in qna editor environment 
         *              prod => publised kb
         *              More details here: https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/operations/getdetails
         */
        download: async function(kbId, environment) {
            kbId = kbId || config.kbId
            environment = environment || "prod"

            let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}/${environment}/qna`

            let knowledgeBase = await fetchJson(url, METHOD.GET)

            return knowledgeBase

        },

        /**
         * Gets details of a specific knowledgebase.
         * @param {string} kbId Knowledgebase id
         */
        getDetails: async function(kbId) {
            kbId = kbId || config.kbId

            let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`

            let details = await fetchJson(url, METHOD.GET)

            return details

        },

        /**
         * Gets all knowledgebases for a user.
         */
        listAll: async function() {

            let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases`

            let allKnowledgeBases = await fetchJson(url, METHOD.GET)

            return allKnowledgeBases

        },

        /**
         * Publishes all changes in test index of a knowledgebase to its prod index.
         * @param {string} kbId Returns details of kb operation https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/operations/getdetails
         */
        publish: async function(kbId) {

            kbId = kbId || config.kbId

            let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`

            let response = await sendRequest(url, METHOD.POST)

            return response
        },

        /**
         * Replace knowledgebase contents.
         * @param {string} kbId Knowledgebase id
         * @param {object} body List of Q-A (QnADTO) to be added to the knowledgebase. Q-A Ids are assigned by the service and should be omitted.
         */
        replace: async function(kbId, body) {
            kbId = kbId || config.kbId

            let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`

            let response = await sendRequest(url, METHOD.PUT, body)

            return response

        },

        /**
         * Asynchronous operation to modify a knowledgebase.
         * @param {string} kbId Knowledgebase id
         * @param {object} body request body defined here: https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase/update
         */
        update: async function(kbId, body) {

            kbId = kbId || config.kbId

            let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`

            let response = await sendRequest(url, METHOD.PATCH, body)

            return response

        }
    }

    let alterations = {
        /**
         * Download alterations from runtime.
         */
        get: async function() {

            let url = `${config.endpoint}/qnamaker/${API_VERSION}/alterations`

            let alterations = await fetchJson(url, METHOD.GET)

            return alterations

        },

        /**
         * Replace alterations data.
         * @param {object} body Collection of word alterations.
         */
        replace: async function(body) {

            let url = `${config.endpoint}/qnamaker/${API_VERSION}/alterations`

            let response = await sendRequest(url, METHOD.PUT, body)

            return response

        },
    }

    let operations = {
        /**
         * Get details of a kb operation
         * @param {string} operationId operation ID
         * @description Returns details of kb operation https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/operations/getdetails
         */
        getDetails: async function(operationId) {

            let url = `${config.endpoint}/qnamaker/${API_VERSION}/operations/${operationId}`

            let operationDetails = await fetchJson(url, METHOD.GET)

            return operationDetails

        },
      /**
       * Check kb operation once a second to see if operation state is updated to either a success of failure state
       * @param {string} operationId operation ID
       * @param {number} [secondsWaited] (optional) number of seconds waited already
       * @description Returns details of kb operation https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/operations/getdetails
       */
        pollForOperationComplete: async function(operationId, secondsWaited) {

            let seconds = secondsWaited || 0

            //success and failure are both completed states
            let completeStates = [OPERATION_STATE.FAILED, OPERATION_STATE.SUCCEEDED]
    
            //get operation details
            let detailsResponse = await operations.getDetails(operationId)
            let operationDetailsRetrieved = JSON.stringify(detailsResponse) !== '{}' && !detailsResponse.hasOwnProperty("error")
    
            if(!operationDetailsRetrieved){
                throw "Unable to get operation details";
            }
            //get operation state
            let operationState = detailsResponse.operationState;
    
            //If operation is complete (failure or success), or if operation has timed out, return the current state
            if (completeStates.includes(operationState) || seconds > NUMBER_SECONDS_FOR_TIMEOUT) {
    
                return operationState;
    
            } else {
                //if operation is not complete, and it has not timed out, wait a second and then call this method again recursively 
                await sleepForOneSecond() //TODO test this
    
                return await pollForOperationComplete(operationId, seconds + 1); //todo use incrementor
            }

        }

    }

    // compose client to return
    let client = {
        knowledgeBase,
        alterations,
        operations,
        lookups: {
            METHOD,
            ENVIRONMENT,
            OPERATION_STATE
        },
        config
    }


    // add aliases
    client.kb = client.knowledgeBase
    client.alt = client.alterations
    client.op = client.operations

    return client;

}

module.exports = QnAMakerAPI