Provides a NodeJS client wrapper around the [Cognitive Services APIs](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/) for QnaMaker

- [KnowledgeBase](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/knowledgebase)
- [Alterations](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamaker/alterations)

## Installation

Install [on npm](https://www.npmjs.com/package/@ads-vdh/qnamaker-api)

```bash
npm install @ads-vdh/qnamaker-api --save
```

## Usage

### Initialize the Client:

```js
let qnaMakerApi = require("@ads-vdh/qnamaker-api");

let client = qnaMakerApi({
  endpoint: endpoint,
  apiKey: ocpApimSubscriptionKey,
  kbId: kbId, // optional (sets default for each method)
});
```

### Knowledge Base Methods:

```js
let knowledgeBase = await client.knowledgeBase.download(kbId);
let kbDetails = await client.knowledgeBase.getDetails(kbId);
let knowledgeBases = await client.knowledgeBase.listAll();



await client.knowledgeBase.publish(kbId);
await client.knowledgeBase.replace(kbId, qnaList);
```

#### qnaUpdates parameter is a modified qna list:
```js
await client.knowledgeBase.update(kbId, qnaUpdates);
```

### Alterations Methods:

```js
let alterations = await client.alterations.get();
await client.alterations.replace(alterations);
```

### Operations Methods:

```js
await client.operations.getDetails(operationId);
```
```js
await client.operations.pollForOperationComplete(operationId);
```

## Recommendations

Store your environment variables in a file named `.env` that looks something like this:

```ini
Endpoint=https://***.cognitiveservices.azure.com
kbId=***
OcpApimSubscriptionKey=***
```

Then use the [`dot-env`](https://www.npmjs.com/package/dotenv) package to read them in like this:

```js
require("dotenv").config();
```

which should then make the environment variables available like this:

```js
let client = qnaMakerApi({
  endpoint: process.env.Endpoint,
  apiKey: process.env.OcpApimSubscriptionKey,
  kbId: process.env.kbId,
});
```
