/*
 * Keep prompt headings visually consistent across the notes. Legacy files use
 * level-two prompt headings; a few hand-edited pages use level-three prompts.
 */
document.addEventListener("DOMContentLoaded", () => {
  const normalize = (value) => value.replace(/\s+/g, " ").trim().toLowerCase();
  const isSupportingLabel = (value) => [
    "answer",
    "code example",
    "useful links",
    "useful links / diagrams",
    "key takeaway",
  ].includes(value);

  document.querySelectorAll(".md-content h3").forEach((heading) => {
    const label = normalize(heading.textContent);

    if (label === "question" || label.startsWith("question (")) {
      const prompt = heading.nextElementSibling;
      if (prompt && prompt.tagName === "P") {
        heading.innerHTML = prompt.innerHTML;
        prompt.remove();
      }
      heading.classList.add("study-question");
      return;
    }

    if (label === "answer") {
      heading.classList.add("study-answer-label");
      return;
    }

    if (label === "code example") {
      heading.textContent = "Example";
      heading.classList.add("study-supporting-heading");
      return;
    }

    if (label === "useful links" || label === "useful links / diagrams") {
      heading.textContent = "Further reading";
      heading.classList.add("study-supporting-heading");
      return;
    }

    if (label === "key takeaway") {
      heading.classList.add("study-takeaway-label");
    }
  });

  // Hand-edited pages use the prompt as a level-three heading.
  document.querySelectorAll(".md-content h3").forEach((heading) => {
    const label = normalize(heading.textContent);
    if (
      !heading.classList.length &&
      !isSupportingLabel(label) &&
      label.length > 12
    ) {
      heading.classList.add("study-question");
    }
  });

  // In the standardized files, a prompt is an H2 followed by its answer;
  // category headings are followed by a divider or another heading instead.
  document.querySelectorAll(".md-content h2").forEach((heading) => {
    const next = heading.nextElementSibling;
    const text = heading.textContent.trim();
    const looksLikePrompt = /\?$|^(what|why|how|when|where|which|who|explain|compare|describe|difference)\b|\b(vs\.?|scenario)\b/i.test(text);
    if (looksLikePrompt && next && next.tagName !== "HR") {
      heading.classList.add("study-question");
    }
  });
});
