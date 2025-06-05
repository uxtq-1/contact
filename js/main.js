// js/main.js  – shared UI (language, theme, drawer, chatbot stub)
// js/main.js  – shared UI (language, theme, drawer, chatbot stub)
(() => {
  const $ = s => document.querySelector(s);

  /* LANGUAGE TOGGLE (EN / ES) */
  const langBtn = $("#lang-toggle");
  // Expose setLang globally for other scripts to call if needed (e.g., after dynamic content load)
  window.setAppLang = lang => {
    document.documentElement.lang = lang;

    // Swap textContent for elements with data-en / data-es
    document.querySelectorAll("[data-en][data-es]").forEach(el => {
      // Do not change <input>, <textarea>, <select>, or <option> here
      if (!["INPUT", "TEXTAREA", "SELECT", "OPTION"].includes(el.tagName)) {
        el.textContent = el.dataset[lang];
      }
    });

    // Swap placeholder for inputs and textareas
    document.querySelectorAll("input[data-en][data-es], textarea[data-en][data-es]").forEach(el => {
      el.placeholder = el.dataset[lang];
    });

    // Swap <option> text
    document.querySelectorAll("option[data-en][data-es]").forEach(el => {
      el.textContent = el.dataset[lang];
    });

    langBtn.textContent = lang === "en" ? "ES" : "EN";
    localStorage.setItem("lang", lang);
  };
  if (langBtn) {
    langBtn.addEventListener("click", () => window.setAppLang(document.documentElement.lang === "en" ? "es" : "en"));
    // Initial language set
    window.setAppLang(localStorage.getItem("lang") || "en");
  }

  /* THEME TOGGLE (LIGHT / DARK) */
  const themeBtn = $("#theme-toggle");
  const setTheme = t => {
    document.body.classList.toggle("dark", t === "dark");
    themeBtn.textContent = t === "dark" ? "Light" : "Dark";
    localStorage.setItem("theme", t);
  };
  if (themeBtn) {
    themeBtn.addEventListener("click", () => setTheme(document.body.classList.contains("dark") ? "light" : "dark"));
    setTheme(localStorage.getItem("theme") || "light");
  }

  /* MOBILE DRAWER */
  const openDrawer = () => $("#mobile-drawer").classList.add("open");
  const closeDrawer = () => $("#mobile-drawer").classList.remove("open");
  $("#menu-toggle")?.addEventListener("click", openDrawer);
  $("#drawer-close")?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => e.key === "Escape" && closeDrawer());

  /* CHATBOT STUB */
  $("#chat-fab")?.addEventListener("click", () => {
    alert("Chatbot coming soon…");
  });
})();
