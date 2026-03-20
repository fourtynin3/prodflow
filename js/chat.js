/* ════════════════════════════════════════
   js/chat.js — AI chat / coach
   ════════════════════════════════════════ */

const Chat = (() => {

  const SYSTEM = `Du bist PRODFLOW, ein AI Workflow Coach speziell für Music Producer und Beatmaker.
Du hilfst bei:
- Workflow und Strukturierung von Sessions
- Sound Design Tipps (Trap, Drill, R&B, etc.)
- Mixing und Mastering Basics
- Kreativblockaden überwinden
- Beat-Struktur und Arrangement
- Motivation und Fokus

Antworte auf Deutsch, direkt und praxisnah.
Maximal 4-5 Sätze pro Antwort. Nutze gerne Emojis.`;

  let history = [];

  async function send() {
    const input = document.getElementById('chatInput');
    const msg   = input.value.trim();
    if (!msg) return;
    input.value = '';
    await quick(msg);
  }

  async function quick(msg) {
    addMsg('user', msg);
    history.push({ role: 'user', content: msg });

    const container = document.getElementById('chatMessages');
    const loading = createLoading();
    container.appendChild(loading);
    container.scrollTop = container.scrollHeight;

    try {
      const text = await API.chat(SYSTEM, history, 500);
      history.push({ role: 'assistant', content: text });
      loading.remove();
      addMsg('ai', text);
    } catch (err) {
      loading.remove();
      addMsg('ai', '⚠ ' + err.message);
    }
  }

  function addMsg(role, text) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `msg msg-${role}`;
    div.innerHTML = `
      <div class="msg-label">${role === 'ai' ? 'PRODFLOW AI' : 'DU'}</div>
      ${text}
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function createLoading() {
    const div = document.createElement('div');
    div.className = 'loading-wrap';
    div.innerHTML = '<div class="spinner"></div>PRODFLOW denkt nach…';
    return div;
  }

  function clearHistory() {
    history = [];
  }

  return { send, quick, clearHistory };

})();
