---
title: COVID FAQ Site Builder
permalink: /faq-site/
---

# COVID FAQ Site Builder

## Built With

- [11ty/Eleventy](https://www.11ty.io) - static site generation
- [nunjucks](https://mozilla.github.io/nunjucks/) - templating

## Project Setup

- Install [Node.js & NPM](https://nodejs.org/en/download/)
- Run `npm install` in the project directory to install local dependencies
- Run `npm run serve` to run a local dev environment
- Access dev copy of the site at [localhost:8080](http://localhost:8080)

### Environment Variables

Get the config info from someone who's worked on the project or from Azure

Create the environment files for any supported environment:

* <code>.env.<i>&lt;environment&gt;</i></code>
* `.env.test`
* `.env.prod`

Which contents like this, but replace with actual keys:

```ini
RuntimeEndpoint=https://***.azurewebsites.net
kbId=***
RuntimeApiKey=***
Endpoint=https://***.cognitiveservices.azure.com
OcpApimSubscriptionKey=***
environment=prod
```

Choose which environment file to use by setting an environemtn variable named `AZURE_ENVIRONMENT` before running.  You can set the value in the following locations:

* **Debug** - `.vscode/launch.json`
* **Run** - `package.json` > `scripts`


## NPM Scripts


```bash
# eleventy site
npm run clean
npm run build         # runs `npx eleventy` to build the site
npm run serve         # builds site + serves `_site` directory

# interactive cli
npm run faq-cli       # run interactive cli cmd with options
npm run cli-help      # get help info on available CLI commands

# knowledge base
npm run publish-kb    # publishes the knowledge base from edit index to bot index
npm run fetch-kb      # downloads the knowledge base from the targeted environment
npm run deploy-kb     # deploys knowledge base from one environment to another
npm run restore-kb    # makes incremental revisions to knowledge base from local faq file

# local data file
npm run archive-data  # moves local faq file into the archive file
npm run lint-data     # validates data and checks for common errors
npm run list-changes  # lists changes to questions - deleted, new, and title changes
npm run fix-data      # automatically fix inconsistencies in follow up prompts - upload via restore-kb

# publish site
npm run deploy-faq-test  # publish local _site folder to path on test
npm run deploy-faq-prod  # publish local _site folder to path on prod
npm run deploy-faq       # publish local _site to test and prod
```

Install the cli from the [`"bin"`](https://docs.npmjs.com/files/package.json#bin)  property in `package.json` with the following command:

```bash
npm i ./ -g
```

Then you can invoke via:

```bash
faq-cli
```

## Deployment

### FAQ Site


1. Verify latest changes are pulled in from source control

    ```bash
    git checkout master
    git pull
    ```

2. Ensure updates were published

    ```bash
    npm run publish-kb
    ```

3. Get latest knowledge base updates

    ```bash
    npm run fetch-kb
    ```

4. Archive previous data

    ```bash
    npm run archive-data
    ```

5. Check for any common problems

    ```bash
    npm run lint-data
    ```

6. Test site build and review differences in /diff.html

    ```bash
    npm run serve
    ```

7. **If there are validation issues**, fix them in QnA maker and redo steps 3-6 until the toothpick comes out clean

8. Deploy static files to test and prod environments

    ```bash
    npm run deploy-faq
    ```

### Knowledge Base

Move the KB changes from the test environment to production

```bash
npm run deploy-kb
```

## // TODO

- [ ] script site publish
- [ ] Don't display Empty subcategory
- [ ] check for follow-up prompt generated duplicates (leviathan distance?)
- [ ] only write synonyms if file's changed
- [ ] #18 show revision history
- [ ] #26 update timestamp from KB modified time, not build time #26
- [ ] #37 add toggle for TOC on mobile
- [ ] #17 expand / collapse all
- [ ] #20 low-perf debouncing
- [ ] add deep links to filter and each fragment URI
- [ ] sort title vs body match & reset position when clearing filter
- [ ] fix [tel:211]
- [ ] social meta tags
- [ ] determine multiple env for config (workaround comment out)
- [x] contain page action buttons to main area when scrolled to bottom
- [x] #49 add remove filter button
- [x] fix focus styles
- [x] #39 add back to top button
- [x] #40 guarantee unique IDs for subcategories
- [x] handle no js
- [x] subcategories sort override (symptoms, sick, monitor)
- [x] add tooltip to abbreviations
- [x] title case subcategories
- [x] rename category abbrev (VT -> Vermont)
- [x] #36 polyfill summary detail
- [x] #24 add linter
- [x] add subcategories
- [x] #25 add synonyms to mark.js
- [x] #18 add toc overview
- [x] #22 add telemetry from search terms
- [x] add VDH logo / branding
- [x] test for questions missing a category
- [x] add timestamp
- [x] add topics
- [x] filter out "This did not answer my question"
- [x] figure out async await for fs.writeFile
- [x] update data live api
- [x] fix mark.js failing
- [x] fix encoding â€™
- [x] get primary question from answer markdown
- [x] conditionally hide alt phrasings when not search hits
