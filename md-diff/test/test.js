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

    it('should return diff inside parenthetical', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "if symptoms (fever or cough) develop"
        let newText = "if symptoms (fever, cough, or shortness of breath) develop"
        let expected = "if symptoms (fever<ins>, cough,</ins> or <del>cough</del> <ins>shortness of breath</ins>) develop" // "your <del>question</del> <ins>answer</ins>\n\n site"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });

    it('should handle commas after word', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "particularly older adults, working"
        let newText = "particularly older adults (65 years and older), working"
        let expected = "particularly older adults <ins>(65 years and older)</ins>, working"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });

    it('should remove linejunk and charjunk from ?', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "emergency case for"
        let newText = "emergency care for"
        let expected = "emergency <del>case</del> <ins>care</ins> for"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });

    it('should not display diff for capitalization only changes', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "Some people are at higher risk"
        let newText = "According to the CDC, some people are at higher risk"
        let expected = "<ins>According to the CDC,</ins> some people are at higher risk"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });

    it('should not span insert or delete tags across line breaks', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "First Line"
        let newText = "First Line\n\nSecond Line"
        let expected = "<p>First Line <ins></ins></p>\n<p><ins> Second Line</ins></p>\n"

        // act
        let actual = diffText(oldText, newText, true)

        // asset
        assert.equal(actual, expected);
    });



    it('should not include quote as new word', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "the Stay Home, Stay Safe Executive"
        let newText = "the “Stay Home, Stay Safe” Executive Order"
        let expected = "the <ins>“</ins>Stay Home, Stay Safe<ins>”</ins> Executive <ins>Order</ins>"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });



    it('should preserve hyperlink when text modified', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "go to [link info](https://example.com) and"
        let newText = "go to [link new text here](https://example.com) and"
        let expected = "go to [link <del>info</del> <ins>new text here</ins>](https://example.com) and"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });


    it('should not tokenize individual elements of a hyperlink', function() {
        // arrange
        let diffText = require("../src/index")
        let oldText = "bare url https://example.com for more info"
        let newText = "bare url https://newval.com for more info"
        let expected = "bare url <del>https://example.com</del> <ins>https://newval.com</ins> for more info"

        // act
        let actual = diffText(oldText, newText, false)

        // asset
        assert.equal(actual, expected);
    });




});