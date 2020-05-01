const difflib = require('difflib');

module.exports = diffText

function diffText(oldText, newText, convertToHtml) {


    // each individual word, separated by a space will become a new token
    oldText = tokenizeChars(oldText)
    newText = tokenizeChars(newText)


    let oldTokens = oldText.split(" ")
    let newTokens = newText.split(" ")


    let diffs = difflib.ndiff(oldTokens, newTokens)

    // translate diffs
    diffs = diffs.map(d => {
        let delta = d.slice(0, 1)
        let text = d.slice(2)

        let obj = { text }
        if (delta === "+") obj.added = true
        if (delta === "-") obj.deleted = true
        if (delta === " ") obj.both = true
        if (delta === "?") obj.unknown = true

        return obj
    })

    // remove missing chars
    diffs = diffs.filter(d => !d.unknown)

    // remove consecutive words with diff capitalization
    diffs = removeConsecutiveCasingDifferences(diffs)

    // insert del / ins elements
    let result = diffs.map((diff, i) => {
        let prev = diffs[i - 1] || {}
        let cur = diffs[i]
        let next = diffs[i + 1] || {}

        let returnValue = ""
            // opening tag
        if (cur.added && !prev.added) returnValue += "<ins>"
        if (cur.deleted && !prev.deleted) returnValue += "<del>"

        // always add text
        returnValue += cur.text

        // closing tag
        if (cur.added && !next.added) returnValue += "</ins>"
        if (cur.deleted && !next.deleted) returnValue += "</del>"

        return returnValue
    }).join(" ")


    // replace tokens
    result = detokenizeChars(result)

    // https://regexr.com/53nqm
    let newlineInEditTag = /(?<=<(ins|del)>(?!<\/\1>)*?)(\n\n)(?=.*?<\/\1>)/g

    result = result.replace(newlineInEditTag, "</$1>$&<$1>")

    if (convertToHtml) {
        let md = require('markdown-it')({
            html: true
        });

        // render final markup
        let output = md.render(result);
        return output;
    }

    return result

}

function tokenizeChars(text) {
    // never tokenize urls - always keep together
    // ALT: swap out special chars in urls for temp replacements ,.*"“”[]()\n

    // identify all hyperlinks - demarcate to help keep together
    // https://regexr.com/52gn4
    text = text.replace(/https?:\/\/.*?(?=\)|\s)/g, "~~$&~~")


    // support all markdown chars as separate tokens - initially add space and then remove when we've processed
    // https://regexr.com/53npf
    text = text.replace(/[\*,\."“”\[\]\(\)\n](?=(?:[^~]*~~[^~]*~~)*[^~]*$)/g, " $& ")
    text = text.replace(/ \n  \n /g, " \n\n ")

    return text;
}


function detokenizeChars(text) {
    // https://regexr.com/53npo
    text = text.replace(/ \n\n /g, " \n  \n ")
    text = text.replace(/ (<\/?(?:ins|del)>)?([\*,\."“”\[\]\(\)\n])(<\/?(?:ins|del)>)? /g, "$1$2$3")
    text = text.replace(/~~/g, "") // remove hyperlink wrapper

    return text;
}

function removeConsecutiveCasingDifferences(diffs) {
    let output = diffs.map((diff, i) => {
        let prev = diffs[i - 1] || {}
        let cur = diffs[i]
        let next = diffs[i + 1] || {}

        // same word
        let sameAsNext = cur.text.toLowerCase() === (next.text || "").toLowerCase()
        let sameAsPrev = cur.text.toLowerCase() === (prev.text || "").toLowerCase()
        let sameWord = sameAsNext || sameAsPrev

        // add & removing || remove & adding
        let markedDiffNext = (cur.added && next.deleted) || (cur.deleted && next.added)
        let markedDiffPrev = (cur.added && prev.deleted) || (cur.deleted && prev.added)
        let markedDiff = markedDiffNext || markedDiffPrev

        let needsFix = sameWord && markedDiff

        // we need to take action
        if (needsFix) {

            // added wins -> same
            if (cur.added) {
                cur = {
                    text: cur.text,
                    both: true
                }
            }

            // deleted gets removed
            if (cur.deleted) {
                cur = null
            }

        }

        return cur
    }).filter(d => d)

    return output
}