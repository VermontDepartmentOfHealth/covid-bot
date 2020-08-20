const chalk = require("chalk")
const utilities = require('../util/utilities')


module.exports = main

async function main() {

    let faqs = await utilities.readJsonc("_data/faqs.jsonc")
    let pub = faqs.qnaDocuments.filter(t => (t.metadata || []).none(m => m.name === "category" && m.value === "chitchat"))
    let questions = pub.map(faq => {
        let question = utilities.extractQuestion(faq.answer) || faq.questions[0]
        return question
    })

    let output = questions.join("\n")
    await utilities.writeFileRaw("_output/faqs.csv", output)

}
// https://stackoverflow.com/a/62906598/1366033
Object.defineProperty(Array.prototype, 'none', {
    value: function(callback) { return !this.some(callback) }
});