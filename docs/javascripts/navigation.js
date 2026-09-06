document.addEventListener("DOMContentLoaded", function () {

    function setupNavigation() {

        const sections = document.querySelectorAll(
            ".md-nav--primary > .md-nav__list > .md-nav__item--nested"
        );

        sections.forEach(function (section) {

            if (section.dataset.collapsibleInitialized) {
                return;
            }

            const link = section.querySelector(":scope > .md-nav__link");
            const childNav = section.querySelector(":scope > .md-nav");

            if (!link || !childNav) {
                return;
            }

            section.dataset.collapsibleInitialized = "true";

            // Create arrow
            const arrow = document.createElement("button");

            arrow.type = "button";
            arrow.className = "custom-nav-toggle";
            arrow.setAttribute("aria-expanded", "false");
            arrow.setAttribute("aria-label", "Expand section");
            arrow.textContent = "▶";

            // Put arrow inside the existing Material link
            link.prepend(arrow);

            // Start collapsed
            childNav.style.display = "none";

            function toggleSection(event) {

                event.preventDefault();
                event.stopPropagation();

                const expanded =
                    arrow.getAttribute("aria-expanded") === "true";

                arrow.setAttribute(
                    "aria-expanded",
                    String(!expanded)
                );

                arrow.setAttribute(
                    "aria-label",
                    expanded
                        ? "Expand section"
                        : "Collapse section"
                );

                arrow.textContent = expanded ? "▶" : "▼";

                childNav.style.display =
                    expanded ? "none" : "block";
            }

            // Arrow click
            arrow.addEventListener("click", toggleSection);

            // Title click
            link.addEventListener("click", function (event) {

                // Ignore arrow click because arrow already handles it
                if (event.target === arrow) {
                    return;
                }

                toggleSection(event);

            }, true);
        });
    }

    setupNavigation();
});