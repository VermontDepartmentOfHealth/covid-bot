const fs = require("fs")
const fsp = require('fs').promises;
const path = require("path")

// get command line args
const { program } = require('commander');
program
    .requiredOption('-t, --target <value>', 'destination path')
    .parse(process.argv);

// call main function
main()

async function main() {
    // get local site path
    let projectRoot = __dirname.replace(/(cli|util)$/, "")
    let sitePath = `${projectRoot}_site\\`

    // overwrite files in target path
    copyDir(sitePath, program.target)
}



// https://stackoverflow.com/a/22185855/1366033
function copyRecursiveSync(src, dest) {
    let exists = fs.existsSync(src);
    let stats = exists && fs.statSync(src);
    let isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        try {
            fs.mkdirSync(dest);
        } catch (error) {
            if (error.code != 'EEXIST') console.log(error)
        }
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};