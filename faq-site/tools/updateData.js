require('dotenv').config()
const {promises: fs} = require("fs");
const qnaMakerApi = require('@ads-vdh/qnamaker-api');


module.exports = updateData();

async function updateData() {

    let client = qnaMakerApi({
        endpoint: process.env.Endpoint,
        apiKey: process.env.OcpApimSubscriptionKey,
        kbId: process.env.kbId
    })

    let knowledgeBase = await client.knowledgeBase.download()

    // write data
    let projectRoot = __dirname.replace(/tools$/, "");
    let filePath = `${projectRoot}/_data/faqs.json`;
    let content = JSON.stringify(knowledgeBase, null, 4);

    try {
        await fs.writeFile(filePath, content)
    } catch (error) {
        console.error(error)
    }

    console.log(`Knowledge base data written to ${filePath}`);

}