const difflib = require('difflib');

module.exports = diffText

function diffText(oldText, newText, convertToHtml) {

    // support all markdown chars as separate tokens - initially add space and then remove when we've processed
    // ** * [ ] ( ) \n \n\n *

    oldText = tokenizeChars(oldText)
    newText = tokenizeChars(newText)


    let oldTokens = oldText.split(" ")
    let newTokens = newText.split(" ")


    let diffs = difflib.ndiff(oldTokens, newTokens)

    // translate diffs
    diffs = diffs.map(d => {
        let delta = d.slice(0, 1)
        let text = d.slice(2)

        return {
            text: text,
            added: delta === "+",
            deleted: delta === "-",
            both: delta === " ",
            unknown: delta === "?"
        }
    })

    // remove missing chars
    diffs = diffs.filter(d => !d.unknown)


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



    result = detokenizeChars(result)


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
    text = text.replace(/\*/g, " * ")
    text = text.replace(/\n/g, " \n ")
    text = text.replace(/,/g, " , ")
    return text;
}

// replace tokens
function detokenizeChars(text) {
    text = text.replace(/ \* /g, "*")
    text = text.replace(/ \n /g, "\n")
    text = text.replace(/ , /g, ",")
    return text;
}