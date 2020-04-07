var keywordInput = document.querySelector("#search");
var searchArea = document.querySelector(".faqs")
var markInstance = new Mark(searchArea);

keywordInput.addEventListener("input", performMark);

function performMark() {

    // Read the keyword
    var keyword = keywordInput.value;

    var shouldFilter = keyword.length > 2

    // apply filtering class if we have a search term
    searchArea
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
                    done: markComplete
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
    document
        .querySelectorAll("mark")
        .forEach(function(el) {
            var item = el.closest(".faq")

            if (item) {
                item.classList.add("marked")

                if (el.closest("h2")) {
                    item.classList.add("match-title")
                } else {
                    item.classList.add("match-body")
                }
            }

        })

    document
        .querySelectorAll(".match-title")
        .forEach(function(el) {
            searchArea.prepend(el)
        })

}