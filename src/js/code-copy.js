"use strict";

function showCopyFeedback(button, message) {
  button.querySelector("[data-feedback]")?.remove();

  const feedback = document.createElement("span");
  feedback.dataset.feedback = "";
  feedback.setAttribute("role", "status");
  feedback.textContent = message;
  button.append(feedback);

  setTimeout(() => feedback.remove(), 1500);
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".code-copy");
  if (!button) {
    return;
  }

  const selector = button.dataset.clipboardTarget;
  const code = selector ? document.querySelector(selector) : null;
  if (!code) {
    showCopyFeedback(button, "コピーできませんでした");
    return;
  }

  try {
    await navigator.clipboard.writeText(code.textContent);
    showCopyFeedback(button, "コピーしました");
  } catch {
    showCopyFeedback(button, "コピーできませんでした");
  }
});
