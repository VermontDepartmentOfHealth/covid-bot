const fetch = require("node-fetch")
const chalk = require("chalk")

const utilities = require('../util/utilities')

// run main code block
validate()


async function validate() {

    let faqs = await utilities.readJsonc("_data/faqs.jsonc")
    let topics = await utilities.readJsonc("_data/topics.jsonc")
    let topicNames = topics.map(t => t.name)

    let allFaqs = faqs.qnaDocuments


    validateMarkdownUrls(allFaqs)
    validateParagraphsInList(allFaqs)
    validateAddedFollowUpPrompt(allFaqs)
    validateHasCategory(allFaqs)
    validateInvalidCategory(allFaqs, topicNames)
    validateParseQuestion(allFaqs)
    await validateUrlsValid(allFaqs)

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

function validateParagraphsInList(allFaqs) {

    let paragraphsInList = allFaqs.flatMap(faq => {

        // find paragraphs in list
        // https://regexr.com/538ng
        let rgx = /(?<=\n\n\* .*)\n\n(?!\*)(.*)(?=\n\n\* )/g
        let paragraphs = [...faq.answer.matchAll(rgx)].map(ans => ans[1])
        return paragraphs.map(text => ({ text, question: faq.questions[0] }))

    })


    // remove false positives
    let exemptions = [
        "Some people should never wear a mask, including",
        " **If you will be tested to determine",
        "Some people should never wear a cloth face",
        "Vermonters should follow health and safety precautions"
    ]

    paragraphsInList = paragraphsInList.filter(x => !x.text.startsWithAny(exemptions))

    // print errors if we got em'
    if (paragraphsInList.length) {
        console.log("\n\n" + chalk.blue.bold("Possible Paragraph in list"))
        paragraphsInList.forEach(x => {
            console.log(chalk.bold("Question: ") + x.question)
            console.log(chalk.bold("Text: ") + x.text.split(" ").slice(0, 8).join(" ") + "\n")
        })
    }

}


async function validateUrlsValid(allFaqs) {

    let allUrls = allFaqs.flatMap(faq => {

        // find all urls inside md or bare
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
    let badResponses = responses.filter(x => x.status !== 200) //304

    // print errors if we got em'
    if (badResponses.length) {
        console.log("\n\n" + chalk.blue.bold("Bad URL found in Question"))
        badResponses.forEach(x => {
            console.log(chalk.bold("Question: ") + x.question)
            console.log(chalk.bold("URL: ") + x.url + "\n")
        })
    }

}


async function validateAddedFollowUpPrompt(allFaqs) {

    // find "this did not answer my question"
    let noAnswerFAQ = allFaqs.find(faq => faq.answer.startsWith("Sorry we could not find a good match")) // 4533

    let displayText = "This did NOT answer my question."

    // remove false positives
    let exemptions = ["This did NOT answer my question"]
    allFaqs = allFaqs.filter(x => !x.questions[0].startsWithAny(exemptions))


    // make sure it exists and has correct copy
    let promptProblems = allFaqs.reduce((acc, faq) => {
        let noAnswerPrompt = faq.context.prompts.find(p => p.qnaId === noAnswerFAQ.id)

        if (!noAnswerPrompt) {
            acc.missing.push(faq.questions[0])
        } else if (noAnswerPrompt.displayText.trim() !== displayText.trim()) {
            acc.wrong.push({ prompt: noAnswerPrompt.displayText, q: faq.questions[0] })
        }

        return acc;
    }, { missing: [], wrong: [] })

    // print errors if we got em'
    if (promptProblems.missing.length) {
        console.log("\n\n" + chalk.blue.bold("Question Missing Follow Up Prompt"))
        promptProblems.missing.forEach(q => {
            console.log(chalk.bold("Question: ") + q)
        })
    }
    if (promptProblems.wrong.length) {
        console.log("\n\n" + chalk.blue.bold("Follow Up Prompt has wrong Text"))
        promptProblems.wrong.forEach(x => {
            console.log(chalk.bold("Question: ") + x.q)
            console.log(chalk.bold("Prompt: ") + x.prompt + "\n")
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


if (!String.prototype.startsWithAny) {
    Object.defineProperty(String.prototype, 'startsWithAny', {
        value: function(searchStrings) {
            return searchStrings.some(search => this.startsWith(search))
        }
    });
}