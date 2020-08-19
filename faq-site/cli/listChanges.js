const chalk = require("chalk")
const utilities = require('../util/utilities')
const SHOW_REVISION_HISTORY_LAG_DAYS = 1

module.exports = main

async function main() {

    let fullRevisionObj = await utilities.readJsonc("_data/revisions.jsonc")

    listRevisions(fullRevisionObj)

 }

function listRevisions(fullRevisionObj) {

    var revCutOff = new Date();
    revCutOff.setDate(revCutOff.getDate()-SHOW_REVISION_HISTORY_LAG_DAYS);

    let revisionDeltaList = fullRevisionObj.map(revItem => {

        //revisions should already be sorted, but we still double check
        revItem.revisions.sort((a, b) => utilities.parseYYYYMMDDToDate(a.date) - utilities.parseYYYYMMDDToDate(b.date))
        //Was last updated after revision cut off date
        let updatedToday = revItem.revisions.some(e => utilities.parseYYYYMMDDToDate(e.date) > revCutOff)
        //Was it updated today, and have no previous versions?
        let addedToday = updatedToday ? revItem.revisions.length === 1 :false

        let titleUpdated = updatedToday && !addedToday ? utilities.removeWhitespace(revItem.revisions[revItem.revisions.length - 1].question) !== utilities.removeWhitespace(revItem.revisions[revItem.revisions.length - 2].question) : false
        //when the title is updated, get the next most recent version
        let prevQuestion = titleUpdated ? revItem.revisions[revItem.revisions.length - 2].question : null
        //do we have a deltedDate? and is it after the cut off date?
        let deletedToday = !(revItem.deletedDate == null) && utilities.parseYYYYMMDDToDate(revItem.deletedDate) > revCutOff
        
        return {
            id: revItem.id,
            revisions : revItem.revisions,
            question: revItem.revisions[revItem.revisions.length -1].question,  //Just make sure they are sorted by date first
            prevQuestion,
            updatedToday,
            titleUpdated,
            deletedToday,
            addedToday
            }
    });
      
    let delFaqs = revisionDeltaList.filter(e => e.deletedToday);    

    let newFaqs = revisionDeltaList.filter(c => c.addedToday)

    let questionTitlesUpdated = revisionDeltaList.filter(f => f.titleUpdated);

    console.log("\n" + chalk.blue.bold("Daily Update Checklist"))

    // print update notes
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

    if (questionTitlesUpdated.length) {
        console.log("\n\n" + chalk.yellow.bold("Updated Question Titles"))
        questionTitlesUpdated.forEach(x => {
            console.log(chalk.yellow.bold("• ") + x.prevQuestion)
            console.log("🡒 " + x.question + "\n")
        })
    }

    // add bottom spacing if we need it
    if (delFaqs.length || newFaqs.length || questionTitlesUpdated.length) {
        console.log("\n")
    }

}