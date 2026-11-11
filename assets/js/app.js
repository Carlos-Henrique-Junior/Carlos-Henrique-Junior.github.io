(() => {
  const root = document.documentElement;
  const languageToggle = document.getElementById("language-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  let activeLanguage = "pt";

  function readPreference(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function savePreference(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Keep the page usable when browser storage is disabled.
    }
  }

  function syncThemeToggleLabel() {
    if (!themeToggle) return;
    const label = activeLanguage === "pt" ? "Tema escuro" : "Dark theme";
    themeToggle.setAttribute("aria-label", label);
  }

  function applyLanguage(language) {
    activeLanguage = language === "en" ? "en" : "pt";
    root.lang = activeLanguage === "en" ? "en" : "pt-BR";

    document.querySelectorAll("[data-pt][data-en]").forEach((element) => {
      element.textContent = element.dataset[activeLanguage];
    });
    document.querySelectorAll("[data-aria-pt][data-aria-en]").forEach((element) => {
      const label = element.getAttribute(`data-aria-${activeLanguage}`);
      if (label) element.setAttribute("aria-label", label);
    });
    document.querySelectorAll("[data-alt-pt][data-alt-en]").forEach((element) => {
      const alt = element.getAttribute(`data-alt-${activeLanguage}`);
      if (alt !== null) element.setAttribute("alt", alt);
    });

    const description = document.querySelector("meta[name='description'][data-description-pt][data-description-en]");
    if (description) {
      const content = description.getAttribute(`data-description-${activeLanguage}`);
      if (content) description.setAttribute("content", content);
    }

    if (languageToggle) {
      languageToggle.textContent = activeLanguage === "pt" ? "EN" : "PT";
      languageToggle.setAttribute(
        "aria-label",
        activeLanguage === "pt" ? "Mudar idioma para inglês" : "Switch language to Portuguese",
      );
    }
    syncThemeToggleLabel();
    savePreference("portfolio-language", activeLanguage);
  }

  function applyTheme(theme) {
    const activeTheme = theme === "dark" ? "dark" : "light";
    root.dataset.theme = activeTheme;
    if (themeToggle) {
      const isDark = activeTheme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      const glyph = themeToggle.querySelector(".theme-glyph");
      if (glyph) glyph.textContent = isDark ? "☼" : "◐";
    }
    syncThemeToggleLabel();
    savePreference("portfolio-theme", activeTheme);
  }

  const savedTheme = readPreference("portfolio-theme");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));
  applyLanguage(readPreference("portfolio-language") || "pt");

  languageToggle?.addEventListener("click", () => {
    applyLanguage(root.lang === "pt-BR" ? "en" : "pt");
  });

  themeToggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
