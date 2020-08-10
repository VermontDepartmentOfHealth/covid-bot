const utilities = require('../util/utilities')

module.exports = main;

async function main() {

    await archiveFaqs()

}

async function archiveFaqs() {
    let revisions = await utilities.readJsonc("_data/revisions.jsonc")
    let faqsCur = await utilities.readJsonc("_data/faqs.jsonc")

    let curDate = new Date();
    let dateStr = curDate.toISOString().split('T')[0]

    // get all cur faqs (by id)
    faqsCur.qnaDocuments.forEach(curFaq => {

        // lookup the revision history item based on that id
        let history = revisions.find(rev => rev.id === curFaq.id)

        let curRevItem = {
            question: utilities.extractQuestion(curFaq.answer),
            answerBody: utilities.extractAnswer(curFaq.answer),
            date: dateStr
        }

        // if rev history doesn't exist, add rev item {id, revisions: [ {question, answerBody, date}]} - and exit
        if (!history) {
            revisions.push({
                id: curFaq.id,
                revisions: [curRevItem]

            })
            return;
        }

        // rev history does exist

        // get all rev history items & sort by date
        let sortedHistory = history.revisions.sort((a, b) => utilities.parseYYYYMMDDToDate(a.date) - utilities.parseYYYYMMDDToDate(b.date))

        // get latest item from history
        let latestRevision = sortedHistory[sortedHistory.length - 1]

        // if most recent is today, then remove and replace with current - and exit
        if (dateStr === latestRevision.date) {
            sortedHistory[sortedHistory.length - 1] = curRevItem
            return;
        }

        // compare current question/answer to most recent
        let diffQuestion = utilities.removeWhitespace(latestRevision.question) != utilities.removeWhitespace(utilities.extractQuestion(curFaq.answer))
        let diffAnswer = utilities.removeWhitespace(latestRevision.answerBody) != utilities.removeWhitespace(utilities.extractAnswer(curFaq.answer))

        // check if modified
        let isModified = diffQuestion || diffAnswer

        // if different then push new revision {question, answerBody, date} (using today's late)
        if (isModified) {
            history.revisions.push(curRevItem)
        }

    });

    // build output
    let contents = JSON.stringify(revisions, null, 4);
    await utilities.writeFile("_data/revisions.jsonc", contents)
}

/* Desired Output */
// {
//     "id": 4723,
//     "revisions": [
//       {
//         "question": "What is the correct way to wear a face mask or covering?",
//         "answerBody": "As of August 1, you are required to wear a face mask or covering in public spaces in Vermont any time it is not possible to keep a 6-foot from others who are not part your household. This includes both indoor and outdoor public spaces and group living settings (for example, long-term care facilities, nursing homes, apartment and condo complexes).\n\nWearing face masks or coverings helps keep people from spreading the virus. This is because the virus can spread even if a person does not have any symptoms. \n\nIn addition to wearing cloth face masks or coverings, everyone should keep a 6-foot distance from others, wash their hands often, and stay home if they are sick.\n\nA face mask or covering must be worn properly to be effective and avoid the spread of germs:\n\n*   Wash your hands before putting it on.\n*   Be sure your mouth and nose are covered.\n*   Hook loops around your ears or tie it snugly.\n*   Do not touch it or pull it down while in public.\n*   Keep it on until you get home.\n*   Remove it without touching your eyes, nose or mouth, then wash your hands immediately.\n*   Wash it and make sure it’s completely dry before using again. Have a few on hand so you can rotate for washing.\n\nIf you feel like you are overheating and are having trouble breathing because it is hot outside, you should take off your mask, drink water, rest and seek shade or a cool place. It is important that you keep a 6-foot distance from others whenever possible, especially when you are not wearing a mask.\n\nLearn more about [using cloth face masks or coverings to help slow the spread of COVID-19](https://www.healthvermont.gov/sites/default/files/documents/pdf/COVID-19-VDH-mask-guidance.pdf) and [face coverings for children](https://www.healthvermont.gov/sites/default/files/documents/pdf/COVID19-childfacecovering.pdf).",
//         "date": "2020-07-27"
//       },
//       {
//         "question": "What is the correct way to wear a face mask or covering?",
//         "answerBody": "As of August 1, you are required to wear a face mask or covering in public spaces in Vermont any time it is not possible to keep a 6-foot distance from others who are not part your household. This includes both indoor and outdoor public spaces and group living settings (for example, long-term care facilities, nursing homes, apartment and condo complexes).\n\nWearing face masks or coverings helps keep people from spreading the virus. This is because the virus can spread even if a person does not have any symptoms.\n\nIn addition to wearing cloth face masks or coverings, everyone should keep a 6-foot distance from others, wash their hands often, and stay home if they are sick.\n\nA face mask or covering must be worn properly to be effective and avoid the spread of germs:\n\n*   Wash your hands before putting it on.\n*   Be sure your mouth and nose are covered.\n*   Hook loops around your ears or tie it snugly.\n*   Do not touch it or pull it down while in public.\n*   Keep it on until you get home.\n*   Remove it without touching your eyes, nose or mouth, then wash your hands immediately.\n*   Wash it and make sure it’s completely dry before using again. Have a few on hand so you can rotate for washing.\n\nIf you feel like you are overheating and are having trouble breathing because it is hot outside, you should take off your mask, drink water, rest and seek shade or a cool place. It is important that you keep a 6-foot distance from others whenever possible, especially when you are not wearing a mask.\n\nLearn more about [using cloth face masks or coverings to help slow the spread of COVID-19](https://www.healthvermont.gov/sites/default/files/documents/pdf/COVID-19-VDH-mask-guidance.pdf) and [face coverings for children](https://www.healthvermont.gov/sites/default/files/documents/pdf/COVID19-childfacecovering.pdf).",
//         "date": "2020-07-29"
//       },
//       {
//         "question": "What is the correct way to wear a face mask or covering?",
//         "answerBody": "As of August 1, you are required to wear a face mask or covering in public spaces in Vermont any time it is not possible to keep a 6-foot distance from others who are not part of your household. This includes both indoor and outdoor public spaces ((for example, businesses, public buildings, parks) and group living settings (for example, long-term care facilities, nursing homes, apartment and condo complexes).\n\nIn private settings with people you don’t live with (for example, at a gathering with family and friends in your backyard or riding in a car), we recommend that you wear a face mask or covering when it’s not possible to stay 6 feet apart.\n\nWearing face masks or coverings helps keep people from spreading the virus. This is because the virus can spread even if a person does not have any symptoms.\n\nIn addition to wearing face masks or coverings, everyone should keep a 6-foot distance from others, wash their hands often, and stay home if they are sick.\n\nA face mask or covering must be worn properly to be effective and avoid the spread of germs:\n\n*   Wash your hands before putting it on.\n*   Be sure your mouth and nose are covered.\n*   Hook loops around your ears or tie it snugly.\n*   Do not touch it or pull it down while in public.\n*   Keep it on until you get home.\n*   Remove it without touching your eyes, nose or mouth, then wash your hands immediately.\n*   Wash it and make sure it’s completely dry before using again. Have a few on hand so you can rotate for washing.\n\nIf you feel like you are overheating and are having trouble breathing because it is hot outside, you should take off your mask, drink water, rest and seek shade or a cool place. It is important that you keep a 6-foot distance from others whenever possible, especially when you are not wearing a mask.\n\nLearn more about [wearing face masks to keep COVID-19 from spreading](https://www.healthvermont.gov/sites/default/files/documents/pdf/COVID-19-VDH-mask-guidance.pdf) and [face coverings for children](https://www.healthvermont.gov/sites/default/files/documents/pdf/COVID19-childfacecovering.pdf).",
//         "date": "2020-08-04"
//       }
//     ]
//   },