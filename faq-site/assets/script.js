var keywordInput = document.querySelector("#search");
var searchArea = document.querySelector(".topics")
var markInstance = new Mark(searchArea);


var sendAnalytics = function() {
    // https://stackoverflow.com/a/61241460/1366033
    gtag('config', 'UA-52251621-2', {
        'page_title': 'FAQ Search',
        'page_path': '/COVID/faq/?searchText=' + encodeURI(keywordInput.value)
    });
}
var sendAnalyticsDebounced = debounce(sendAnalytics, 2500)


keywordInput.addEventListener("input", performMark);

keywordInput.addEventListener("input", sendAnalyticsDebounced);


/**
 * Debounce Function Generator
 * @param {func} func the function you would ultimately like invoked
 * @param {number} delay the wait time before executing
 * @returns {func} debouncedFunction that you can call
 * @description https://stackoverflow.com/a/61241621/1366033
 */
function debounce(func, delay) {
    var timeoutId

    return function() {

        var context = this
        var args = arguments

        clearTimeout(timeoutId)

        timeoutId = setTimeout(function() {
            return func.apply(context, args)
        }, delay)
    }
}



function debounce(func, wait) {
    var timeoutId;

    return function() {
        var context = this,
            args = arguments;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
};





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
        let matchTitle = el.closest("h2")
        let matchType = matchTitle ? "match-title" : "match-body"

        var faqItem = el.closest(".faq")
        if (faqItem) {
            faqItem.classList.add("marked")
            faqItem.classList.add(matchType)
        }

        var subItem = el.closest(".sub")
        if (subItem) {
            subItem.classList.add("marked")
            subItem.classList.add(matchType)
        }

        var topicItem = el.closest(".topic")
        if (topicItem) {
            topicItem.classList.add("marked")
            topicItem.classList.add(matchType)
        }

    })

    // add no match
    document.body
        .classList
        .toggle('no-results', !matches.length)



    // document
    //     .querySelectorAll(".match-title")
    //     .forEach(function(el) {
    //         searchArea.prepend(el)
    //     })

}