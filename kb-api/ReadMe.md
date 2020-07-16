---
title: QnA Maker API
permalink: /kb-api/
---

# QnA Maker API

## Setup

1. Download and Install [Postman](https://www.postman.com/)
2. Import Collection `QnA Maker API.postman_collection.json`

   ![import collection](https://i.imgur.com/1TY2ZJo.png)

3. Import Environment `QnA Maker Variables.postman_environment.json`

   ![import environment](https://i.imgur.com/5zzcwh8.png)

4. Add variables to your empty environment template

## Variables


* Runtime API
  * **`RuntimeEndpoint`**: `https://sov-covid-bot.azurewebsites.net`
  * **`RuntimeApiKey`**: `***`
* KB API
  * **`Endpoint`**: `https://sov-covid-bot.cognitiveservices.azure.com`
  * **`Ocp-Apim-Subscription-Key`**: `***`
* Settings
  * **`kbId`**: `***`
  * **`environment`**: `prod`

You can get the QnA Maker Runtime API endpoints by going to your Azure > Cognitive Services > Keys & Endpoints

![Cognitive Services > Keys & Endpoints](https://i.imgur.com/s3xOTiW.png)

You can get the QnA Maker API endpoints by going to [www.qnamaker.ai/](https://www.qnamaker.ai/Home/MyServices), Pick your knowledge base, Go to Settings, and going to Deployment Details.  Or, if you've already built a bot, by going to Azure > Web App Bot > Configuration, and grabbing the QnA keys.

![QnA Maker > KB > Settings > Deployment Details](https://i.imgur.com/gS6whbm.png)

![Web App Bot > Configuration > QnA Keys](https://i.imgur.com/3fsPNHb.png)


## Docs - [Cognitive Services API](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/)

* **QnA Maker Runtime**
  * [Runtime](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamakerruntime/runtime)
* **QnA Maker**
  * [Knowledgebase](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase)
  * [Alterations](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/alterations)


## Further Reading

* [QnA Maker Postman Collection-Template now available](https://bisser.io/qna-maker-postman-collection-template-now-available/)
* [HTTP 401 Access Denied when calling Azure Cognitive Services APIs](https://blogs.msdn.microsoft.com/kwill/2017/05/17/http-401-access-denied-when-calling-azure-cognitive-services-apis/)
* [Quickstart: Get an answer from knowledge base](https://docs.microsoft.com/en-us/azure/cognitive-services/qnamaker/quickstarts/get-answer-from-knowledge-base-using-url-tool?pivots=url-test-tool-postman)
* [Alterations – A Hidden Gem In QnA Maker](https://www.datafish.eu/article/alterations-a-hidden-gem-in-qnamaker/)
