module.exports = {
    extractQuestion,
    extractAnswer,
    stringsAlphaEqual,
    toTitleCase,
    toProperCase,
    flattenArrayToObject,
    readJsonc,
    slugify,
    isEmptyObj,
    getCurrentTimestamp,
    deduplicate,
    writeFile,
    removeWhitespace
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

        // lower case if less than or equal to 3 characters
        if (word.length <= 3) return word.toLowerCase()

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

    let projectRoot = __dirname.replace(/(cli|util)$/, "")
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

/**
 * Test whether item is is empty object `{}`
 * @param {object} obj
 * @description See also: https://stackoverflow.com/q/679915/1366033
 */
function isEmptyObj(obj) {
    return JSON.stringify(obj) === JSON.stringify({});
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

async function writeFile(path, contents) {
    const { promises: fs } = require("fs");
    const GENERATED_FILE_WARNING = "// GENERATED FILE - only update by re-running updateData.js - local changes will be wiped out\r\n"

    let projectRoot = __dirname.replace(/(cli|util)$/, "");
    let fullPath = `${projectRoot}/${path}`;

    try {
        await fs.writeFile(fullPath, GENERATED_FILE_WARNING + contents)

        console.log(`Data has been written to ${path}`);

    } catch (error) {
        console.error(error)
    }
}

function removeWhitespace(str) {
    return (str || "").replace(/\s/g, "")
}