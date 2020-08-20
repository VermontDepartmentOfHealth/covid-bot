#!/usr/bin/env node

const inquirer = require('inquirer');
const { program } = require('commander');
const { version } = require("../package.json")

const ENVIRONMENT_VALUES = ['test', 'prod']


main()

async function main() {

    // list all commands
    program
        .command('interactive', { isDefault: true })
        .description('interactive inquirer CLI')
        .action(async(cmd) => {

            let questions = [{
                type: 'list',
                name: 'cmd',
                message: 'Choose a command to run',
                loop: false,
                pageSize: 13,
                choices: [
                    "help",
                    new inquirer.Separator(),
                    "publish-kb", "fetch-kb", "deploy-kb", "restore-kb",
                    new inquirer.Separator(),
                    "archive-data", "lint-data", "list-changes", "fix-data",
                    new inquirer.Separator(),
                    "deploy-faq"
                ]
            }, ];

            let answers = await inquirer.prompt(questions)

            await program.parseAsync([...process.argv, answers.cmd]);
        })

    /* publish-kb */
    program
        .command('publish-kb [environment]')
        .description('publishes the knowledge base from edit index to bot index')
        .action(async(environment, cmd) => {
            let publishKB = require("./publishKB")
            let params = await getParamEnv(environment)
            publishKB(params.environment)
        })

    /* fetch-kb */
    program
        .command('fetch-kb [environment]')
        .description('downloads the knowledge base from the targeted environment')
        .action(async(environment, cmd) => {
            let fetchKb = require("./fetchKB")
            let params = await getParamEnv(environment)
            fetchKb(params.environment)
        })

    /* deploy-kb */
    program
        .command('deploy-kb [source] [target]')
        .description('deploys knowledge base from one environment to another')
        .action(async(source, target, cmd) => {
            let deployKb = require("./deployKB")
            let params = await getParamSrcTgt(source, target)
            deployKb(params.source, params.target)
        })

    /* restore-kb */
    program
        .command('restore-kb [environment]')
        .description('downloads the knowledge base from the targeted environment')
        .action(async(environment, cmd) => {
            let restoreKB = require("./restoreKB")
            let params = await getParamEnv(environment)
            restoreKB(params.environment)
        })

    /* archive-data */
    program
        .command('archive-data')
        .description('moves local faq file into the archive file')
        .action((cmd) => {
            require("./archiveData")()
        })

    /* lint-data */
    program
        .command('lint-data')
        .description('validates data and checks for common errors')
        .action((cmd) => {
            require("./lintData")()
        })

    /* list-changes */
    program
        .command('list-changes')
        .description('lists changes to questions - deleted, new, and title changes')
        .action((cmd) => {
            require("./listChanges")()
        })

    /* list-questions */
    program
        .command('list-questions')
        .description('lists all faq questions')
        .action((cmd) => {
            require("./listQuestions")()
        })

    /* fix-data */
    program
        .command('fix-data')
        .description('automatically fix inconsistencies in follow up prompts')
        .action((cmd) => {
            require("./fixData")()
        })

    /* deploy-faq */
    program
        .command('deploy-faq [path]')
        .description('publish local _site to deployment path')
        .action(async(path, cmd) => {
            let deployFaq = require("./deployFaq")
            let params = await getParamPath(path)
            deployFaq(params.path)
        })

    /* global options and start */
    await program
        .name("faq-cli")
        .version(version)
        .parseAsync(process.argv);

}

async function getParamEnv(environment) {

    let questions = [],
        answers = {}

    // determine which questions we need to ask
    if (!environment) {
        questions.push({ type: 'list', name: 'environment', message: 'target environment', choices: ENVIRONMENT_VALUES, default: "test" })
    }

    // ask them
    if (questions.length) {
        answers = await inquirer.prompt(questions)
    }

    // merge answers
    let params = {
        environment: environment || answers.environment
    }

    return params
}


async function getParamPath(path) {

    let questions = [],
        answers = {}

    // determine which questions we need to ask
    if (!path) {
        questions.push({ type: 'input', name: 'path', message: 'the destination path for the static site files' })
    }

    // ask them
    if (questions.length) {
        answers = await inquirer.prompt(questions)
    }

    // merge answers
    let params = {
        path: path || answers.path
    }

    return params
}

async function getParamSrcTgt(source, target) {

    let questions = [],
        answers = {}

    // determine which questions we need to ask
    if (!source) {
        questions.push({ type: 'list', name: 'source', message: 'source environment', choices: ["test", "prod"], default: "test" })
    }
    if (!target) {
        questions.push({ type: 'list', name: 'target', message: 'target environment', choices: ["test", "prod"], default: "prod" })
    }

    // ask them
    if (questions.length) {
        answers = await inquirer.prompt(questions)
    }

    // merge answers
    let params = {
        source: source || answers.source,
        target: target || answers.target
    }

    return params
}