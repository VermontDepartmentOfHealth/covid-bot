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

    eleventyConfig.addFilter("prettyDate", dateStr => {
        let dateParts = dateStr.split("-")
        let date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
        let output = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        // todo: maybe use ordinal numbers ex. 3rd
        return output
    })
    eleventyConfig.addFilter("slugify", title => utilities.slugify(title))

    let md = customizeMarkdown();

    eleventyConfig.addFilter("md", content => md.render(content))
    eleventyConfig.setLibrary("md", md);

    return {};
};

function customizeMarkdown() {

    let md = require("markdown-it")({
        html: true,
        linkify: true
    });

    // Remember old renderer, if overridden, or proxy to default renderer
    let defaultAnchorRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
        // If you are sure other plugins can't add `target` - drop check below
        let token = tokens[idx]

        let setAttribute = function(token, attrName, attrValue, append) {
            var index = token.attrIndex(attrName);

            if (index < 0) {
                // add new attribute
                token.attrPush([attrName, attrValue]);
            } else {
                // update value of existing attr
                token.attrs[index][1] = (append ? token.attrs[index][1] : "") + attrValue;
            }
        }

        setAttribute(token, "target", "_blank")
        setAttribute(token, "rel", "noopener")
        setAttribute(token, "class", " external-link", true)

        // pass token to default renderer.
        return defaultAnchorRender(tokens, idx, options, env, self);
    };

    return md
}