document.addEventListener("DOMContentLoaded", function () {

    const STORAGE_KEY = "mkdocs-expanded-sections";

    function getExpandedSections() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveExpandedSection(title, expanded) {
        const sections = getExpandedSections();

        sections[title] = expanded;

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(sections)
        );
    }

    function setupNavigation() {

        const sections = document.querySelectorAll(
            ".md-nav--primary > .md-nav__list > .md-nav__item--section"
        );

        const savedSections = getExpandedSections();

        sections.forEach(function (section) {

            const link = section.querySelector(
                ":scope > .md-nav__link"
            );

            const childNav = section.querySelector(
                ":scope > .md-nav"
            );

            if (!link || !childNav) {
                return;
            }

            /*
             * Avoid creating the arrow multiple times
             */
            let arrow = link.querySelector(
                ":scope > .custom-nav-toggle"
            );

            if (!arrow) {

                arrow = document.createElement("span");

                arrow.className = "custom-nav-toggle";
                arrow.setAttribute("aria-hidden", "true");

                link.prepend(arrow);
            }

            const title =
                section.querySelector(":scope > .md-nav__link")
                    ?.textContent
                    .replace("▶", "")
                    .replace("▼", "")
                    .trim();

            /*
             * Restore previous state
             */
            const expanded = savedSections[title] === true;

            childNav.style.display =
                expanded ? "block" : "none";

            arrow.textContent =
                expanded ? "▼" : "▶";

            /*
             * Prevent duplicate click listeners
             */
            if (link.dataset.clickInitialized === "true") {
                return;
            }

            link.dataset.clickInitialized = "true";

            /*
             * Entire section title is clickable
             */
            link.addEventListener("click", function (event) {

                event.preventDefault();
                event.stopPropagation();

                const currentlyExpanded =
                    childNav.style.display === "block";

                const newState = !currentlyExpanded;

                childNav.style.display =
                    newState ? "block" : "none";

                arrow.textContent =
                    newState ? "▼" : "▶";

                saveExpandedSection(
                    title,
                    newState
                );

            }, true);
        });
    }

    /*
     * Initial setup
     */
    setupNavigation();

    /*
     * Material for MkDocs instant navigation
     */
    if (typeof document$ !== "undefined") {

        document$.subscribe(function () {
            setupNavigation();
        });

    }
});