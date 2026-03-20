/* ════════════════════════════════════════
   js/ui.js — UI helpers, tabs, modals
   ════════════════════════════════════════ */

const UI = (() => {

  // ── Tab switching ─────────────────────────────────────
  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === name);
    });
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });
    const target = document.getElementById('view-' + name);
    if (target) target.classList.add('active');

    if (name === 'stats')  Stats.update();
    if (name === 'focus')  Tasks.updateFocusView();
  }

  // ── Style select: show/hide custom input ──────────────
  function onStyleChange() {
    const val = document.getElementById('style').value;
    document.getElementById('customStyleWrap').style.display =
      val === 'Custom' ? 'block' : 'none';
  }

  // ── Offline login tabs ────────────────────────────────
  function setOfflineTab(tab) {
    document.getElementById('ot-login').classList.toggle('active', tab === 'login');
    document.getElementById('ot-reg').classList.toggle('active', tab === 'register');
    document.getElementById('offlineLoginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('offlineRegForm').style.display   = tab === 'register' ? 'block' : 'none';
    hideLoginMsg();
  }

  // ── Login messages ────────────────────────────────────
  function loginErr(msg) {
    const el = document.getElementById('loginError');
    el.textContent = '⚠ ' + msg;
    el.style.display = 'block';
    document.getElementById('loginSuccess').style.display = 'none';
  }

  function loginOk(msg) {
    const el = document.getElementById('loginSuccess');
    el.textContent = '✓ ' + msg;
    el.style.display = 'block';
    document.getElementById('loginError').style.display = 'none';
  }

  function hideLoginMsg() {
    document.getElementById('loginError').style.display   = 'none';
    document.getElementById('loginSuccess').style.display = 'none';
  }

  // ── User badge ────────────────────────────────────────
  function renderUserBadge(user) {
    const img      = document.getElementById('headerAvatarImg');
    const fallback = document.getElementById('headerAvatarFallback');

    if (user.picture) {
      img.src = user.picture;
      img.style.display = 'block';
      fallback.style.display = 'none';
    } else {
      fallback.textContent = (user.name || '?')[0].toUpperCase();
      fallback.style.display = 'flex';
      img.style.display = 'none';
    }

    document.getElementById('headerUsername').textContent =
      user.name || user.email || 'User';
    document.getElementById('headerProvider').textContent =
      user.provider === 'google' ? 'Google' : 'Lokal';
    document.getElementById('dropEmail').textContent =
      user.email || '@' + user.name;
  }

  // ── Dropdown ──────────────────────────────────────────
  function toggleDropdown() {
    document.getElementById('userDropdown').classList.toggle('open');
  }

  function closeDropdown() {
    document.getElementById('userDropdown').classList.remove('open');
  }

  // ── Change Password panel ─────────────────────────────
  function openChangePw() {
    closeDropdown();
    const panel = document.getElementById('changePwPanel');
    panel.style.display = 'block';
    // Clear fields & messages
    ['cpOld', 'cpNew', 'cpNew2'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('changePwError').style.display   = 'none';
    document.getElementById('changePwSuccess').style.display = 'none';
  }

  function closeChangePw() {
    document.getElementById('changePwPanel').style.display = 'none';
  }

  return {
    switchTab,
    onStyleChange,
    setOfflineTab,
    loginErr, loginOk, hideLoginMsg,
    renderUserBadge,
    toggleDropdown, closeDropdown,
    openChangePw, closeChangePw,
  };

})();

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.user-badge')) UI.closeDropdown();
});
