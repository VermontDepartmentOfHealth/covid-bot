const utilities = require('./util/utilities')

module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("favicon.ico");

    // grab 3rd party dependencies
    eleventyConfig.addPassthroughCopy({
        "node_modules/mark.js/dist/mark.min.js": "/assets/mark.js",
        "node_modules/details-polyfill/index.js": "/assets/details-polyfill.js"
    });

    eleventyConfig.addCollection("FaqsByTopic", async c => {
        const buildFAQsByTopic = require('./util/faqsByTopic')
        let col = await buildFAQsByTopic()
        return col
    });
    eleventyConfig.addAsyncShortcode("ldJson", async() => await require('./util/ldJson')());

    eleventyConfig.addShortcode("now", () => utilities.getCurrentTimestamp());


    eleventyConfig.addFilter("slugify", title => utilities.slugify(title))

    let md = utilities.customizeMarkdown();

    eleventyConfig.addFilter("md", content => md.render(content))
    eleventyConfig.setLibrary("md", md);

    return {
        dir: {
            "layouts": "_layouts"
        }
    };
};