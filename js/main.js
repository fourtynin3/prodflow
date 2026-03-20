/* ════════════════════════════════════════
   js/main.js — App entry point
   ════════════════════════════════════════ */

(function init() {

  // Show current origin in setup panel
  const originEl = document.getElementById('currentOrigin');
  if (originEl) {
    originEl.textContent = location.origin !== 'null' ? location.origin : window.location.href.split('/').slice(0, 3).join('/');
  }

  // Auto-init Google Sign-In with injected Client ID
  const clientId = Auth.getClientId();
  if (clientId && clientId !== 'GOOGLE_CLIENT_ID_PLACEHOLDER') {
    const waitForGSI = setInterval(() => {
      if (window.google?.accounts) {
        clearInterval(waitForGSI);
        Auth.initGoogleSignIn(clientId);
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
