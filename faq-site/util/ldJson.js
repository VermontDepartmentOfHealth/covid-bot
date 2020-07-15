const utilities = require('./utilities')
const md = require('markdown-it')

module.exports = main

async function main() {

    let faqs = await utilities.readJsonc("_data/faqs.jsonc")
    let pub = faqs.qnaDocuments.filter(t => (t.metadata || []).none(m => m.name === "category" && m.value === "chitchat"))


    let entities = pub.map(faq => {

        // extract question and answer
        let question = utilities.extractQuestion(faq.answer) || faq.questions[0]
        let answer = utilities.extractAnswer(faq.answer)
        let answerHtml = md().render(answer)

        let entity = {
            "@type": "Question",
            "name": question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": answerHtml
            }
        }
        return entity
    })

    let document = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": entities
    }

    // minify
    return JSON.stringify(document)

}

// https://stackoverflow.com/a/62906598/1366033
Object.defineProperty(Array.prototype, 'none', {
    value: function(callback) { return !this.some(callback) }
});