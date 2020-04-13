var keywordInput = document.querySelector("#search");
var searchArea = document.querySelector(".topics")
var markInstance = new Mark(searchArea);

keywordInput.addEventListener("input", performMark);

function performMark() {

    // Read the keyword
    var keyword = keywordInput.value;

    var shouldFilter = keyword.length > 2

    // apply filtering class if we have a search term
    document.body
        .classList
        .toggle('filtering', shouldFilter)

    // resets?
    // document.querySelectorAll("[open]").forEach(function(el) {
    //     el.open = false;
    // })

    // Remove previous marked elements and mark
    // the new keyword inside the context
    markInstance.unmark({
        done: function() {

            if (shouldFilter) {

                markInstance.mark(keyword, {
                    done: markComplete,
                    separateWordSearch: false,
                    synonyms: synonyms // should be loaded by synonyms.js
                });

            }
        }
    });
};

function markComplete() {
    // reset all marked elements
    document
        .querySelectorAll(".marked")
        .forEach(function(el) {
            el.classList.remove("marked")
        })
    document
        .querySelectorAll(".match-title")
        .forEach(function(el) {
            el.classList.remove("match-title")
        })
    document
        .querySelectorAll(".match-body")
        .forEach(function(el) {
            el.classList.remove("match-body")
        })

    // tag all marked element parents
    var matches = document
        .querySelectorAll("mark")


    matches.forEach(function(el) {
        var faqItem = el.closest(".faq")

        if (faqItem) {
            faqItem.classList.add("marked")

            if (el.closest("h2")) {
                faqItem.classList.add("match-title")
            } else {
                faqItem.classList.add("match-body")
            }
        }

        var topicItem = el.closest(".topic")

        if (topicItem) {
            topicItem.classList.add("marked")

            if (el.closest("h2")) {
                topicItem.classList.add("match-title")
            } else {
                topicItem.classList.add("match-body")
            }
        }

    })

    // add no match
    document.body
        .classList
        .toggle('no-results', !matches.length)



    document
        .querySelectorAll(".match-title")
        .forEach(function(el) {
            searchArea.prepend(el)
        })

}