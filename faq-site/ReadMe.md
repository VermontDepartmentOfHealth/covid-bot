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

- [ ] add tooltip to abbrevations
- [x] title case subcategories
- [ ] subcategories sort override (symptoms, sick, monitor)
- [x] rename category abbrev (VT -> Vermont)
- [ ] #26 update timestamp from KB modified time, not build time #26
- [ ] #39 add back to top button / remove filter
- [ ] #37 add toggle for TOC on mobile
- [ ] #36 polyfill summary detail
- [ ] #40 guarantee unique IDs for subcategories
- [ ] fix [tel:211]
- [ ] reset position when clearing filter
- [ ] #17 expand / collapse all
- [ ] #20 low-perf debouncing
- [ ] #18 show revision history
- [ ] social meta tags
- [ ] determine multiple env for config (workaround comment out)
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
