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

        // get all new topics
        let allTopics = allFaqs.map(faq => {
            let catMetadata = faq.metadata.find(m => m.name === "category")
            if (!catMetadata) {
                console.error("Missing Category for question: ", faq.questions[0])
            }
            return catMetadata ? catMetadata.value : ""
        }).filter(cat => cat)

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

            let faqs = allFaqs.filter(faq => {
                let catMetadata = faq.metadata.find(m => m.name === "category")
                let faqMatchesTopic = catMetadata && catMetadata.value && utilities.stringsAlphaEqual(catMetadata.value, topic)
                return faqMatchesTopic
            })

            // parse question and answer
            let updatedFaqs = faqs.map(faq => {
                faq.question = utilities.extractQuestion(faq.answer)
                faq.answerBody = utilities.extractAnswer(faq.answer)
                return faq
            })

            // sort faqs
            let sortedFaqs = updatedFaqs.sort((a, b) => a.question.localeCompare(b.question))

            let properName = topic.charAt(0).toUpperCase() + topic.slice(1);

            return {
                name: properName,
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