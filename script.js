(() => {
  const prompts = Array.from(document.querySelectorAll(".prompt"));

  if (!prompts.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let nextPromptIndex = 0;
  let isTyping = false;
  let lastScrollY = window.scrollY;
  let ticking = false;

  function typePrompt(prompt) {
    if (isTyping) return;

    const target = prompt.querySelector(".typed");
    const cursor = prompt.querySelector(".cursor");
    const text = prompt.dataset.text || "";

    if (!target) return;

    isTyping = true;

    if (prefersReducedMotion) {
      target.textContent = text;

      if (cursor) {
        cursor.style.display = "none";
      }

      isTyping = false;
      nextPromptIndex++;
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
          nextPromptIndex++;

          // IMPORTANT:
          // Do not automatically trigger the next prompt.
          // The reader must scroll again.

        }, 500);

        return;
      }

      const character = text[index];

      target.textContent += character;
      index++;

      let delay = 28 + Math.random() * 32;

      if (/[.,?!:;]/.test(character)) {
        delay += 80 + Math.random() * 100;
      }

      window.setTimeout(typeNextCharacter, delay);
    }

    typeNextCharacter();
  }

  function checkNextPrompt() {
    if (isTyping) return;

    const prompt = prompts[nextPromptIndex];

    if (!prompt) return;

    const rect = prompt.getBoundingClientRect();

    const triggerPoint = window.innerHeight * 0.75;

    if (
      rect.top <= triggerPoint &&
      rect.bottom > 0
    ) {
      typePrompt(prompt);
    }
  }

  function handleScroll() {
    const currentScrollY = window.scrollY;

    const scrollingDown = currentScrollY > lastScrollY;

    lastScrollY = currentScrollY;

    if (!scrollingDown) {
      return;
    }

    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(() => {
      checkNextPrompt();
      ticking = false;
    });
  }

  window.addEventListener("scroll", handleScroll, {
    passive: true
  });
})();