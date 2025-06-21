// chatbot_panel.js - Functionality for the Secure AI Chat Side Panel

// Wrap in an IIFE to avoid polluting the global scope,
// then expose a public function to control the panel.
const AIChatPanelController = (() => {
    // DOM Element References (specific to the panel)
    let chatPanel;
    let messagesContainer;
    let userInput;
    let sendButton;
    let chatForm;
    let honeypotInput;
    let securityCheckContainer;
    let inputArea;
    let closeButton;

    // State Variables
    let humanVerified = false; // Tracks if reCAPTCHA/Turnstile verification was successful for the panel
    let isPanelOpen = false;

    // --- Configuration (placeholders, should be configured by the main page or here if static) ---
    // IMPORTANT: These should align with what the main page/environment provides.
    const CLOUDFLARE_AI_ENDPOINT_PANEL = 'https://your-cloudflare-ai-endpoint.example.com/chat-panel'; // Example
    const BACKEND_VERIFY_ENDPOINT_PANEL = '/api/verify-captcha-panel'; // Example
    const HONEYPOT_ALERT_ENDPOINT_PANEL = '/api/log-honeypot-trigger-panel'; // Example

    /**
     * Initializes DOM element references once the panel HTML is in the DOM.
     */
    function initializeDOMReferences() {
        chatPanel = document.getElementById('aiChatPanel');
        messagesContainer = document.getElementById('aiChatPanelMessages');
        userInput = document.getElementById('aiChatPanelUserInput');
        sendButton = document.getElementById('aiChatPanelSendButton');
        chatForm = document.getElementById('aiChatPanelForm');
        honeypotInput = document.getElementById('panel_contact_me_by_fax_only');
        securityCheckContainer = document.getElementById('aiChatPanelSecurityCheck');
        inputArea = document.getElementById('aiChatPanelInputArea');
        closeButton = document.getElementById('aiChatPanelCloseButton');

        if (!chatPanel || !messagesContainer || !userInput || !sendButton || !chatForm || !honeypotInput || !securityCheckContainer || !inputArea || !closeButton) {
            console.error("AI Chat Panel Error: One or more essential DOM elements are missing. Ensure chatbot_panel.html is loaded.");
            return false;
        }
        return true;
    }

    /**
     * Appends a message to the panel's chat window.
     */
    function appendMessage(text, sender, isHTML = false) {
        if (!messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender); // e.g., class="message user-message"

        const paragraph = document.createElement('p');
        if (isHTML) {
            paragraph.innerHTML = text; // Use with caution for trusted HTML
        } else {
            paragraph.textContent = text; // Safest for plain text
        }
        messageDiv.appendChild(paragraph);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Basic text sanitization.
     */
    function sanitizeText(text) {
        const temp = document.createElement('div');
        temp.textContent = text;
        return temp.innerHTML;
    }

    /**
     * Disables chat input within the panel.
     */
    function disablePanelChat(message = "Chat disabled.") {
        if (!userInput || !sendButton) return;
        userInput.disabled = true;
        sendButton.disabled = true;
        userInput.placeholder = message;
        appendMessage(message, 'ai-message');
        console.warn(`AI Chat Panel: ${message}`);
    }

    /**
     * Checks the panel's honeypot field.
     */
    function checkPanelHoneypot() {
        if (!honeypotInput) return false;
        if (honeypotInput.checked) {
            console.error("AI Chat Panel: HONEYPOT TRIGGERED!");
            fetch(HONEYPOT_ALERT_ENDPOINT_PANEL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'panel_honeypot_triggered',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                }),
            }).catch(err => console.error("Error sending panel honeypot alert:", err));
            disablePanelChat("Suspicious activity detected. Chat terminated.");
            // Consider closing the panel or other actions
            // togglePanel(false); // Example: close panel
            return true;
        }
        return false;
    }
    // It's better to check honeypot on form submission rather than interval for a panel.

    /**
     * Enables chat features in the panel after successful verification.
     */
    function enablePanelChatFeatures() {
        if (!userInput || !sendButton || !securityCheckContainer || !inputArea) return;
        humanVerified = true;
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.placeholder = "Type your message...";
        securityCheckContainer.style.display = 'none';
        inputArea.style.display = 'flex'; // Or however it's normally displayed
        appendMessage("Verification successful! You can start chatting.", 'ai-message');
        userInput.focus();
    }

    /**
     * Disables chat features in the panel, showing the security check.
     */
    function disablePanelChatFeatures(message = "Please complete security check.") {
        if (!userInput || !sendButton || !securityCheckContainer || !inputArea) return;
        humanVerified = false;
        userInput.disabled = true;
        sendButton.disabled = true;
        userInput.placeholder = message;
        securityCheckContainer.style.display = 'block'; // Or 'flex' depending on its CSS
        // inputArea.style.display = 'none'; // Optionally hide input area completely
    }

    // --- Global Callbacks for reCAPTCHA/Turnstile (specific to panel) ---
    // These need to be exposed globally if the reCAPTCHA/Turnstile HTML attributes call them.
    // Ensure these names are unique if the main page also uses reCAPTCHA.
    window.onPanelRecaptchaSuccess = function (token) {
        console.log('Panel reCAPTCHA token:', token);
        verifyPanelCaptchaTokenWithBackend('recaptcha', token);
    };

    window.onPanelRecaptchaExpired = function () {
        console.warn('Panel reCAPTCHA token expired.');
        disablePanelChatFeatures("Your verification expired. Please verify again.");
        // if (typeof grecaptcha !== 'undefined') grecaptcha.reset(WIDGET_ID); // If you render explicitly and get widget ID
    };

    window.onPanelTurnstileSuccess = function (token) {
        console.log('Panel Turnstile token:', token);
        verifyPanelCaptchaTokenWithBackend('turnstile', token);
    };

    async function verifyPanelCaptchaTokenWithBackend(type, token) {
        if (!messagesContainer) return;
        appendMessage("<em>Verifying...</em>", 'ai-message', true);
        try {
            const response = await fetch(BACKEND_VERIFY_ENDPOINT_PANEL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ captchaType: type, captchaToken: token }),
            });
            const verificationStatusMessage = messagesContainer.querySelector(".ai-message:last-child em");
            if (verificationStatusMessage && verificationStatusMessage.textContent === "Verifying...") {
                verificationStatusMessage.closest('.message').remove();
            }

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    enablePanelChatFeatures();
                } else {
                    disablePanelChatFeatures(`Verification failed: ${data.message || 'Please try again.'}`);
                }
            } else {
                disablePanelChatFeatures(`Server error during verification (${response.status}).`);
            }
        } catch (error) {
            const verificationStatusMessage = messagesContainer.querySelector(".ai-message:last-child em");
            if (verificationStatusMessage && verificationStatusMessage.textContent === "Verifying...") {
                verificationStatusMessage.closest('.message').remove();
            }
            disablePanelChatFeatures("Network error during verification.");
        }
    }

    /**
     * Handles chat form submission for the panel.
     */
    async function handlePanelChatSubmit(event) {
        event.preventDefault();
        if (checkPanelHoneypot()) return;
        if (!humanVerified) {
            appendMessage("Please complete verification first.", 'ai-message');
            return;
        }

        const userText = userInput.value.trim();
        if (userText === "") return;

        appendMessage(sanitizeText(userText), 'user-message');
        userInput.value = '';
        sendButton.disabled = true;
        appendMessage("<em>AI is thinking...</em>", 'ai-message', true);

        try {
            // ** SIMULATED AI RESPONSE (Replace with actual fetch to CLOUDFLARE_AI_ENDPOINT_PANEL) **
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
            let aiResponseText = `Panel AI says: You typed "${sanitizeText(userText)}"`;
            // ** End Simulation **

            const thinkingMessage = messagesContainer.querySelector(".ai-message:last-child em");
            if (thinkingMessage && thinkingMessage.textContent === "AI is thinking...") {
                thinkingMessage.closest('.message').remove();
            }
            appendMessage(sanitizeText(aiResponseText), 'ai-message');
        } catch (error) {
            console.error("Panel AI Error:", error);
            const thinkingMessageOnError = messagesContainer.querySelector(".ai-message:last-child em");
            if (thinkingMessageOnError && thinkingMessageOnError.textContent === "AI is thinking...") {
                thinkingMessageOnError.closest('.message').remove();
            }
            appendMessage("Sorry, panel AI is having trouble.", 'ai-message');
        } finally {
            if (humanVerified) {
                sendButton.disabled = false;
                userInput.focus();
            }
        }
    }

    /**
     * Toggles the visibility of the chat panel.
     * @param {boolean} [forceShow] - Optional. True to force show, false to force hide.
     */
    function togglePanel(forceShow) {
        if (!chatPanel) {
            console.warn("AI Chat Panel: Cannot toggle, panel element not found.");
            return;
        }

        const shouldBeOpen = typeof forceShow === 'boolean' ? forceShow : !isPanelOpen;

        if (shouldBeOpen) {
            chatPanel.style.display = 'flex'; // Or 'block' if that's how it's defined
            // Timeout to allow display property to apply before transition
            setTimeout(() => {
                chatPanel.classList.add('open');
            }, 10); // Small delay
            isPanelOpen = true;
            userInput.focus(); // Focus input when panel opens
            // Add ESC listener when panel opens
            document.addEventListener('keydown', handleEscKey);
        } else {
            chatPanel.classList.remove('open');
            // Remove ESC listener when panel closes
            document.removeEventListener('keydown', handleEscKey);
            // Optional: Set display to none after transition to remove from layout
            setTimeout(() => {
                if (!chatPanel.classList.contains('open')) { // Check if it wasn't reopened quickly
                    chatPanel.style.display = 'none';
                }
            }, 400); // Match CSS transition duration
            isPanelOpen = false;
        }
    }

    /**
     * Handles the ESC key press to close the panel.
     */
    function handleEscKey(event) {
        if (event.key === 'Escape' && isPanelOpen) {
            togglePanel(false); // Close the panel
        }
    }

    /**
     * Sets up initial event listeners for the panel.
     */
    function setupEventListeners() {
        if (!chatForm || !closeButton) {
             console.error("AI Chat Panel: Cannot setup listeners, form or close button missing.");
            return;
        }
        chatForm.addEventListener('submit', handlePanelChatSubmit);
        closeButton.addEventListener('click', () => togglePanel(false));
    }

    /**
     * Publicly exposed init function.
     * Call this from your main page script after the panel HTML is loaded.
     */
    function init() {
        if (!initializeDOMReferences()) {
            return; // Stop if DOM elements aren't found
        }
        disablePanelChatFeatures(); // Initially disable chat until verification
        setupEventListeners();
        // Panel starts hidden by CSS (transform or display:none)
        console.log("AI Chat Panel Controller Initialized.");
    }

    // --- Public API ---
    // Expose only necessary functions to the global scope or your main app's scope.
    return {
        init: init, // Call this to set up the panel
        toggle: togglePanel, // Call this to open/close the panel
        isOpen: () => isPanelOpen // Check if panel is currently open
        // Potentially expose: onPanelRecaptchaSuccess, onPanelTurnstileSuccess if they cannot be global
        // But for now, they are global as per reCAPTCHA's typical requirements.
    };
})();

// Example of how the main page might initialize the panel:
// Make sure chatbot_panel.html is loaded into the DOM first.
// Then, in your main page's script:
// document.addEventListener('DOMContentLoaded', () => {
//     AIChatPanelController.init();
//
//     // Example: Button on main page to toggle chat panel
//     const toggleButton = document.getElementById('myChatToggleButton');
//     if (toggleButton) {
//         toggleButton.addEventListener('click', () => {
//             AIChatPanelController.toggle();
//         });
//     }
// });
// Remember to load this script (chatbot_panel.js) in your main HTML page.
// Also, the reCAPTCHA/Turnstile API script (e.g., https://www.google.com/recaptcha/api.js)
// should be loaded by the main page.
