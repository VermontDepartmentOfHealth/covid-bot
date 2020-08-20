const utilities = require('../util/utilities')

module.exports = main;

async function main() {

    await archiveFaqs()

}

async function archiveFaqs() {
    let startingRevisionObj = await utilities.readJsonc("_data/revisions.jsonc")
    let faqsCur = await utilities.readJsonc("_data/faqs.jsonc")

    let curDate = new Date();
    let dateStr = curDate.toISOString().split('T')[0]

    //get all the qna ids for current faq
    let currentQnaIds = faqsCur.qnaDocuments.map(faq => {return  {id: faq.id}})

    let revisionObjForUpdate = startingRevisionObj.map(revItem => {

        //is this rev in current?
        let revHasBeenDeleted = !currentQnaIds.some(c => c.id == revItem.id)  
        let deletedDate = revHasBeenDeleted ? revItem.deletedDate || dateStr : null

            return {
                id: revItem.id,
                revisions: revItem.revisions,
                deletedDate
            }
        });

    // get all cur faqs (by id)
    faqsCur.qnaDocuments.forEach(curFaq => {

        // lookup the revision history item based on that id
        let history = revisionObjForUpdate.find(rev => rev.id === curFaq.id)

        let curRevItem = {
            question: utilities.extractQuestion(curFaq.answer),
            answerBody: utilities.extractAnswer(curFaq.answer),
            date: dateStr
        }

        // if rev history doesn't exist, add rev item {id, revisions: [ {question, answerBody, date}]} - and exit
        if (!history) {
            revisionObjForUpdate.push({
                id: curFaq.id,
                revisions: [curRevItem],
                deletedDate : null
            })
            return;
        }

        // get all rev history items & sort by date
        let sortedHistory = history.revisions.sort((a, b) => utilities.parseYYYYMMDDToDate(a.date) - utilities.parseYYYYMMDDToDate(b.date))

        // get latest item from history
        let latestRevision = sortedHistory[sortedHistory.length - 1]

        // if most recent is today, then remove and replace with current - and exit
        if (dateStr === latestRevision.date) {
            sortedHistory[sortedHistory.length - 1] = curRevItem
            return;
        }

        // compare current question/answer to most recent
        let diffQuestion = utilities.removeWhitespace(latestRevision.question) != utilities.removeWhitespace(utilities.extractQuestion(curFaq.answer))
        let diffAnswer = utilities.removeWhitespace(latestRevision.answerBody) != utilities.removeWhitespace(utilities.extractAnswer(curFaq.answer))

        // check if modified
        let isModified = diffQuestion || diffAnswer

        // if different then push new revision {question, answerBody, date} (using today's late)
        if (isModified) {
            history.revisions.push(curRevItem)
        }

    });

    // build output
    let contents = JSON.stringify(revisionObjForUpdate, null, 4);
    await utilities.writeFile("_data/revisions.jsonc", contents)
}
