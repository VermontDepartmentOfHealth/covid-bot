module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("favicon.ico");

    // grab 3rd party dependencies
    eleventyConfig.addPassthroughCopy({
        "node_modules/mark.js/dist/mark.min.js": "/assets/mark.js"
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