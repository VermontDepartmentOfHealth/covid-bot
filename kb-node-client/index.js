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

                let url = `${config.endpoint}/qnamaker/${API_VERSION}/knowledgebases/${kbId}`

                let response = await sendRequest(url, METHOD.PATCH, body)

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