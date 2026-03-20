/* ════════════════════════════════════════
   js/main.js — App entry point
   ════════════════════════════════════════ */

(function init() {

  // Show current origin in setup panel
  const originEl = document.getElementById('currentOrigin');
  if (originEl) {
    originEl.textContent = location.origin !== 'null' ? location.origin : window.location.href.split('/').slice(0, 3).join('/');
  }

  // Pre-fill saved Client ID
  const savedClientId = Auth.getClientId();
  if (savedClientId) {
    const input = document.getElementById('clientIdInput');
    if (input) input.value = savedClientId;

    // Wait for Google GSI script to load then init
    const waitForGSI = setInterval(() => {
      if (window.google?.accounts) {
        clearInterval(waitForGSI);
        Auth.initGoogleSignIn(savedClientId);
      }
    }, 200);
  }

  // Attempt auto-login from saved session
  const loggedIn = Auth.tryAutoLogin();

  // If no session, just show login screen (already visible by default)
  if (!loggedIn) {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
  }


})();
