// js/contact-handler.js  – Simplified for serverless function processing
(() => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const clean = s => s.replace(/<[^>]*>/g, "").trim();
  const uuid = () => crypto.randomUUID();
  const iso = () => new Date().toISOString();

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.checkValidity()) return form.reportValidity();
    if (form.hp && form.hp.value) return; // honeypot

    const submitButton = form.querySelector("button[type='submit']");
    const feedbackMsg = document.getElementById("feedback-msg");
    const encryptingMsg = document.getElementById("encrypting-msg"); // Assuming this element might be repurposed or hidden

    encryptingMsg.classList.remove("hide"); // Indicate processing
    submitButton.disabled = true;
    feedbackMsg.textContent = "";


    // reCAPTCHA v3
    let recaptchaToken = "";
    try {
      // Ensure grecaptcha is loaded and site key is correctly configured in HTML
      if (typeof grecaptcha === 'undefined' || !grecaptcha.execute) {
        throw new Error("reCAPTCHA library not loaded.");
      }
      // The reCAPTCHA Site Key should be in the HTML (data-recaptcha-site-key attribute on the form)
      const siteKey = form.dataset.recaptchaSiteKey || "YOUR_RECAPTCHA_V3_SITE_KEY_HERE"; // Fallback
      if (siteKey === "YOUR_RECAPTCHA_V3_SITE_KEY_HERE") {
        console.warn("reCAPTCHA Site Key is using a placeholder value. Configure in HTML: <form data-recaptcha-site-key='YOUR_ACTUAL_KEY'> and the script tag.");
      }
      recaptchaToken = await grecaptcha.execute(siteKey, { action: "contact" });
    } catch(err) {
      console.error("reCAPTCHA execution error:", err);
      feedbackMsg.textContent = "reCAPTCHA error. Please try again.";
      encryptingMsg.classList.add("hide");
      submitButton.disabled = false;
      return;
    }

    // Build plaintext object
    const formData = {
      id: uuid(),
      ts: iso(),
      name: clean(form.name.value),
      email: clean(form.email.value),
      service: clean(form.service.value),
      msg: clean(form.message.value),
      recaptchaToken: recaptchaToken // Include reCAPTCHA token
    };

    try {
      const res = await fetch("REAL_SERVICE_ID_HERE", { // Placeholder URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest" // Common header, optional
        },
        body: JSON.stringify(formData)
      });

      const responseData = await res.json(); // Assuming serverless function returns JSON

      if (res.ok) {
        feedbackMsg.textContent = responseData.message || "Thank you – we’ll reply soon.";
        form.reset();
      } else {
        feedbackMsg.textContent = responseData.message || "Error, please retry.";
      }
    } catch (err) {
      console.error("Form submission error:", err);
      feedbackMsg.textContent = "Network error. Please try again.";
    } finally {
      encryptingMsg.classList.add("hide");
      submitButton.disabled = false;
    }
  });

  // Language handling is now centralized in js/main.js
  // The setAppLang() function in main.js will handle initial language setup
  // and updates when the lang-toggle button is clicked.
  // If this script dynamically added new translatable content
  // that wasn't present at page load, one would call:
  // if (window.setAppLang) { window.setAppLang(document.documentElement.lang); }
  // after adding such content. For this form, elements are static.
})();
