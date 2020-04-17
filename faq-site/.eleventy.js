const utilities = require('./tools/utilities')

module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("favicon.ico");

    // grab 3rd party dependencies
    eleventyConfig.addPassthroughCopy({
        "node_modules/mark.js/dist/mark.min.js": "/assets/mark.js",
        "node_modules/details-polyfill/index.js": "/assets/details-polyfill.js"
    });

    eleventyConfig.addCollection("FaqsByTopic", col => {
        let allFaqs = col.items[0].data.faqs.qnaDocuments

        // get all sorted topics
        let topics = col.items[0].data.topics

        // sort parent topics
        let sortedTopics = topics.map(t => t.name)

        // transform faq object
        allFaqs = allFaqs.map(faq => {
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
        })


        // get all new topics
        let allTopics = allFaqs.map(faq => faq.metadata.category).filter(cat => cat)

        // deduplicate
        let allUniqTopics = [...new Set(allTopics)];

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

            let catFaqs = allFaqs.filter(faq => utilities.stringsAlphaEqual(faq.metadata.category, cat))


            // get all subcategories
            let subCats = catFaqs.map(faq => faq.metadata.subcategory || "").map(utilities.toTitleCase)

            // check if we have manual subcategory sort
            let subSort = topics.find(t => utilities.stringsAlphaEqual(t.name, cat))

            let manualSubSort = subSort.subs || []

            // sort subcategories
            let sortedSubCats = subCats.sort((a, b) => a.localeCompare(b))

            // combine manual + auto
            let mergeSubcats = manualSubSort.concat(sortedSubCats)

            // distinct subcat
            let uniqueSubCats = [...new Set(mergeSubcats)];

            // add general category if we've added a manual sort and any subcats blank
            let blankSubs = catFaqs.filter(faq => !faq.metadata.subcategory)

            if (subSort.subs && blankSubs.length) {
                uniqueSubCats.push("General")
                blankSubs.forEach(faq => faq.metadata.subcategory = "General")
            }

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

        // make sure faqs exist for topic
        let publishTopicCollection = topicCollection.filter(t => t.subs.length)

        return topicCollection;
    });



    eleventyConfig.addShortcode("now", () => {
        var time = new Date();
        var options = {
            weekday: 'short',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: "numeric",
            hour12: true
        };
        var formatted = time.toLocaleString('en-US', options)
        return formatted
    });


    eleventyConfig.addFilter("slugify", title => {
        // remove parens & strip special chars
        let slug = title.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z ]/gi, '').trim();
        // take first 8 words and separate with "-""
        slug = slug.split(" ").slice(0, 8).join("-");
        return slug;
    })


    let md = require("markdown-it")();
    eleventyConfig.addFilter("md", content => md.render(content))


    return {};
};