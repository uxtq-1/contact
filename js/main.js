// js/main.js  – shared UI (language, theme, drawer, chatbot stub)
(()=>{
  const $=s=>document.querySelector(s);

  /* language toggle (EN / ES) */
  const langBtn=$("#lang-toggle");
  const setLang=lang=>{
    document.documentElement.lang=lang;
    document.querySelectorAll("[data-en]").forEach(el=>{
      el.textContent=el.dataset[lang==="en"?"en":"es"];
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
    themeBtn.textContent=t==="dark"?"☀️":"🌙";
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
  $("#chat-fab")?.addEventListener("click",()=>alert("Chatbot coming soon 🚀"));

})();
