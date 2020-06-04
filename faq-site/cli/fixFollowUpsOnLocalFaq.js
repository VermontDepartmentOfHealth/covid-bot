const utilities = require('../util/utilities')

// This follow up question will be ignored
const DID_NOT_ANSWER_TEXT = "This did NOT answer my question."
const DID_NOT_ANSWER_ID = 4533
const DID_NOT_ANSWER_SORT = 9


module.exports = fixFollowUpsOnLocalFaq();

async function fixFollowUpsOnLocalFaq() {
    // get local version of kb
    let faqs = await utilities.readJsonc("_data/faqs.jsonc")
    let allFaqs = faqs.qnaDocuments

    let updatedKb = updateFollowQuestionButtons(allFaqs)

    // write updated version back to local file
    let contents = JSON.stringify(updatedKb, null, 4);
    await utilities.writeFile("_data/faqs.jsonc", contents)

}

function updateFollowQuestionButtons(allFaqs) {

    // for each qna item
    allFaqs.forEach(faq => {

        // get follow up prompts
        let prompts = faq.context.prompts


        // update follow up prompts that point to a question that has been updated
        prompts.forEach(followUp => {
            // go grab displayText and ID from followup Prompt
            let {
                displayText: buttonText,
                qnaId: targetQuestionId,
                displayOrder: sort
            } = followUp

            // find the full question item
            let targetQuestion = allFaqs.find(obj => {
                return obj.id === targetQuestionId
            })

            // crazy edge case - this should probably never be true
            if (!targetQuestion) return;


            let curPromptIsDidNotAnswer = targetQuestionId === DID_NOT_ANSWER_ID

            // We can trust that, if we found a question by ID, it will be unique and we can take the first
            let targetQuestionText = curPromptIsDidNotAnswer ?
                DID_NOT_ANSWER_TEXT :
                utilities.extractQuestion(targetQuestion.answer)

            // if the follow up button text is different from the question text, update it
            if (buttonText !== targetQuestionText) {
                followUp.displayText = targetQuestionText
            }

            // always set did not answer sort to bottom
            if (curPromptIsDidNotAnswer) {
                if (sort !== DID_NOT_ANSWER_SORT) {
                    followUp.displayOrder = DID_NOT_ANSWER_SORT
                }
            }

        });

        // todo - this may never be possible if versions are synced
        // delete follow up prompts that point to a question that has been deleted
        faq.context.prompts = prompts.filter(prompt => {
            // filter out prompts if they don't point to a faq
            let qnaIdExists = allFaqs.some(faq => faq.id === prompt.qnaId)
            return qnaIdExists;
        })



    })

    // return the updated listed on qnaDocuments using teh KB signature
    let knowledgeBase = { "qnaDocuments": allFaqs }
    return knowledgeBase;

}