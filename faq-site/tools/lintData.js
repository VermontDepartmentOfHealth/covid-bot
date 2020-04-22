const fs = require("fs");
const jsoncParser = require("jsonc-parser")
const fetch = require("node-fetch")
const chalk = require("chalk")

const utilities = require('./utilities')



validate()

async function validate() {

    let faqs = await utilities.readJsonc("_data/faqs.jsonc")
    let topics = await utilities.readJsonc("_data/topics.jsonc")
    let topicNames = topics.map(t => t.name)

    let allFaqs = faqs.qnaDocuments

    validateMarkdownUrls(allFaqs)
    await validateUrlsValid(allFaqs)
    validateHasCategory(allFaqs)
    validateInvalidCategory(allFaqs, topicNames)
    validateParseQuestion(allFaqs)

}



function validateMarkdownUrls(allFaqs) {

    let relativeUrls = allFaqs.flatMap(faq => {

        // markdown urls must start with http, mailto, or tel
        //https://regexr.com/52gn1
        let rgx = /\]\(((?!https?:|mailto:|tel:).*?)\)/g
        let relativeUrls = [...faq.answer.matchAll(rgx)].map(ans => ans[1])
        return relativeUrls.map(url => ({ url, question: faq.questions[0] }))

    })

    // print errors if we got em'
    if (relativeUrls.length) {
        console.log("\n\n" + chalk.blue.bold("Markdown url does not start with http"))
        relativeUrls.forEach(x => {
            console.log(chalk.bold("Question: ") + x.question)
            console.log(chalk.bold("URL: ") + x.url + "\n")
        })
    }
}


async function validateUrlsValid(allFaqs) {

    let allUrls = allFaqs.flatMap(faq => {

        // get bare-urls
        // https://regexr.com/52gn4
        let rgx = /(?<!\[)http.*?(?=\)|\s)/g
        let absoluteUrls = [...faq.answer.matchAll(rgx)].map(ans => ans[0])

        return absoluteUrls.map(url => ({ url, question: faq.questions[0] }))

    })

    // test every url
    let fetchUrls = allUrls.map(async x => {
        try {
            let resp = await fetch(x.url)
            return { url: x.url, question: x.question, status: resp.status }
        } catch (error) {
            // https://github.com/node-fetch/node-fetch/pull/598
            //console.error("Error fetching url: ", x.url)
            return { url: x.url, question: x.question, status: 200 }
        }
    })

    let responses = await Promise.all(fetchUrls)

    // check if they don't return 200
    let badResponses = responses.filter(x => x.status !== 200)

    // print errors if we got em'
    if (badResponses.length) {
        console.log("\n\n" + chalk.blue.bold("Bad URL found in Question"))
        badResponses.forEach(x => {
            console.log(chalk.bold("Question: ") + x.question)
            console.log(chalk.bold("URL: ") + x.url + "\n")
        })
    }

}


async function validateHasCategory(allFaqs) {

    let missingQuestions = allFaqs.flatMap(faq => {
        let catMetadata = faq.metadata.find(m => m.name === "category")
        return !catMetadata ? [faq.questions[0]] : [];
    })

    // print errors if we got em'
    if (missingQuestions.length) {
        console.log("\n\n" + chalk.blue.bold("Missing Category Metadata"))
        missingQuestions.forEach(q => {
            console.log(chalk.bold("Question: ") + q)
        })
    }
}


async function validateInvalidCategory(allFaqs, topicNames) {

    // add chitchat to topics
    topicNames.push("chitchat")

    let invalidCategories = allFaqs.flatMap(faq => {
        // get category value
        let catMetadata = faq.metadata.find(m => m.name === "category")
        if (!catMetadata) return []

        // auto update abbreviations
        let fixedCatName = catMetadata.value.replace(/VT/i, "Vermont")

        // check for a match against topics
        let match = topicNames.some(t => utilities.stringsAlphaEqual(t, fixedCatName))
        if (match) return []

        return [{ category: catMetadata.value, question: faq.questions[0] }]
    })

    // print errors if we got em'
    if (invalidCategories.length) {
        console.log("\n\n" + chalk.blue.bold("Metadata Category Invalid"))
        invalidCategories.forEach(x => {
            console.log(chalk.bold("Question: ") + x.question)
            console.log(chalk.bold("Category: ") + x.category + "\n")
        })
    }
}


async function validateParseQuestion(allFaqs) {

    let invalidBoldQuestions = allFaqs.flatMap(faq => {
        // get metadata and kick out if 'chitchat'
        let catMetadata = faq.metadata.find(m => m.name === "category")
        if (!catMetadata || utilities.stringsAlphaEqual("chitchat", catMetadata.value)) return []

        // check if we can parse question text
        let parsedQuestion = utilities.extractQuestion(faq.answer)
        return !parsedQuestion ? [faq.questions[0]] : [];
    })

    // print errors if we got em'
    if (invalidBoldQuestions.length) {
        console.log("\n\n" + chalk.blue.bold("Couldn't parse bold question text"))
        invalidBoldQuestions.forEach(q => {
            console.log(chalk.bold("Question: ") + q)
        })
    }
}