// remove no-js if we're able to execute
document.body.classList.remove("no-js")

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
        .querySelectorAll(".match-topic")
        .forEach(function(el) {
            el.classList.remove("match-topic")
        })
    document
        .querySelectorAll(".match-sub")
        .forEach(function(el) {
            el.classList.remove("match-sub")
        })
    document
        .querySelectorAll(".match-faq")
        .forEach(function(el) {
            el.classList.remove("match-faq")
        })
    document
        .querySelectorAll(".match-alt")
        .forEach(function(el) {
            el.classList.remove("match-alt")
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
        var matchTopic = el.closest("h2")
        var matchSub = el.closest("h3")
        var matchFaq = el.closest("h4")
        var matchAlt = el.closest(".alt-phrasings")
        var matchBody = el.closest(".answer")

        var matchType = matchTopic ? "match-topic" :
            matchSub ? "match-sub" :
            matchFaq ? "match-faq" :
            matchAlt ? "match-alt" :
            matchBody ? "match-body" : ""


        var faqContainer = el.closest(".faq")
        var subContainer = el.closest(".sub")
        var topicContainer = el.closest(".topic")


        if (faqContainer) {
            faqContainer.classList.add("marked")
            faqContainer.classList.add(matchType)
        }

        if (subContainer) {
            subContainer.classList.add("marked")
            subContainer.classList.add(matchType)
        }

        if (topicContainer) {
            topicContainer.classList.add("marked")
            topicContainer.classList.add(matchType)
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


var topBtn = document.getElementById("BackToTop")
topBtn.addEventListener('click', function() {
    window.scrollTo(0, 0)
});




var filterBtn = document.getElementById("RemoveFilter")
filterBtn.addEventListener('click', function() {
    keywordInput.value = "";
    performMark();
});



if (document.documentElement.matches(".no-details")) {

    document.body.addEventListener('click', function(e) {
        var inSummaryH4 = e.target.matches('summary > h4, summary > h4 *')
        if (inSummaryH4) {
            toggleDetailsEvent(e)
        }
    });
    document.body.addEventListener('keypress', function(e) {
        var enterKey = (e.keyCode || e.which) == 13
        var inSummary = e.target.matches('summary, summary *')
        if (enterKey & inSummary) { //Enter keycode
            toggleDetailsEvent(e)
        }
    });

    function toggleDetailsEvent(e) {

        let details = e.target.closest("details")

        let isOpen = details.getAttribute('open')

        if (isOpen) {
            details.removeAttribute('open')
        } else {
            details.setAttribute('open', 'open')
        }

    }
}