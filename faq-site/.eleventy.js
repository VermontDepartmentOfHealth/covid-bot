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
                let nameExists = stringsAlphaEqual(st, at)
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
                let faqMatchesTopic = catMetadata && stringsAlphaEqual(catMetadata.value, topic)
                return faqMatchesTopic
            })

            let properName = topic.charAt(0).toUpperCase() + topic.slice(1);

            return {
                name: properName,
                faqs: faqs
            }
        })

        // make sure faqs exist for topic
        let publishTopicCollection = topicCollection.filter(t => t.faqs.length)

        return publishTopicCollection;
    });

    // add filters
    eleventyConfig.addFilter("extractQuestion", function(answer) {

        // get initial bold text
        let match = answer.match(/^\*\*(.*)\*\*/);
        if (!match) {
            console.error("Couldn't parse bold question text from: ", answer)
            return "Question"
        }

        return match[1];
    });

    eleventyConfig.addFilter("extractAnswer", function(answer) {

        // replace initial bold text
        let body = answer.replace(/^\*\*(.*)\*\*/, "");

        return body;
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


    return {

        // By default markdown files are pre-processing with liquid template engine
        // https://www.11ty.io/docs/config/#default-template-engine-for-markdown-files
        markdownTemplateEngine: "njk",
    };
};


function stringsAlphaEqual(a, b) {
    return a.toLowerCase().replace(/[^\w]/g, '') === b.toLowerCase().replace(/[^\w]/g, '')
}