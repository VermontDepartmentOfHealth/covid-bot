const fs = require("fs");
const jsoncParser = require("jsonc-parser")

let fullPath = `${__dirname}/topics.jsonc`;
let contents = fs.readFileSync(fullPath, "utf8")
let object = jsoncParser.parse(contents)

// jsonc adapter
module.exports = object