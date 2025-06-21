// js/main.js  – shared UI (language, theme, drawer, chatbot stub)
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* LANGUAGE TOGGLE (EN / ES) */
  const langBtn = $("#lang-toggle");
  let currentTranslations = {}; // To store fetched translations

  // Function to fetch and apply translations
  async function loadTranslations(lang) {
    try {
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
        langBtn.textContent = lang === "en" ? "ES" : "EN";
      }
      localStorage.setItem("lang", lang);

    } catch (error) {
      // Note: The duplicate console.error from previous step is intentionally kept as per instructions for that step,
      // but for a final cleanup, one of these would typically be removed.
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
    await loadTranslations(lang);
  };

  if (langBtn) {
    langBtn.addEventListener("click", async () => {
      const newLang = document.documentElement.lang === "en" ? "es" : "en";
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

  /* MODAL DIALOGS */
  const joinModal = $("#join-modal");
  const contactModal = $("#contact-modal");
  const joinFabAction = $("#join-fab-action");
  const contactFabAction = $("#contact-fab-action");

  function openModal(modal) {
    if (modal) {
      modal.style.display = "flex";
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.style.display = "none";
    }
  }

  if (joinFabAction) {
    joinFabAction.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default anchor behavior
      openModal(joinModal);
    });
  }

  if (contactFabAction) {
    contactFabAction.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default anchor behavior
      openModal(contactModal);
    });
  }

  // Event listeners for close buttons and back buttons within modals
  $$(".modal-close").forEach(button => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal");
      closeModal(modal);
    });
  });

  $$(".modal-back").forEach(button => {
    button.addEventListener("click", () => {
      history.back();
    });
  });

  // Event listener for Escape key to close modals
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (joinModal && joinModal.style.display === "flex") {
        closeModal(joinModal);
      }
      if (contactModal && contactModal.style.display === "flex") {
        closeModal(contactModal);
      }
    }
  });
})();
