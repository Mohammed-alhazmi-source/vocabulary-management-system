export default (function () {
  const STORAGE_KEY = "theme";
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle-btn"); // theme-toggle-btn

  // Load saved preference and apply token set if present
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    root.setAttribute("data-theme", saved);
  }

  // Apply + persist + sync accessible state/label
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    btn.setAttribute("aria-pressed", String(theme === "dark")); // reflect state
  }

  // Initialize UI from current attribute or default to light
  applyTheme(root.getAttribute("data-theme") || "light");

  // Click handler flips theme
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });
})();
