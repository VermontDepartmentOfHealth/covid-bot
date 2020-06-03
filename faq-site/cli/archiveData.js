module.exports = main();

async function main() {

    await archiveFaqs()

}

async function archiveFaqs() {
    const { readJsonc, writeFile } = require('../util/utilities')

    let faqs = await readJsonc("_data/faqs.jsonc")

    let contents = JSON.stringify(faqs, null, 4);

    await writeFile("_data/faqs-prev.jsonc", contents)
}