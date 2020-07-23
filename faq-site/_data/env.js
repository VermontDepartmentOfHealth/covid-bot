const dotenv = require('dotenv')
module.exports = function() {
    let ELEVENTY_ENV = process.env.ELEVENTY_ENV || "test"
    let result = dotenv.config({ path: `.env.${ELEVENTY_ENV}` })
    let output = {...result.parsed, ELEVENTY_ENV }
    return output
}