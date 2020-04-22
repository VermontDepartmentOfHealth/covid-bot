const API_VERSION = "v4.0"
const fetch = require('node-fetch');


const METHOD = {
    GET: "get",
    PUT: "put",
    POST: "post",
    DELETE: "delete",
    PATCH: "patch"
}

const ENVIRONMENT = {
    TEST: "test",
    PROD: "prod"

}

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

    
    let kbUpdate = async function(kbId, body, endpoint) {

        //I don't think we have a config any more out here, but we did from 
        //where this is called
        //kbId = kbId || config.kbId

        let url = `${endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`
        //let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`

        let response = await sendRequest(url, METHOD.PATCH, body)

        return response

    }

    let getOperationDetails = async function(operationId, endpoint) {

        let url = `${config.endpoint}/qnamaker/${API_VERSION}/operations/${operationId}`

        let operationDetails = await fetchJson(url, METHOD.GET)

        return operationDetails

    }

    let publishKb = async function(kbId) {

        kbId = kbId || config.kbId

        let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`

        let response = await sendRequest(url, METHOD.POST)

        return response

    }

    let pollForOperationComplete = async function(operationId, secondsWaited) {
        let seconds = secondsWaited || 0

        let completeStates = [OPERATION_STATE.FAILED, OPERATION_STATE.SUCCEEDED]

        let details = await getOperationDetails(operationId, config.endpoint)

        let operationState = details.operationState;

        //failure is also done, 
        //or number of seconds is more than 45 TODO don't hardcode time out
        if (completeStates.includes(operationState) || seconds > 45){
            //then publish
            return operationState;
        }else {
            sleep(1000)
            return await pollForOperationComplete(operationId, seconds + 1);
        }

        let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`

        let response = await sendRequest(url, METHOD.POST)

        return response

    }

    let sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }

    let client = {
        knowledgeBase: {
            /**
             * Download the knowledgebase.
             * @param {string} kbId Knowledgebase id
             * @param {('test'|'prod'))} environment Specifies whether environment is Test or Prod
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
             * @param {string} kbId Knowledgebase id
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
             * @param {object} body List of Q-A (QnADTO) to be added to the knowledgebase. Q-A Ids are assigned by the service and should be omitted.
             */
            update: async function(kbId, body) {
                kbId = kbId || config.kbId

                let response = await kbUpdate(kbId, body, config.endpoint)

                // let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`

                // let response = await sendRequest(url, METHOD.PATCH, body)

                return response

            },
        },
        alterations: {
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
        },
        marshaling: {
            UpdateAndPublish: async function(kbId, body) {

                kbId = kbId || config.kbId
                let updateResponse = await kbUpdate(kbId,body,config.endpoint)

            
                let updateJson = await updateResponse.json();
                let opId = updateJson.operationId;
                let state = updateJson.operationState
                let updateOperationStatus = await pollForOperationComplete(opId);
                let operationDetails = await getOperationDetails(opId)
                state = operationDetails.operationState;
                if (state === "Succeeded"){
                    //then publish
                    return publishResponse = await publishKb(kbId)
                }
                return false;
            }
        },
        lookups: {
            METHOD,
            ENVIRONMENT
        }
    }

    // add aliases
    client.alt = client.alterations
    client.kb = client.knowledgeBase

    return client;

}

module.exports = QnAMakerAPI