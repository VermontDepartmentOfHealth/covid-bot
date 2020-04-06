require('dotenv').config()
const { promises: fs } = require("fs");
const fetch = require('node-fetch');


module.exports = updateData();

async function updateData() {

    // remove tools directory from current path
    let url = `${process.env.Endpoint}/qnamaker/v4.0/knowledgebases/${process.env.kbId}/${process.env.environment}/qna`

    
    // get data
    let resp = await fetch(url, {
        method: 'get',
        headers: {
            "Ocp-Apim-Subscription-Key": process.env.OcpApimSubscriptionKey
        },
    })
    let knowledgeBase = await resp.json();


    // write data
    let projectRoot = __dirname.replace(/tools$/, "");
    let filePath = `${projectRoot}/_data/faqs.json`;
    let content = JSON.stringify(knowledgeBase, null, 4);

    try {
        await fs.writeFile(filePath, content)
    } catch (error) {
        console.error(error)
    }

    console.log(`Knowlege base data written to ${filePath}`);


}
// C:\Users\kylemit\Documents\Stash\covid-faq\_data\faqs.json
// C:\Users\kylemit\Documents\Stash\covid-faq\tools\_data\faqs.js