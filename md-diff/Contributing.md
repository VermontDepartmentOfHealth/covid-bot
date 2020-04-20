# Package Maintenance Info

Info for local developers to get the package up and running locally and publish it live

## Run package locally

1. In current package directory run `npm link`

   ```bash
   npm link
   ```

2. In the directory you want to consume the package, run the following:

   ```bash
   npm link @ads-vdh/md-diff
   ```

## Deployment

### Project Setup

```bash
npm config set scope ads-vdh
npm config set access public
```

### User Setup

Create an npm account and make sure you are added to [`ads-vdh`](https://www.npmjs.com/settings/ads-vdh/members) org account in order to publish

#### Login to npm using either of the methods

**A) Login to npm**

```bash
npm login
```

or

**B) For [multiple accounts](https://stackoverflow.com/a/50130282/1366033)**

Add `.npmrc` file in the current directory with the following info:

```ini
//registry.npmjs.org/:_authToken=***
```

### Publish Package

Revision version number in `package.json`

```bash
npm publish --access public
```

## Mocha Testing

* [MochaJS](https://mochajs.org/)
* [Debugging in Mocha in VS Code](https://codepunk.io/debugging-mocha-in-visual-studio-code/)

Each test should look something like this:

```js
it('should return del / ins on single word change', function() {
    // arrange
    let diffText = require("../src/index")
    let oldText = "your question site"
    let newText = "your answer site"
    let expected = "your <del>question</del> <ins>answer</ins> site"

    // act
    let actual = diffText(oldText, newText, false)

    // asset
    assert.equal(actual, expected);
});
```
