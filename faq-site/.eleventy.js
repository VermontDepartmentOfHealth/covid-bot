const utilities = require('./tools/utilities')

module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("favicon.ico");

    // grab 3rd party dependencies
    eleventyConfig.addPassthroughCopy({
        "node_modules/mark.js/dist/mark.min.js": "/assets/mark.js"
    });

    eleventyConfig.addCollection("FaqsByTopic", col => {
        let allFaqs = col.items[0].data.faqs.qnaDocuments

        // get all sorted topics
        let sortedTopics = col.items[0].data.topics

        // transform faq object
        allFaqs = allFaqs.map(faq => {
            let { id, answer, questions, metadata } = faq

            let qna = { id, questions }

            // extract question and answer
            qna.question = utilities.extractQuestion(answer) || faq.questions[0]
            qna.answerBody = utilities.extractAnswer(answer)

            // flatten metadata
            qna.metadata = utilities.flattenArrayToObject(metadata)

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
        let topicCollection = publishTopics.map(topic => {

            let catFaqs = allFaqs.filter(faq => utilities.stringsAlphaEqual(faq.metadata.category, topic))

            // sort faqs
            let sortedFaqs = catFaqs.sort((a, b) => a.question.localeCompare(b.question))

            return {
                name: utilities.toProperCase(topic),
                faqs: sortedFaqs
            }
        })

        // make sure faqs exist for topic
        let publishTopicCollection = topicCollection.filter(t => t.faqs.length)

        return publishTopicCollection;
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

    let md = require("markdown-it")();
    eleventyConfig.addFilter("md", content => md.render(content))


    return {};
};