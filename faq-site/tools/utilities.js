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
        if (i == 0) return toProperCase(word)
        if (i == words.length - 1) return toProperCase(word)
        if (word.length > 2) return toProperCase(word)
        return word.toLowerCase()
    })
    return cased.join(" ")
}

function flattenArrayToObject(arr) {
    let entries = arr.map(el => [el.name, el.value])
    let obj = Object.fromEntries(entries)
    return obj;
}