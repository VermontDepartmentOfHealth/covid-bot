# COVID FAQ

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
npm run build             # runs `npx eleventy` to build the site
npm run serve             # builds site + serves `_site` directory
npm run update-data       # gets KB data and updates _data directory
npm run update-and-build  # gets new KB data and builds site
```

## // TODO

- [ ] #26 update timestamp from KB modified time, not build time #26
- [ ] #24 add linter
- [ ] add subcategories
- [ ] add back to top button / remove filter
- [ ] fix [tel:211]
- [ ] reset position when clearing filter
- [ ] #25 add synonyms to mark.js
- [ ] #18 add toc overview
- [ ] #17 expand / collapse all
- [ ] #20 low-perf debouncing
- [ ] #18 show revision history
- [ ] #22 add telemetry from search terms
- [ ] social meta tags
- [ ] determine multiple env for config (workaround comment out)
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
