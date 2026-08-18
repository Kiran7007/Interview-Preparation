/*
 * Legacy notes use a repeated "Question" / "Answer" heading pair. Convert
 * that machine-like pattern into a study-friendly card at render time, while
 * keeping every Markdown file easy to edit as plain text.
 */
document.addEventListener("DOMContentLoaded", () => {
  const normalize = (value) => value.replace(/\s+/g, " ").trim().toLowerCase();

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
});
