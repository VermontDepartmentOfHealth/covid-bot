const utilities = require('./utilities')

//This follow up question will be ignored
const didNotAnswerText = "This did NOT answer my question."

module.exports = fixFollowUpsOnLocalFaq();

async function fixFollowUpsOnLocalFaq() {
    //get local version of kb
    let faqs = await utilities.readJsonc("_data/faqs.jsonc")
    let allFaqs = faqs.qnaDocuments

    let updatedKb = updateFollowQuestionButtons(allFaqs)

    //write updated version back to local file
    let contents = JSON.stringify(updatedKb, null, 4);
    await utilities.writeFile("_data/faqs.jsonc", contents)

}

function updateFollowQuestionButtons(allFaqs) {
    
    //for each qna item
    allFaqs.forEach(faq => {

        //get follow up prompts
        let prompts = faq.context.prompts

        //initialize array to track follow ups that point to a question that has been removed
        let followUpsToDelete = [];

        //If there are any follow ups TODO do I need to check lenght? or will the for each take care of that/
        if(Array.isArray(prompts) && prompts.length){
            
            prompts.forEach(followUp => {
                let buttonText = followUp.displayText

                //ignore the "This did not answer.." buttons
                if (buttonText === didNotAnswerText){
                    return;
                }
    
                //get the Id that this follow up points to 
                let targetQuestionId = followUp.qnaId

                //find the full question item
                let targetQuestion = allFaqs.filter(obj => {
                     return obj.id === targetQuestionId
                })

                //if we can't find the question, it has been deleted, add this prompt to list that will be removed
                if(targetQuestion.length === 0){
                    followUpsToDelete.push(targetQuestionId)
                    return; //the is nothing else we need to do for prompts that will be removed
                }

                //We can trust that, if we found a question by ID, it will be unique and we can take the first
                let targetQuestionText = utilities.extractQuestion(targetQuestion[0].answer)
    
                //if the follow up button text is different from the question text, update it
                if(buttonText !== targetQuestionText){
                    followUp.displayText = targetQuestionText
             }
            });
        }

        //After all prompts for this question are processed, remove follow ups that point to delted questions
        let updatedFollowups = faq.context.prompts.filter(prompt => !followUpsToDelete.includes(prompt.qnaId))
        faq.context.prompts = updatedFollowups
    })

    //return the udpated listed on qnaDocuments using teh KB signature
    let knowledgeBase = {"qnaDocuments": allFaqs}
    return knowledgeBase;

}

