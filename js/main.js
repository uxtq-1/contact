// js/main.js  – shared UI (language, theme, drawer, chatbot stub)
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* LANGUAGE TOGGLE (EN / ES) */
  const langBtn = $("#lang-toggle");
  let currentTranslations = {}; // To store fetched translations

  // Function to fetch and apply translations
  async function loadTranslations(lang) {
    console.log("loadTranslations called with lang:", lang);
    try {
      console.log("Fetching translations from:", `../i18n/${lang}.json`);
      const response = await fetch(`../i18n/${lang}.json`); // Path relative to HTML files
      if (!response.ok) {
        console.error(`Error loading translation file for ${lang}: ${response.statusText}`);
        // Fallback to English if the selected language file fails to load, except if English itself fails
        if (lang !== 'en') {
          console.warn(`Falling back to English translations.`);
          await loadTranslations('en'); // Attempt to load English
        }
        return;
      }
      currentTranslations = await response.json();
      console.log("Translations fetched successfully for:", lang, "Data:", currentTranslations);

      document.documentElement.lang = lang;

      $$("[data-translate-key]").forEach(el => {
        const key = el.dataset.translateKey;
        const translation = currentTranslations[key];

        if (translation === undefined) {
          console.warn(`No translation found for key: ${key} in ${lang}.json`);
          return; // Skip if no translation for this key
        }

        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          if (el.type === "submit" || el.type === "button") {
            el.value = translation;
          } else {
            el.placeholder = translation;
          }
        } else if (el.tagName === "OPTION") {
          el.textContent = translation;
          // If you need to set the value of an option based on translation, handle it here too.
          // el.value = translation; // Or a different key like `${key}_value`
        } else {
          el.textContent = translation;
        }
      });

      if (langBtn) {
        console.log("Updating langBtn text. Current lang:", lang, "Button text to set:", (lang === "en" ? "ES" : "EN"));
        langBtn.textContent = lang === "en" ? "ES" : "EN";
      }
      localStorage.setItem("lang", lang);

    } catch (error) {
      console.error("Error in loadTranslations:", error);
      console.error(`Failed to load or apply translations for ${lang}:`, error);
       // Fallback to English on any error, except if English itself fails
      if (lang !== 'en') {
        console.warn(`Falling back to English translations due to error.`);
        await loadTranslations('en'); // Attempt to load English
      }
    }
  }

  // Expose a version of setAppLang that calls loadTranslations
  // This is what other scripts like join-handler.js will call
  window.setAppLang = async (lang) => {
    console.log("window.setAppLang called with lang:", lang);
    await loadTranslations(lang);
  };

  if (langBtn) {
    langBtn.addEventListener("click", async () => {
      console.log("Language toggle button clicked.");
      const newLang = document.documentElement.lang === "en" ? "es" : "en";
      console.log("Current page lang:", document.documentElement.lang, "Attempting to switch to:", newLang);
      await window.setAppLang(newLang);
    });
  }

  // Initial language set on page load
  const initialLang = localStorage.getItem("lang") || "en";
  window.setAppLang(initialLang);


  /* THEME TOGGLE (LIGHT / DARK) */
  const themeBtn = $("#theme-toggle");
  const setTheme = t => {
    document.body.classList.toggle("dark", t === "dark");
    if (themeBtn) { // Check if themeBtn exists
        themeBtn.textContent = t === "dark" ? "Light" : "Dark";
    }
    localStorage.setItem("theme", t);
  };
  if (themeBtn) {
    themeBtn.addEventListener("click", () => setTheme(document.body.classList.contains("dark") ? "light" : "dark"));
  }
  // Set initial theme - ensure this runs after themeBtn is confirmed to exist or make setTheme robust
  setTheme(localStorage.getItem("theme") || "light");


  /* MOBILE DRAWER */
  const openDrawer = () => $("#mobile-drawer")?.classList.add("open");
  const closeDrawer = () => $("#mobile-drawer")?.classList.remove("open");
  $("#menu-toggle")?.addEventListener("click", openDrawer);
  $("#drawer-close")?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && $("#mobile-drawer")?.classList.contains("open")) {
      closeDrawer();
    }
  });

  /* CHATBOT STUB */
  // const chatFab = $("#chat-fab"); // Chat FAB has been removed from HTML
  // if (chatFab) {
  //   chatFab.addEventListener("click", () => {
  //     alert(currentTranslations["chatbot_coming_soon"] || "Chatbot coming soon…");
  //   });
  // }
})();
