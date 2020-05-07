const fs = require("fs");
const jsoncParser = require("jsonc-parser")
const fetch = require("node-fetch")
const chalk = require("chalk")

const utilities = require('./utilities')

// run main code block
main()


async function main() {

    let faqsPrev = await utilities.readJsonc("_data/faqs-prev.jsonc")
    let faqsCur = await utilities.readJsonc("_data/faqs.jsonc")


    listChanges(faqsCur.qnaDocuments, faqsPrev.qnaDocuments)

}


function listChanges(allFaqsCur, allFaqsPrev) {

    let transformFaqData = faqs => {
        return faqs.map(faq => {
            return {
                id: faq.id,
                question: utilities.extractQuestion(faq.answer)
            }
        }).filter(x => x.question)
    }

    let curFaqs = transformFaqData(allFaqsCur)
    let prevFaqs = transformFaqData(allFaqsPrev)

    let delFaqs = prevFaqs.filter(p => !curFaqs.some(c => c.id == p.id))
    let newFaqs = curFaqs.filter(c => !prevFaqs.some(p => p.id == c.id))

    let updatedFaqs = prevFaqs.reduce((acc, prev) => {
        let cur = curFaqs.find(cur => cur.id === prev.id)

        if (cur && utilities.removeWhitespace(cur.question) != utilities.removeWhitespace(prev.question)) {
            acc.push({
                id: cur.id,
                prevQuestion: prev.question,
                curQuestion: cur.question
            })
        }

        return acc;
    }, [])


    console.log("\n" + chalk.blue.bold("Daily Update Checklist"))

    // print errors if we got em'
    if (delFaqs.length) {
        console.log("\n\n" + chalk.red.bold("Deleted Questions"))
        delFaqs.forEach(x => {
            console.log(chalk.red.bold("- ") + x.question)
        })
    }

    if (newFaqs.length) {
        console.log("\n\n" + chalk.green.bold("Added Questions"))
        newFaqs.forEach(x => {
            console.log(chalk.green.bold("+ ") + x.question)
        })
    }

    if (updatedFaqs.length) {
        console.log("\n\n" + chalk.yellow.bold("Updated Question Titles"))
        updatedFaqs.forEach(x => {
            console.log(chalk.yellow.bold("• ") + x.prevQuestion)
            console.log("🡒 " + x.curQuestion + "\n")
        })
    }

    // add bottom spacing if we need it
    if (delFaqs.length || newFaqs.length || updatedFaqs.length) {
        console.log("\n")
    }

}