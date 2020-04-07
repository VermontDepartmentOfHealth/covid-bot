# COVID FAQ

## Built With

- [11ty/Eleventy](https://www.11ty.io) - static site generation
- [nunjucks](https://mozilla.github.io/nunjucks/) - templating

## Project Setup

- Install [Node.js & NPM](https://nodejs.org/en/download/)
- Run `npm install` in the project directory to install local dependencies
- Run `npm run serve` to run a local dev environment
- Access dev copy of the site at [localhost:8080](http://localhost:8080)

## NPM Scripts

```bash
npm run build             # runs `npx eleventy` to build the site
npm run serve             # builds site + serves `_site` directory
npm run update-data       # gets KB data and updates _data directory
npm run update-and-build  # gets new KB data and builds site
```

## // TODO



- [x] update data live api
- [ ] get primary question from answer markdown
- [ ] filter out "This did not answer my question"
- [ ] categorization
- [ ] add toc overview
- [ ] add synonms to mark.js
- [ ] low-perf debouncing
- [ ] conditionally hide alt phrasings when not search hits
- [ ] expand / collapse all
- [ ] social meta tags
- [ ] determine multiple env for config (workaround comment out)
- [x] figure out async await for fs.writeFile
- [ ] show revision history
- [x] fix mark.js failing
- [x] fix encoding â€™
