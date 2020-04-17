module.exports = {
    extractQuestion,
    extractAnswer,
    stringsAlphaEqual,
    toTitleCase,
    toProperCase,
    flattenArrayToObject
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