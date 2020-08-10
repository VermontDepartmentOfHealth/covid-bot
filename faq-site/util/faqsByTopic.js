const utilities = require('./utilities')
const SHOW_REVISION_HISTORY_LAG_DAYS = 4

module.exports = buildFAQsByTopic

async function buildFAQsByTopic() {

    let revisions = await utilities.readJsonc("_data/revisions.jsonc")
    let faqsCur = await utilities.readJsonc("_data/faqs.jsonc")
    let topics = await utilities.readJsonc("_data/topics.jsonc")

    let sortedTopics = topics.map(t => t.name)

    // transform faq object
    let allFaqsCur = faqsCur.qnaDocuments.map(transformFaq)

    // diff faqs
    let allFaqs = findDifferences(allFaqsCur, revisions)

    // get all new topics
    let allTopics = allFaqs.map(faq => faq.metadata.category).filter(cat => cat)

    // deduplicate
    let allUniqTopics = utilities.deduplicate(allTopics)

    // get new topics
    let newTopics = allUniqTopics.filter(at => {
        let faqTopicExists = sortedTopics.some(st => {
            let nameExists = utilities.stringsAlphaEqual(st, at)
            return nameExists
        })
        return !faqTopicExists
    })

    // merge topics
    let mergeTopics = sortedTopics.concat(newTopics)

    // remove chitchat
    let publishTopics = mergeTopics.filter(t => t.toLowerCase() !== "chitchat")

    // map topics array into {topic: name, faqs: []}
    let topicCollection = publishTopics.map(cat => {

        // get faqs for this category
        let catFaqs = allFaqs.filter(faq => utilities.stringsAlphaEqual(faq.metadata.category, cat))


        // get sub categories
        let uniqueSubCats = getSubCategories(catFaqs, topics, cat)


        // bin faqs into subcategories
        let subCatCollection = uniqueSubCats.map(subCat => {
            let subCatFaqs = catFaqs.filter(faq => utilities.stringsAlphaEqual(faq.metadata.subcategory, subCat))

            // order by .metadata.sort then by .question

            // sort faqs
            let sortedFaqs = subCatFaqs.sort((a, b) => {
                let aSortInt = a.metadata.sort ? +a.metadata.sort : 0
                let bSortInt = b.metadata.sort ? +b.metadata.sort : 0
                    // order first by sort (if it exists)
                if (aSortInt > bSortInt) {
                    return -1;
                } else if (bSortInt) {
                    return 1;
                }

                // then by alphabetical
                return a.question.localeCompare(b.question)

            })

            return {
                name: subCat,
                faqs: sortedFaqs
            }
        })


        return {
            name: utilities.toProperCase(cat),
            subs: subCatCollection
        }
    })


    return topicCollection;

}



function transformFaq(faq) {

    let { id, answer, questions, metadata } = faq

    let qna = { id, questions }

    // extract question and answer
    qna.question = utilities.extractQuestion(answer) || faq.questions[0]
    qna.answerBody = utilities.extractAnswer(answer)

    // flatten metadata
    qna.metadata = utilities.flattenArrayToObject(metadata)

    // rename abbrev
    qna.metadata.category = qna.metadata.category || ""
    qna.metadata.category = qna.metadata.category.replace(/VT/i, "Vermont")

    return qna

}


function getSubCategories(catFaqs, topics, catName) {

    // get all subcategories
    let subCats = catFaqs.map(faq => faq.metadata.subcategory || "").map(utilities.toTitleCase)

    // check if we have manual subcategory sort
    let subSort = topics.find(t => utilities.stringsAlphaEqual(t.name, catName))

    let manualSubSort = subSort && subSort.subs ? subSort.subs : []

    // sort subcategories
    let sortedSubCats = subCats.sort((a, b) => a.localeCompare(b))

    // combine manual + auto
    let mergeSubcats = manualSubSort.concat(sortedSubCats)

    // distinct subcat
    let uniqueSubCats = utilities.deduplicate(mergeSubcats)


    // add general category if we've added a manual sort and any subcats blank
    let blankSubs = catFaqs.filter(faq => !faq.metadata.subcategory)

    if (subSort && subSort.subs && blankSubs.length) {
        uniqueSubCats.push("General")
        blankSubs.forEach(faq => faq.metadata.subcategory = "General")
    }

    return uniqueSubCats
}

function findDifferences(allFaqsCur, revisions) {

    let diffText = require("@ads-vdh/md-diff")

    allFaqsCur.forEach(curFaq => {

        // get revision history
        let history = revisions.find(rev => rev.id === curFaq.id)


        // sort by date reverse chronologically and grab first item
        let sortedHistory = history.revisions.sort((a, b) => utilities.parseYYYYMMDDToDate(b.date) - utilities.parseYYYYMMDDToDate(a.date))

        // get latest item from history
        let latestRevision = sortedHistory[0]

        // apply last update timestamp to all questions
        curFaq.lastUpdated = latestRevision.date


        // revision cut off time
        var revCutOff = new Date();
        revCutOff.setDate(revCutOff.getDate() - SHOW_REVISION_HISTORY_LAG_DAYS);

        // only display delta if we've changed in the last n days
        // leave if we haven't been modified recently
        let isModifiedRecently = utilities.parseYYYYMMDDToDate(latestRevision.date) > revCutOff
        if (!isModifiedRecently) return;


        // should always have revisions history - brand new questions - just have # of revs = 1
        let noRevisionHistory = history.revisions.length === 1
        if (noRevisionHistory) {
            // new questions (new id not in old)
            curFaq.isNew = true
            return
        }

        // otherwise, we have a recently updated question - add deltas
        curFaq.questionDiff = diffText(latestRevision.question, curFaq.question, false)
        curFaq.answerBodyDiff = diffText(latestRevision.answerBody, curFaq.answerBody, false)
        curFaq.isUpdated = true


    })


    return allFaqsCur;

}