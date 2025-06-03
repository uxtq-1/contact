// js/main.js  – shared UI (language, theme, drawer, chatbot stub)
(()=>{
  const $=s=>document.querySelector(s);

  /* language toggle (EN / ES) */
  const langBtn=$("#lang-toggle");
  const setLang=lang=>{
    document.documentElement.lang=lang;

    // Swap textContent for labels/buttons/headers
    document.querySelectorAll("[data-en][data-es]").forEach(el=>{
      // If it’s not an input/select/textarea, update textContent
      if (!["INPUT","TEXTAREA","SELECT","OPTION"].includes(el.tagName)) {
        el.textContent=el.dataset[lang];
      }
    });

    // Swap placeholder for inputs and textareas
    document.querySelectorAll("input[data-en][data-es], textarea[data-en][data-es]").forEach(el=>{
      el.placeholder=el.dataset[lang];
    });

    // Swap <option> text
    document.querySelectorAll("option[data-en][data-es]").forEach(el=>{
      el.textContent=el.dataset[lang];
    });

    langBtn.textContent=lang==="en"?"ES":"EN";
    localStorage.setItem("lang",lang);
  };
  langBtn?.addEventListener("click",()=>setLang(document.documentElement.lang==="en"?"es":"en"));
  setLang(localStorage.getItem("lang")||"en");

  /* dark / light theme */
  const themeBtn=$("#theme-toggle");
  const setTheme=t=>{
    document.body.classList.toggle("dark",t==="dark");
    themeBtn.textContent=t==="dark"?"Dark":"Light";
    localStorage.setItem("theme",t);
  };
  themeBtn?.addEventListener("click",()=>setTheme(document.body.classList.contains("dark")?"light":"dark"));
  setTheme(localStorage.getItem("theme")||"light");

  /* mobile drawer */
  const openDrawer=()=>$("#mobile-drawer").classList.add("open");
  const closeDrawer=()=>$("#mobile-drawer").classList.remove("open");
  $("#menu-toggle")?.addEventListener("click",openDrawer);
  $("#drawer-close")?.addEventListener("click",closeDrawer);
  // close on Esc
  document.addEventListener("keydown",e=>e.key==="Escape"&&closeDrawer());

  /* chatbot stub */
  $("#chat-fab")?.addEventListener("click",()=>alert("Chatbot coming soon ChatBbot"));

})();
