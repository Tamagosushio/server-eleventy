document.addEventListener("DOMContentLoaded", () => {
  const themeSwitcher = document.getElementById("theme-switcher");
  const html = document.documentElement;

  // Set initial theme from localStorage or system preference
  const currentTheme = localStorage.getItem("theme") || "light";
  html.setAttribute("data-theme", currentTheme);
  if (themeSwitcher) {
    themeSwitcher.textContent = currentTheme === "dark" ? "☀️" : "🌙";
  }

  if (themeSwitcher) {
    themeSwitcher.addEventListener("click", () => {
      const newTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      themeSwitcher.textContent = newTheme === "dark" ? "☀️" : "🌙";
    });
  }
});
