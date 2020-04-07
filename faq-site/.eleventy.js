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
    eleventyConfig.addFilter("slugify", function(s) {
        // strip special chars
        let newStr = s.replace(/[^a-z ]/gi, '').trim();
        // take first 8 words and separate with "-""
        newStr = newStr.split(" ").slice(0, 4).join("-");
        return newStr;
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