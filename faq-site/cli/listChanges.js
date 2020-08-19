const chalk = require("chalk")
const utilities = require('../util/utilities')


module.exports = main

async function main() {

    //let faqsPrev = await utilities.readJsonc("_data/faqs-prev.jsonc")
     let revisions = await utilities.readJsonc("_data/revisions.jsonc")
     let faqsCur = await utilities.readJsonc("_data/faqs.jsonc")

    // //listChanges(faqsCur.qnaDocuments, faqsPrev.qnaDocuments)
    listRevisions(faqsCur.qnaDocuments, revisions)
}

function listRevisions(allFaqsCur, revisions) {

    // let transformFaqData = faqs => {
    //     return faqs.map(faq => {
    //         return {
    //             id: faq.id,
    //             question: utilities.extractQuestion(faq.answer)
    //         }
    //     }).filter(x => x.question)
    // }

    // let curFaqs = transformFaqData(allFaqsCur)

    //Get simplified version of current faqs
    let curFaqs = allFaqsCur.map(faq => {
            return {
                id: faq.id,
                question: utilities.extractQuestion(faq.answer)
            }
        }).filter(x => x.question)


        var revCutOff = new Date();
        revCutOff.setDate(revCutOff.getDate()-2);

        // let newRevisions = revisions.map(revs => {
        //     let itemUpdatedToday = revs.revisions.filter(e => utilities.parseYYYYMMDDToDate(e.date) > revCutOff)
        //     let updatedToday = itemUpdatedToday.length > 0
        //     return {
        //         id: revs.id,
        //         question: revs.revisions[0].question,  //Just make sure they are sorted by date first
        //         updatedToday : updatedToday
        //     }
        // }).filter(x => x.updatedToday)


        let newRevisions = revisions.map(revs => {
            let itemUpdatedToday = revs.revisions.filter(e => utilities.parseYYYYMMDDToDate(e.date) > revCutOff)
            let updatedToday = itemUpdatedToday.length > 0
            return {
                id: revs.id,
                question: revs.revisions[0].question,  //Just make sure they are sorted by date first
                updatedToday : updatedToday,
                numberOfRevisions : revs.revisions.length,
                deletedDate : revs.deletedDate
            }
        })
      
    //revisions where delted date is after cut off
    let delFaqs = newRevisions.filter(function(e) {
        if (e.deletedDate == null){
            return false
        }
        if (utilities.parseYYYYMMDDToDate(e.deletedDate) > revCutOff){
            return true;
        }
    });    
    //newRevisions.filter(p => !curFaqs.some(c => c.id == p.id))
    let newFaqs = newRevisions.filter(c => c.numberOfRevisions === 1 && c.updatedToday)

    // let updatedFaqs = prevFaqs.reduce((acc, prev) => {
    //     let cur = curFaqs.find(cur => cur.id === prev.id)

    //     if (cur && utilities.removeWhitespace(cur.question) != utilities.removeWhitespace(prev.question)) {
    //         acc.push({
    //             id: cur.id,
    //             prevQuestion: prev.question,
    //             curQuestion: cur.question
    //         })
    //     }

    //     return acc;
    // }, [])


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

    // if (updatedFaqs.length) {
    //     console.log("\n\n" + chalk.yellow.bold("Updated Question Titles"))
    //     updatedFaqs.forEach(x => {
    //         console.log(chalk.yellow.bold("• ") + x.prevQuestion)
    //         console.log("🡒 " + x.curQuestion + "\n")
    //     })
    // }

    // // add bottom spacing if we need it
    // if (delFaqs.length || newFaqs.length || updatedFaqs.length) {
    //     console.log("\n")
    // }

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