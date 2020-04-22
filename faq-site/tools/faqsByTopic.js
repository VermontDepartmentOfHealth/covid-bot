const utilities = require('./utilities')

module.exports = buildFAQsByTopic

async function buildFAQsByTopic() {

    let faqs = await utilities.readJsonc("_data/faqs.jsonc")
    let topics = await utilities.readJsonc("_data/topics.jsonc")

    let sortedTopics = topics.map(t => t.name)

    // transform faq object
    let allFaqs = faqs.qnaDocuments.map(transformFaq)

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


        // bin faqs into subcategtories
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

    let manualSubSort = subSort.subs || []

    // sort subcategories
    let sortedSubCats = subCats.sort((a, b) => a.localeCompare(b))

    // combine manual + auto
    let mergeSubcats = manualSubSort.concat(sortedSubCats)

    // distinct subcat
    let uniqueSubCats = utilities.deduplicate(mergeSubcats)


    // add general category if we've added a manual sort and any subcats blank
    let blankSubs = catFaqs.filter(faq => !faq.metadata.subcategory)

    if (subSort.subs && blankSubs.length) {
        uniqueSubCats.push("General")
        blankSubs.forEach(faq => faq.metadata.subcategory = "General")
    }

    return uniqueSubCats
}