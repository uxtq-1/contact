// join.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('join-form');
  const addButtons = document.querySelectorAll('.add-btn');
  const thankYouContainer = document.getElementById('thank-you');
  const progressFill = thankYouContainer.querySelector('.progress-fill');

  // 1. Dynamic “+” to clone fields
  addButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const fieldKey = btn.getAttribute('data-field');
      const group = document.querySelector(`.multi-field[data-field="${fieldKey}"] .field-row`);
      const newRow = group.cloneNode(true);

      // Clear the input/textarea inside the clone
      const inputOrTextarea = newRow.querySelector('input, textarea');
      inputOrTextarea.value = '';

      // Re-attach listener to the cloned “+” button
      const newBtn = newRow.querySelector('.add-btn');
      newBtn.addEventListener('click', () => {
        btn.click(); // delegate to original logic
      });

      group.parentElement.insertBefore(newRow, group.nextSibling);
    });
  });

  // 2. Language switch for placeholders/labels (already handled by main.js),
  //    but we need to ensure placeholders update on load:
  function updateTextByLang() {
    const currentLang = document.documentElement.lang;
    // Update placeholders for all inputs & textareas
    document.querySelectorAll('input[data-en][data-es], textarea[data-en][data-es]').forEach((el) => {
      const text = currentLang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
      el.placeholder = text;
    });
    // Update labels and the submit button
    document.querySelectorAll('[data-en][data-es]').forEach((el) => {
      if (el.tagName.toLowerCase() === 'label' || el.tagName.toLowerCase() === 'button' || el.tagName.toLowerCase() === 'title' || el.tagName.toLowerCase() === 'h1') {
        const text = currentLang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
        el.textContent = text;
      }
      // Update thank-you message text
      if (el.id === 'thank-you') {
        const msg = currentLang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
        el.childNodes[0].nodeValue = msg;
      }
    });
  }

  updateTextByLang();
  document.getElementById('lang-toggle').addEventListener('click', updateTextByLang);

  // 3. Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 3a. Hide the form and show the “Thank You / progress” container
    form.querySelectorAll('input, textarea, button').forEach((el) => {
      el.disabled = true;
    });
    thankYouContainer.hidden = false;

    // 3b. Animate progress bar
    setTimeout(() => {
      progressFill.style.width = '100%';
    }, 100);

    // 3c. Gather all form data into a JSON object
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      if (key.endsWith('[]')) {
        const baseKey = key.replace('[]', '');
        if (!payload[baseKey]) payload[baseKey] = [];
        payload[baseKey].push(value.trim());
      } else {
        payload[key] = value.trim();
      }
    });

    // 3d. At this point you'd:
    //   • perform client-side encryption (AES-GCM or HMAC logic),
    //   • send payload to Apps Script / Cloudflare Worker endpoint.
    //   • For demo, we simply log to console:

    console.log('Collected payload →', payload);

    // Example: send to your endpoint (uncomment & customize when ready)
    /*
    fetch('https://your-cloudflare-worker-or-apps-script-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((resp) => {
        console.log('Server response:', resp);
      })
      .catch((err) => {
        console.error('Error sending join data:', err);
      });
    */
  });
});
