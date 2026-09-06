document.addEventListener("DOMContentLoaded", function () {

    const STORAGE_KEY = "mkdocs-expanded-sections";

    function getExpandedSections() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || {};
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

            const toggle = section.querySelector(
                ":scope > .md-nav__toggle"
            );

            if (!link || !childNav || !toggle) {
                return;
            }

            /*
             * Create arrow only once
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

            /*
             * Get section title without arrow
             */
            const title = link.textContent
                .replace("▶", "")
                .replace("▼", "")
                .trim();

            /*
             * Restore saved state
             */
            const savedState =
                savedSections[title] === true;

            toggle.checked = savedState;

            /*
             * Keep desktop inline state synchronized
             */
            childNav.style.display =
                savedState ? "block" : "none";

            arrow.textContent =
                savedState ? "▼" : "▶";

            /*
             * Prevent duplicate listeners
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

                /*
                 * Material uses this checkbox to control
                 * nested navigation, especially on mobile.
                 */
                const expanded = !toggle.checked;

                toggle.checked = expanded;

                /*
                 * Desktop fallback
                 */
                childNav.style.display =
                    expanded ? "block" : "none";

                /*
                 * Arrow
                 */
                arrow.textContent =
                    expanded ? "▼" : "▶";

                /*
                 * Remember state
                 */
                saveExpandedSection(
                    title,
                    expanded
                );

            }, true);
        });
    }

    /*
     * Initial load
     */
    setupNavigation();

    /*
     * Material instant navigation
     */
    if (typeof document$ !== "undefined") {

        document$.subscribe(function () {
            setupNavigation();
        });
    }
});
