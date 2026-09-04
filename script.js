(() => {
    /* ============================================================
       GOOD NEW NEON
       Scroll-triggered typing animation
       ============================================================ */

    const prompts = Array.from(document.querySelectorAll(".prompt"));

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let nextPromptIndex = 0;
    let isTyping = false;
    let lastScrollY = window.scrollY;
    let ticking = false;

    function typePrompt(prompt) {
        if (isTyping) {
            return;
        }

        const target = prompt.querySelector(".typed");
        const cursor = prompt.querySelector(".cursor");
        const text = prompt.dataset.text || "";

        if (!target) {
            return;
        }

        isTyping = true;

        if (prefersReducedMotion) {
            target.textContent = text;

            if (cursor) {
                cursor.style.display = "none";
            }

            isTyping = false;
            nextPromptIndex += 1;

            return;
        }

        let index = 0;

        function typeNextCharacter() {
            if (index >= text.length) {
                window.setTimeout(() => {
                    if (cursor) {
                        cursor.style.display = "none";
                    }

                    isTyping = false;
                    nextPromptIndex += 1;

                    /*
                       Do NOT automatically trigger the next prompt.

                       The reader must scroll again before the next
                       prompt begins typing.
                    */

                }, 500);

                return;
            }

            const character = text[index];

            target.textContent += character;
            index += 1;

            let delay = 28 + Math.random() * 32;

            /*
               Slightly longer pauses after punctuation make the
               typing feel more natural.
            */

            if (/[.,?!:;]/.test(character)) {
                delay += 80 + Math.random() * 100;
            }

            window.setTimeout(typeNextCharacter, delay);
        }

        typeNextCharacter();
    }


    /* ============================================================
       CHECK WHETHER THE NEXT PROMPT HAS REACHED THE TRIGGER POINT
       ============================================================ */

    function checkNextPrompt() {
        if (isTyping) {
            return;
        }

        const prompt = prompts[nextPromptIndex];

        if (!prompt) {
            return;
        }

        const rect = prompt.getBoundingClientRect();

        /*
           The prompt begins typing when its top reaches
           approximately 75% of the viewport height.
        */

        const triggerPoint = window.innerHeight * 0.75;

        if (
            rect.top <= triggerPoint &&
            rect.bottom > 0
        ) {
            typePrompt(prompt);
        }
    }


    /* ============================================================
       CURSOR VISIBILITY
       ============================================================ */

    const cursors = Array.from(
        document.querySelectorAll(".cursor")
    );

    if ("IntersectionObserver" in window) {
        const cursorObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    const cursor = entry.target;

                    /*
                       Once a prompt has finished typing its cursor
                       is permanently hidden.
                    */

                    if (cursor.style.display === "none") {
                        return;
                    }

                    /*
                       Make the cursor active while it is near the
                       visible area.
                    */

                    cursor.classList.toggle(
                        "is-nearby",
                        entry.isIntersecting
                    );
                });
            },
            {
                root: null,
                rootMargin: "180px 0px",
                threshold: 0
            }
        );

        cursors.forEach(cursor => {
            cursorObserver.observe(cursor);
        });
    }


    /* ============================================================
       DOWNWARD SCROLL TRIGGER
       ============================================================ */

    function handleScroll() {
        const currentScrollY = window.scrollY;

        const scrollingDown =
            currentScrollY > lastScrollY;

        lastScrollY = currentScrollY;

        /*
           Scrolling upward must NOT trigger another prompt.
        */

        if (!scrollingDown) {
            return;
        }

        /*
           Prevent lots of scroll events from running the test
           simultaneously.
        */

        if (ticking) {
            return;
        }

        ticking = true;

        window.requestAnimationFrame(() => {
            checkNextPrompt();
            ticking = false;
        });
    }

    if (prompts.length) {
        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true
            }
        );
    }


    /* ============================================================
       MACHINE-AUGMENTED ALMOSTS
       Automatic book pagination
       ============================================================ */

    const paperWorld = document.querySelector(".paper-world");
    const originalPage = document.querySelector(".book-page");

    if (!paperWorld || !originalPage) {
        return;
    }

    /*
       Keep an untouched copy of the original content.

       This lets us rebuild the pages when the browser is resized
       without losing any paragraphs.
    */

    const originalContent = originalPage.cloneNode(true);


    /* ============================================================
       CREATE A BOOK PAGE
       ============================================================ */

    function createPage(pageNumber) {
        const page = document.createElement("article");
        page.className = "book-sheet";

        const content = document.createElement("div");
        content.className = "book-sheet-content";

        const number = document.createElement("div");
        number.className = "book-page-number";
        number.textContent = pageNumber;
        number.setAttribute("aria-hidden", "true");

        page.appendChild(content);
        page.appendChild(number);

        return page;
    }


    /* ============================================================
       CHECK WHETHER A PAGE IS FULL
       ============================================================ */

    function pageOverflows(page) {
        const content =
            page.querySelector(".book-sheet-content");

        return (
            content.scrollHeight >
            content.clientHeight + 1
        );
    }


    /* ============================================================
       PAGINATE THE BOOK
       ============================================================ */

    function paginateBook() {

        /*
           On small screens allow normal continuous flow.

           Fixed-height pagination is primarily a desktop effect.
        */

     


        /*
           Collect the original content before clearing
           the paper world.
        */

        const source =
            originalContent.cloneNode(true);

        const opening =
            source.querySelector(".book-opening");

        const prose =
            source.querySelector(".book-prose");

        const notes =
            source.querySelector(".book-notes");

        paperWorld.innerHTML = "";

        const pagesContainer =
            document.createElement("div");

        pagesContainer.className = "book-pages";

        paperWorld.appendChild(pagesContainer);


        /*
           Create the first page.
        */

        let pageNumber = 1;

        let currentPage =
            createPage(pageNumber);

        let currentContent =
            currentPage.querySelector(
                ".book-sheet-content"
            );

        pagesContainer.appendChild(currentPage);


        /* ========================================================
           TITLE / OPENING
           ======================================================== */

        if (opening) {
    const openingClone = opening.cloneNode(true);

    /* Deliberate whitespace between title and algorithm */
    openingClone.style.paddingBottom = "2.5em";

    currentContent.appendChild(openingClone);
}


        /* ========================================================
           STORY
           ======================================================== */

        if (prose) {
            const elements =
                Array.from(prose.children);

            for (const element of elements) {

                const clone =
                    element.cloneNode(true);


                /*
                   Add manuscript whitespace to paragraphs
                   marked class="space-after".
                */

                if (
                    clone.classList.contains(
                        "space-after"
                    )
                ) {
                    clone.style.paddingBottom =
                        "1.2em";
                }


                /*
                   Add the element to the current page.
                */

                currentContent.appendChild(clone);


                /*
                   If it pushes the page beyond its available
                   height, move the whole element to the next page.
                */

                if (pageOverflows(currentPage)) {

                    currentContent.removeChild(
                        clone
                    );

                    pageNumber += 1;

                    currentPage =
                        createPage(pageNumber);

                    currentContent =
                        currentPage.querySelector(
                            ".book-sheet-content"
                        );

                    pagesContainer.appendChild(
                        currentPage
                    );

                    currentContent.appendChild(
                        clone
                    );
                }
            }
        }


        /* ========================================================
           FOOTNOTES
           ======================================================== */

        if (notes) {
            const notesClone =
                notes.cloneNode(true);

            currentContent.appendChild(
                notesClone
            );

            if (pageOverflows(currentPage)) {

                currentContent.removeChild(
                    notesClone
                );

                pageNumber += 1;

                currentPage =
                    createPage(pageNumber);

                currentContent =
                    currentPage.querySelector(
                        ".book-sheet-content"
                    );

                pagesContainer.appendChild(
                    currentPage
                );

                currentContent.appendChild(
                    notesClone
                );
            }
        }
    }


    /* ============================================================
       REPAGINATE WHEN WINDOW SIZE CHANGES
       ============================================================ */

    let resizeTimer;

    function handleResize() {
        window.clearTimeout(resizeTimer);

        resizeTimer = window.setTimeout(() => {
            paginateBook();
        }, 200);
    }


    /* ============================================================
       INITIALISE BOOK
       ============================================================ */

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            paginateBook();
        });
    } else {
        paginateBook();
    }

    window.addEventListener(
        "resize",
        handleResize
    );

})();