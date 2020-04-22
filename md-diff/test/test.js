var assert = require('assert');

// var tests = [
//     {scenario: "should return..", old: "your...", new: "...", expected: "..."},
//     {scenario: "should return..", old: "your...", new: "...", expected: "..."},
//     {scenario: "should return..", old: "your...", new: "...", expected: "..."}
// ]

// // sample text - should convert to unit test cases
// let oldText = "**Can I Travel** Travel - *Stack-Overflow* is a question\n\n site for professional and *enthusiast* programmers"
// let newText = "**Can I Travel Throughout the Country** Travel - *Stack-Overflow* is a answer\n\n site for enthusiast programmers like you"

// // example
// let result = diffText(oldText, newText, true)

describe('diffText', function() {

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

    it('should return insert when inserting single word', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "your question site"
        let newText = "your question answer site"
        let expected = "your question <ins>answer</ins> site"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });

    it('should return single insert tag when inserting multiple consecutive words', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "your question site"
        let newText = "your question and answer site"
        let expected = "your question <ins>and answer</ins> site"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });

    it('should return diff separately before newline', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "your question\n\n site"
        let newText = "your answer\n\n site"
        let expected = "your <del>question</del> <ins>answer</ins>\n\n site"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });
});