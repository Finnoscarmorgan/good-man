(() => {
  const prompts = Array.from(document.querySelectorAll(".prompt"));

  if (!prompts.length) {
    console.warn("Good Man: no .prompt elements were found.");
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let isTyping = false;
  const queue = [];

  function addToQueue(prompt) {
    if (
      prompt.dataset.started === "true" ||
      prompt.dataset.queued === "true"
    ) {
      return;
    }

    prompt.dataset.queued = "true";
    queue.push(prompt);

    processQueue();
  }

  function processQueue() {
    if (isTyping || queue.length === 0) {
      return;
    }

    const prompt = queue.shift();

    prompt.dataset.queued = "false";

    typePrompt(prompt);
  }

  function typePrompt(prompt) {
    if (prompt.dataset.started === "true") {
      processQueue();
      return;
    }

    const target = prompt.querySelector(".typed");
    const cursor = prompt.querySelector(".cursor");
    const text = prompt.dataset.text || "";

    if (!target) {
      processQueue();
      return;
    }

    prompt.dataset.started = "true";
    isTyping = true;

    if (prefersReducedMotion) {
      target.textContent = text;

      if (cursor) {
        cursor.style.display = "none";
      }

      isTyping = false;
      processQueue();
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
          processQueue();
        }, 500);

        return;
      }

      const character = text[index];

      target.textContent += character;
      index += 1;

      let delay = 28 + Math.random() * 32;

      if (/[.,?!:;]/.test(character)) {
        delay += 80 + Math.random() * 100;
      }

      window.setTimeout(typeNextCharacter, delay);
    }

    typeNextCharacter();
  }

  function checkPrompts() {
    const triggerPoint = window.innerHeight * 0.78;

    prompts.forEach((prompt) => {
      if (
        prompt.dataset.started === "true" ||
        prompt.dataset.queued === "true"
      ) {
        return;
      }

      const rect = prompt.getBoundingClientRect();

      if (rect.top <= triggerPoint && rect.bottom >= 0) {
        addToQueue(prompt);
      }
    });
  }

  let ticking = false;

  function requestCheck() {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(() => {
      checkPrompts();
      ticking = false;
    });
  }

  window.addEventListener("scroll", requestCheck, {
    passive: true,
  });

  window.addEventListener("resize", requestCheck);

  checkPrompts();
})();