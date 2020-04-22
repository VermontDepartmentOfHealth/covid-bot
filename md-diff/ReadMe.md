## About

A diffing implementation for comparing & returning markdown text deltas

Wraps [difflib](https://www.npmjs.com/package/difflib) and provides deltas as text via [demarcating edits](https://developer.mozilla.org/en-US/docs/Web/HTML/Element#Demarcating_edits) tags:

* [`<ins>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ins)
* [`<del>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/del)

### Example

**`oldText`**: `your question site`  
**`newText`**: `your answer site`  
**`output`**: `your <del>question</del> <ins>answer</ins> site`  

## Installation

Install [on npm](https://www.npmjs.com/package/@ads-vdh/md-diff)

```bash
npm install @ads-vdh/md-diff --save
```

## Usage

```js
let diffText = require("@ads-vdh/md-diff")

let oldText = "your question site"
let newText = "your answer site"

let output = diffText(oldText, newText, false)

console.log(output)
// "your <del>question</del> <ins>answer</ins> site"
```
