/* ════════════════════════════════════════
   js/auth.js — Google OAuth + local auth
   ════════════════════════════════════════ */

const Auth = (() => {

  const CLIENT_ID_KEY   = 'pf_google_client_id';
  const SESSIONS_KEY    = 'pf_google_sessions';
  const CURRENT_UID_KEY = 'pf_current_uid';
  const OFFLINE_KEY     = 'pf_offline_users';

  function getClientId()     { return 'GOOGLE_CLIENT_ID_PLACEHOLDER'; }
  function getSessions()     { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}'); }
  function getOfflineUsers() { return JSON.parse(localStorage.getItem(OFFLINE_KEY) || '{}'); }
  function saveOfflineUsers(u) { localStorage.setItem(OFFLINE_KEY, JSON.stringify(u)); }

  async function hashPw(pw) {
    const enc = new TextEncoder().encode(pw + 'pf_salt_9z3k');
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  // ── Google Client ID ─────────────────────────────────
  function saveClientId() {
    const val = document.getElementById('clientIdInput').value.trim();
    if (!val || !val.includes('googleusercontent.com')) {
      UI.loginErr('Ungültige Client ID'); return;
    }
    localStorage.setItem(CLIENT_ID_KEY, val);
    UI.loginOk('Gespeichert! Google Login wird geladen…');
    setTimeout(() => { UI.hideLoginMsg(); initGoogleSignIn(val); }, 800);
  }

  function initGoogleSignIn(clientId) {
    if (!window.google?.accounts) {
      setTimeout(() => initGoogleSignIn(clientId), 300); return;
    }
    document.getElementById('setupPanel').style.display = 'none';

    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
      auto_select: false,
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtnContainer'),
      { theme: 'filled_black', size: 'large', shape: 'rectangular', width: 320, text: 'continue_with' }
    );

    google.accounts.id.prompt();
  }

  function handleGoogleCredential(response) {
    const parts   = response.credential.split('.');
    const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
    const user = {
      id: payload.sub, name: payload.name,
      email: payload.email, picture: payload.picture || '', provider: 'google',
    };
    const sessions = getSessions();
    sessions[user.id] = { ...user, lastLogin: new Date().toISOString() };
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    localStorage.setItem(CURRENT_UID_KEY, user.id);
    onLoginSuccess(user);
  }

  // ── Offline Login ─────────────────────────────────────
  async function offlineLogin() {
    const username = document.getElementById('loginUser').value.trim().toLowerCase();
    const pass     = document.getElementById('loginPass').value;
    if (!username || !pass) { UI.loginErr('Bitte alle Felder ausfüllen.'); return; }
    const users = getOfflineUsers();
    if (!users[username]) { UI.loginErr('Account nicht gefunden.'); return; }
    if (users[username].passwordHash !== await hashPw(pass)) { UI.loginErr('Falsches Passwort.'); return; }
    const uid = 'offline_' + username;
    localStorage.setItem(CURRENT_UID_KEY, uid);
    onLoginSuccess({ id: uid, name: username, email: '', picture: '', provider: 'local' });
  }

  // ── Register ──────────────────────────────────────────
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
    users[username] = { passwordHash: await hashPw(pass), createdAt: new Date().toISOString() };
    saveOfflineUsers(users);
    UI.loginOk('Account erstellt!');
    setTimeout(() => {
      const uid = 'offline_' + username;
      localStorage.setItem(CURRENT_UID_KEY, uid);
      onLoginSuccess({ id: uid, name: username, email: '', picture: '', provider: 'local' });
    }, 800);
  }

  // ── Change Password ───────────────────────────────────
  async function changePassword() {
    const username = Store.currentUser?.name;
    if (!username || Store.currentUser.provider !== 'local') return;
    const oldPw = document.getElementById('cpOld').value;
    const newPw = document.getElementById('cpNew').value;
    const newPw2 = document.getElementById('cpNew2').value;
    const errEl = document.getElementById('changePwError');
    const sucEl = document.getElementById('changePwSuccess');
    errEl.style.display = 'none'; sucEl.style.display = 'none';
    if (!oldPw || !newPw || !newPw2) { errEl.textContent = '⚠ Alle Felder ausfüllen'; errEl.style.display = 'block'; return; }
    if (newPw.length < 6) { errEl.textContent = '⚠ Mind. 6 Zeichen'; errEl.style.display = 'block'; return; }
    if (newPw !== newPw2) { errEl.textContent = '⚠ Passwörter stimmen nicht überein'; errEl.style.display = 'block'; return; }
    const users = getOfflineUsers();
    if (users[username].passwordHash !== await hashPw(oldPw)) {
      errEl.textContent = '⚠ Aktuelles Passwort falsch'; errEl.style.display = 'block'; return;
    }
    users[username].passwordHash = await hashPw(newPw);
    saveOfflineUsers(users);
    sucEl.textContent = '✓ Passwort geändert!'; sucEl.style.display = 'block';
    setTimeout(() => UI.closeChangePw(), 1500);
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

  // ── Auto-login ────────────────────────────────────────
  function tryAutoLogin() {
    const uid = localStorage.getItem(CURRENT_UID_KEY);
    if (!uid) return false;
    if (uid.startsWith('offline_')) {
      const name = uid.replace('offline_', '');
      onLoginSuccess({ id: uid, name, email: '', picture: '', provider: 'local' });
      return true;
    }
    const sessions = getSessions();
    if (sessions[uid]) { onLoginSuccess({ ...sessions[uid], provider: 'google' }); return true; }
    return false;
  }

  // ── Internal ─────────────────────────────────────────
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

  return { saveClientId, initGoogleSignIn, offlineLogin, register, changePassword, logout, tryAutoLogin, getClientId };

})();
