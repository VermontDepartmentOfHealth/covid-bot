const difflib = require('difflib');

module.exports = diffText

function diffText(oldText, newText, convertToHtml) {

    // support all markdown chars as separate tokens - initially add space and then remove when we've processed
    // ** * [ ] ( ) \n \n\n *

    let tokenizeChars = text => {
        text = text.replace(/\*/g, " * ")
        text = text.replace(/\n/g, " \n ")
        return text;
    }

    oldText = tokenizeChars(oldText)
    newText = tokenizeChars(newText)


    let oldTokens = oldText.split(" ")
    let newTokens = newText.split(" ")


    let diffs = difflib.ndiff(oldTokens, newTokens)


    // insert del / ins elements
    let result = diffs.map((diff, i) => {

        let prevDiff = diffs[i - 1] ? diffs[i - 1][0] : ""
        let curDiff = diffs[i][0]
        let nextDiff = diffs[i + 1] ? diffs[i + 1][0] : ""

        let curText = diff.slice(2)

        let returnValue = ""

        // opening tag
        if (curDiff === "+" && prevDiff !== "+") returnValue += "<ins>"
        if (curDiff === "-" && prevDiff !== "-") returnValue += "<del>"

        // always add text
        returnValue += curText

        // closing tag
        if (curDiff === "+" && nextDiff !== "+") returnValue += "</ins>"
        if (curDiff === "-" && nextDiff !== "-") returnValue += "</del>"

        return returnValue
    }).join(" ")

    // replace tokens
    let detokenizeChars = text => {
        text = text.replace(/ \* /g, "*")
        text = text.replace(/ \n /g, "\n")
        return text;
    }


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