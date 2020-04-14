module.exports = {
    extractQuestion,
    extractAnswer,
    stringsAlphaEqual,
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
    return a.toLowerCase().replace(/[^\w]/g, '') === b.toLowerCase().replace(/[^\w]/g, '')
}

function flattenArrayToObject(arr) {
    let entries = arr.map(el => [el.name, el.value])
    let obj = Object.fromEntries(entries)
    return obj;
}