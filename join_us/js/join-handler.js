// js/join-handler.js -- Secure "Join Us" form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('join-form');
  if (!form) return;

  const thankYouContainer = document.getElementById('thank-you'); // This might be repurposed for general feedback
  const progressFill = thankYouContainer ? thankYouContainer.querySelector('.progress-fill') : null;
  const feedbackMsg = document.getElementById('join-feedback-msg'); // Assuming a new feedback element
  const submitButton = form.querySelector("button[type='submit']");

  const clean = s => (typeof s === 'string' ? s.replace(/<[^>]*>/g, "").trim() : s);
  const uuid = () => crypto.randomUUID();
  const iso = () => new Date().toISOString();

  // Language handling is now centralized in js/main.js
  // The setAppLang() function in main.js will handle initial language setup
  // and updates when the lang-toggle button is clicked.

  // ----- ADD / REMOVE FIELD LOGIC -----
  // This part remains unchanged as it's about UI interaction for multi-fields
  function handleAddClick(fieldKey) {
    const multiField = document.querySelector(`.multi-field[data-field="${fieldKey}"]`);
    if (!multiField) return;
    const firstRow = multiField.querySelector('.field-row');
    if (!firstRow) return;
    const newRow = firstRow.cloneNode(true);
    newRow.querySelectorAll('input, textarea').forEach((el) => { el.value = ''; });
    const newAddBtn = newRow.querySelector('.add-btn');
    const newRemoveBtn = newRow.querySelector('.remove-btn');
    if (newAddBtn) newAddBtn.addEventListener('click', () => handleAddClick(fieldKey));
    if (newRemoveBtn) newRemoveBtn.addEventListener('click', () => handleRemoveClick(fieldKey, newRow));
    const lastRow = multiField.querySelectorAll('.field-row');
    lastRow[lastRow.length - 1].after(newRow);
    // Call the global language update function to set placeholders in the new row
    if (window.setAppLang) {
      window.setAppLang(document.documentElement.lang);
    }
  }

  function handleRemoveClick(fieldKey, rowElement) {
    const multiField = document.querySelector(`.multi-field[data-field="${fieldKey}"]`);
    if (!multiField) return;
    const allRows = multiField.querySelectorAll('.field-row');
    if (allRows.length > 1) rowElement.remove();
  }

  document.querySelectorAll('.add-btn').forEach((btn) => {
    const fieldKey = btn.getAttribute('data-field');
    btn.addEventListener('click', () => handleAddClick(fieldKey));
  });
  document.querySelectorAll('.remove-btn').forEach((btn) => {
    const fieldKey = btn.getAttribute('data-field');
    const rowElem = btn.closest('.field-row');
    btn.addEventListener('click', () => handleRemoveClick(fieldKey, rowElem));
  });

  // ----- FORM SUBMISSION -----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return form.reportValidity();
    if (form.hp && form.hp.value) return; // honeypot

    if (submitButton) submitButton.disabled = true;
    if (feedbackMsg) feedbackMsg.textContent = 'Processing...'; // Or use a dedicated processing message element
    if (thankYouContainer) thankYouContainer.hidden = true; // Hide old thank you message initially


    // reCAPTCHA v3
    let recaptchaToken = "";
    try {
      if (typeof grecaptcha === 'undefined' || !grecaptcha.execute) {
        throw new Error("reCAPTCHA library not loaded.");
      }
      // The reCAPTCHA Site Key should be in the HTML (data-recaptcha-site-key attribute on the form)
      const siteKey = form.dataset.recaptchaSiteKey || "YOUR_RECAPTCHA_V3_SITE_KEY_HERE"; // Fallback
      if (siteKey === "YOUR_RECAPTCHA_V3_SITE_KEY_HERE") {
        console.warn("reCAPTCHA Site Key is using a placeholder value for join form. Configure in HTML: <form data-recaptcha-site-key='YOUR_ACTUAL_KEY'> and the script tag.");
      }
      recaptchaToken = await grecaptcha.execute(siteKey, { action: "join" });
    } catch(err) {
      console.error("reCAPTCHA execution error:", err);
      if (feedbackMsg) feedbackMsg.textContent = "reCAPTCHA error. Please try again.";
      if (submitButton) submitButton.disabled = false;
      return;
    }

    // Gather all form data into a JSON object
    // Using FormData and then converting to a plain object for flexibility
    const FD = new FormData(form);
    const textPayload = {
        id: uuid(),
        ts: iso(),
        recaptchaToken: recaptchaToken
    };

    FD.forEach((value, key) => {
      // Skip file input for now in this JSON payload
      const inputElement = form.elements[key];
      if (inputElement && inputElement.type === 'file') {
        // File handling will be separate, e.g., using pre-signed URLs
        // For now, we can store the filename if needed, but not the file content
        if (inputElement.files && inputElement.files[0]) {
          textPayload[key + "_filename"] = clean(inputElement.files[0].name);
        }
        return;
      }

      const cleanedValue = clean(value);
      if (key.endsWith('[]')) {
        const baseKey = key.replace('[]', '');
        if (!textPayload[baseKey]) textPayload[baseKey] = [];
        textPayload[baseKey].push(cleanedValue);
      } else {
        textPayload[key] = cleanedValue;
      }
    });

    // TODO: Implement file upload logic here.
    // This might involve:
    // 1. Getting a pre-signed URL from the server (another endpoint).
    // 2. Uploading the file directly to cloud storage (e.g., S3, GCS) using that URL.
    // 3. Sending the file's URL/identifier along with the textPayload or in a subsequent call.
    // For now, textPayload will be sent without the actual file content.
    // Example: const resumeFile = form.querySelector('#resume-file').files[0]; if (resumeFile) { /* ...upload logic... */ }


    // IMPORTANT: Applicant data, especially sensitive information like resumes, should be handled securely by a backend server. This includes proper validation, sanitization, and encryption at rest. Client-side code cannot ensure the security of this data.
    // TODO: Replace 'REAL_SERVICE_ID_HERE' with the actual service ID for the backend processing this form.
    try {
      const res = await fetch("REAL_SERVICE_ID_HERE", { // Placeholder URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(textPayload)
      });

      const responseData = await res.json();

      if (res.ok) {
        if (feedbackMsg) feedbackMsg.textContent = responseData.message || "Application submitted successfully!";
        if (thankYouContainer) { // Use the existing thank-you container for success message
            const thankYouTextEl = thankYouContainer.querySelector('#thank-you-text') || thankYouContainer;
            thankYouTextEl.textContent = responseData.message || (document.documentElement.lang === 'es' ? form.dataset.successEs : form.dataset.successEn) || "Thank you!";
            thankYouContainer.hidden = false;
            if(progressFill) {
                progressFill.style.width = '0%'; // Reset progress
                setTimeout(() => { progressFill.style.width = '100%'; }, 100);
            }
        }
        form.reset();
      } else {
        if (feedbackMsg) feedbackMsg.textContent = responseData.message || "Error submitting application. Please retry.";
        if (thankYouContainer) thankYouContainer.hidden = true;
      }
    } catch (err) {
      console.error("Form submission error:", err);
      if (feedbackMsg) feedbackMsg.textContent = "Network error. Please try again.";
      if (thankYouContainer) thankYouContainer.hidden = true;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
