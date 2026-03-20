/* ════════════════════════════════════════
   js/auth.js — Google OAuth + local auth
   ════════════════════════════════════════ */

const Auth = (() => {

  const CLIENT_ID_KEY   = 'pf_google_client_id';
  const SESSIONS_KEY    = 'pf_google_sessions';
  const CURRENT_UID_KEY = 'pf_current_uid';
  const OFFLINE_KEY     = 'pf_offline_users';

  // ── Helpers ──────────────────────────────────────────
  function getClientId()   { return localStorage.getItem(CLIENT_ID_KEY) || ''; }
  function getSessions()   { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}'); }
  function getOfflineUsers() { return JSON.parse(localStorage.getItem(OFFLINE_KEY) || '{}'); }
  function saveOfflineUsers(u) { localStorage.setItem(OFFLINE_KEY, JSON.stringify(u)); }

  async function hashPw(pw) {
    const enc = new TextEncoder().encode(pw + 'pf_salt_9z3k');
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Google Client ID ─────────────────────────────────
  function saveClientId() {
    const val = document.getElementById('clientIdInput').value.trim();
    if (!val || !val.includes('googleusercontent.com')) {
      UI.loginErr('Ungültige Client ID. Format: …apps.googleusercontent.com');
      return;
    }
    localStorage.setItem(CLIENT_ID_KEY, val);
    UI.loginOk('Client ID gespeichert. Google Sign-In wird geladen…');
    setTimeout(() => { UI.hideLoginMsg(); initGoogleSignIn(val); }, 1000);
  }

  function initGoogleSignIn(clientId) {
    if (!window.google?.accounts) {
      setTimeout(() => initGoogleSignIn(clientId), 300);
      return;
    }
    document.getElementById('setupPanel').style.display = 'none';

    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtnContainer'),
      {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        width: 340,
        text: 'continue_with',
        logo_alignment: 'left',
      }
    );

    google.accounts.id.prompt();
  }

  function handleGoogleCredential(response) {
    // Decode JWT payload (client-side UI only, no server verification needed here)
    const parts   = response.credential.split('.');
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    const user = {
      id:       payload.sub,
      name:     payload.name,
      email:    payload.email,
      picture:  payload.picture || '',
      provider: 'google',
    };

    const sessions = getSessions();
    sessions[user.id] = { ...user, lastLogin: new Date().toISOString() };
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    localStorage.setItem(CURRENT_UID_KEY, user.id);

    onLoginSuccess(user);
  }

  // ── Offline Auth ──────────────────────────────────────
  async function offlineLogin() {
    const username = document.getElementById('loginUser').value.trim().toLowerCase();
    const pass     = document.getElementById('loginPass').value;

    if (!username || !pass) { UI.loginErr('Bitte alle Felder ausfüllen.'); return; }

    const users = getOfflineUsers();
    if (!users[username]) { UI.loginErr('Account nicht gefunden.'); return; }

    const hash = await hashPw(pass);
    if (users[username].passwordHash !== hash) { UI.loginErr('Falsches Passwort.'); return; }

    const uid = 'offline_' + username;
    localStorage.setItem(CURRENT_UID_KEY, uid);
    onLoginSuccess({ id: uid, name: username, email: '', picture: '', provider: 'local' });
  }

  async function register() {
    const username = document.getElementById('regUser').value.trim().toLowerCase();
    const pass     = document.getElementById('regPass').value;
    const pass2    = document.getElementById('regPass2').value;

    if (!username || !pass || !pass2) { UI.loginErr('Bitte alle Felder ausfüllen.'); return; }
    if (username.length < 3)          { UI.loginErr('Username mind. 3 Zeichen.'); return; }
    if (!/^[a-z0-9_]+$/.test(username)) { UI.loginErr('Username: nur a-z, 0-9, _'); return; }
    if (pass.length < 6)              { UI.loginErr('Passwort mind. 6 Zeichen.'); return; }
    if (pass !== pass2)               { UI.loginErr('Passwörter stimmen nicht überein.'); return; }

    const users = getOfflineUsers();
    if (users[username]) { UI.loginErr('Username bereits vergeben.'); return; }

    users[username] = {
      passwordHash: await hashPw(pass),
      createdAt: new Date().toISOString(),
    };
    saveOfflineUsers(users);

    UI.loginOk('Account erstellt!');
    setTimeout(() => {
      const uid = 'offline_' + username;
      localStorage.setItem(CURRENT_UID_KEY, uid);
      onLoginSuccess({ id: uid, name: username, email: '', picture: '', provider: 'local' });
    }, 800);
  }

  async function changePassword() {
    const username = Store.currentUser?.name;
    if (!username || Store.currentUser.provider !== 'local') {
      showPwMsg('err', 'Nur für lokale Accounts verfügbar.'); return;
    }

    const oldPw = document.getElementById('cpOld').value;
    const newPw = document.getElementById('cpNew').value;
    const newPw2 = document.getElementById('cpNew2').value;

    if (!oldPw || !newPw || !newPw2) { showPwMsg('err', 'Alle Felder ausfüllen.'); return; }
    if (newPw.length < 6)            { showPwMsg('err', 'Neues PW mind. 6 Zeichen.'); return; }
    if (newPw !== newPw2)            { showPwMsg('err', 'Passwörter stimmen nicht überein.'); return; }

    const users   = getOfflineUsers();
    const oldHash = await hashPw(oldPw);

    if (users[username].passwordHash !== oldHash) {
      showPwMsg('err', 'Aktuelles Passwort falsch.'); return;
    }

    users[username].passwordHash = await hashPw(newPw);
    saveOfflineUsers(users);
    showPwMsg('ok', 'Passwort geändert!');
    setTimeout(() => UI.closeChangePw(), 1500);
  }

  function showPwMsg(type, msg) {
    const errEl = document.getElementById('changePwError');
    const sucEl = document.getElementById('changePwSuccess');
    errEl.style.display = 'none';
    sucEl.style.display = 'none';
    if (type === 'err') { errEl.textContent = '⚠ ' + msg; errEl.style.display = 'block'; }
    else                { sucEl.textContent = '✓ ' + msg;  sucEl.style.display = 'block'; }
  }

  // ── Logout ───────────────────────────────────────────
  function logout() {
    UI.closeDropdown();
    if (typeof Timer !== 'undefined') Timer.stop();
    Store.currentUser = null;
    localStorage.removeItem(CURRENT_UID_KEY);
    if (window.google?.accounts) google.accounts.id.disableAutoSelect();
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    UI.hideLoginMsg();
  }

  // ── Auto-login on page load ───────────────────────────
  function tryAutoLogin() {
    const uid = localStorage.getItem(CURRENT_UID_KEY);
    if (!uid) return false;

    if (uid.startsWith('offline_')) {
      const name = uid.replace('offline_', '');
      onLoginSuccess({ id: uid, name, email: '', picture: '', provider: 'local' });
      return true;
    }

    const sessions = getSessions();
    if (sessions[uid]) {
      onLoginSuccess({ ...sessions[uid], provider: 'google' });
      return true;
    }

    return false;
  }

  // ── Internal: fire login success ─────────────────────
  function onLoginSuccess(user) {
    Store.currentUser = user;
    Store.load(user.id);
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    UI.renderUserBadge(user);
    Tasks.render();
    Stats.update();
    Tasks.updateFocusView();
  }

  // ── Public API ────────────────────────────────────────
  return {
    saveClientId,
    initGoogleSignIn,
    offlineLogin,
    register,
    changePassword,
    logout,
    tryAutoLogin,
    getClientId,
  };

})();
