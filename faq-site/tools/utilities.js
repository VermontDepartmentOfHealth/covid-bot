module.exports = {
    extractQuestion,
    extractAnswer,
    stringsAlphaEqual,
    toTitleCase,
    toProperCase,
    flattenArrayToObject,
    readJsonc,
    slugify,
    getCurrentTimestamp,
    deduplicate
}


function extractQuestion(answer) {

    // get initial bold text
    let match = answer.match(/^\*\*(.*)\*\*/);

    return match ? match[1] : "";
}

function extractAnswer(answer) {

    // replace initial bold text
    let body = answer.replace(/^\*\*(.*)\*\*/, "");

    return body;
}

function stringsAlphaEqual(a, b) {
    a = (a || "").toLowerCase().replace(/[^\w]/g, '')
    b = (b || "").toLowerCase().replace(/[^\w]/g, '')
    return a === b
}

function toProperCase(str) {
    return str ? str[0].toUpperCase() + str.slice(1) : ""
}

function toTitleCase(str) {
    // capitalize first word, last word, and all words over two chars
    let words = str.split(" ")
    let cased = words.map((word, i) => {
        // always capitalize first word
        if (i == 0) return toProperCase(word)
            // always capitalize last word
        if (i == words.length - 1) return toProperCase(word)

        // don't capitalize these words
        let articles = ["a", "an", "the"]
        let coordinatingConjunctions = ["for", "and", "nor", "but", "or", "yet", "so"]
        let prepositions = ["at", "by", "to", "with", "in"]
        let dontCapitalizeWords = articles.concat(coordinatingConjunctions).concat(prepositions)
        let dontCapitalize = dontCapitalizeWords.some(w => w === word.toLowerCase())
        if (dontCapitalize) return word.toLowerCase()

        // lower case if less than or equal to 4 characters
        if (word.length <= 4) return word.toLowerCase()

        // otherwise uppercase everything else
        return toProperCase(word)
    })
    return cased.join(" ")
}

function flattenArrayToObject(arr) {
    let entries = arr.map(el => [el.name, el.value])
    let obj = Object.fromEntries(entries)
    return obj;
}

async function readJsonc(path) {
    const { promises: fs } = require("fs");
    const jsoncParser = require("jsonc-parser")

    let projectRoot = __dirname.replace(/tools$/, "");
    let fullPath = `${projectRoot}${path}`;
    let contents = await fs.readFile(fullPath, "utf8")
    let output = jsoncParser.parse(contents)
    return output
}

function slugify(title) {
    // remove parens & strip special chars
    let slug = title.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z ]/gi, '').trim();
    // take first 8 words and separate with "-""
    slug = slug.split(" ").slice(0, 8).join("-");
    return slug;
}

function getCurrentTimestamp() {
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
}

function deduplicate(array) {
    let uniqueArray = [...new Set(array)];
    return uniqueArray
}