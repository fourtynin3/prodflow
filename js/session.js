/* ════════════════════════════════════════
   js/session.js — Session generator logic
   ════════════════════════════════════════ */

const Session = (() => {

  let current = null;

  const SYSTEM = `Du bist ein AI Workflow Coach für Music Producer.
Antworte IMMER auf Deutsch.
Antworte NUR mit validem JSON — kein Markdown, keine Erklärungen.`;

  async function generate() {
    const styleEl    = document.getElementById('style');
    const style      = styleEl.value === 'Custom'
      ? document.getElementById('customStyle').value.trim() || 'Custom'
      : styleEl.value;
    const duration   = parseInt(document.getElementById('duration').value);
    const mood       = document.getElementById('mood').value.trim();

    const btn = document.getElementById('genBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Generiere Session…';

    const outputPanel = document.getElementById('sessionOutput');
    outputPanel.style.display = 'block';
    document.getElementById('sessionBlocks').innerHTML =
      '<div class="loading-wrap"><div class="spinner"></div>KI plant deine Session…</div>';

    const prompt = `Erstelle eine optimierte Beatmaking-Session.
Style: ${style}
Dauer: ${duration} Minuten
${mood ? 'Mood/Vibe: ' + mood : ''}

JSON Format (strikt einhalten):
{
  "title": "Kurzer kreativer Session-Titel",
  "tip": "Ein kurzer motivierender Satz",
  "blocks": [
    {
      "startMin": 0,
      "endMin": 20,
      "name": "Blockname",
      "desc": "Was genau zu tun ist (konkret, style-spezifisch)",
      "tag": "MELODY"
    }
  ]
}

Maximal 6 Blöcke. Blöcke summieren genau zu ${duration} Minuten.
Mögliche Tags: MELODY, DRUMS, BASS, 808, ARRANGEMENT, MIX, SOUND DESIGN, SAMPLE, FX, EXPORT.`;

    try {
      const text = await API.call(SYSTEM, prompt, 1200);
      const json = API.parseJSON(text);

      current = { style, duration, mood, ...json };
      Store.stats.sessions++;
      Store.save();

      renderSession(json);
      document.getElementById('nextStepBox').style.display = 'flex';
      document.getElementById('nextStepText').textContent =
        json.blocks[0].name + ' — ' + json.blocks[0].desc;

    } catch (err) {
      document.getElementById('sessionBlocks').innerHTML =
        `<div style="color:var(--danger);padding:16px;font-size:13px;">⚠ ${err.message}</div>`;
    }

    btn.disabled = false;
    btn.textContent = '⚡ SESSION GENERIEREN';
  }

  function renderSession(json) {
    // Meta tags
    const meta = document.getElementById('sessionMeta');
    meta.innerHTML = `
      <span class="meta-tag meta-tag--style">${current.style}</span>
      <span class="meta-tag meta-tag--time">${current.duration} min</span>
      ${json.tip ? `<span class="meta-tip">"${json.tip}"</span>` : ''}
    `;

    // Time blocks
    const container = document.getElementById('sessionBlocks');
    container.innerHTML = '';

    json.blocks.forEach((block, i) => {
      const div = document.createElement('div');
      div.className = 'session-block';
      div.style.animationDelay = `${i * 0.06}s`;
      div.innerHTML = `
        <div class="time-badge">${pad(block.startMin)}:00 – ${pad(block.endMin)}:00</div>
        <div class="block-content">
          <div class="block-title">${block.name}</div>
          <div class="block-desc">${block.desc}</div>
          <span class="block-tag">${block.tag}</span>
        </div>
      `;
      container.appendChild(div);
    });
  }

  async function refreshNextStep() {
    if (!current) return;

    const el = document.getElementById('nextStepText');
    el.textContent = '⏳ Lade…';

    try {
      const resp = await API.call(
        'Du bist ein AI Music Producer Coach. Antworte auf Deutsch, in einem Satz, direkt und actionable.',
        `Style: ${current.style}. Welches ist jetzt der konkreteste nächste Schritt? Nur einen Satz.`,
        120
      );
      el.textContent = resp.trim();
    } catch (err) {
      el.textContent = '⚠ ' + err.message;
    }
  }

  function loadToTasks() {
    if (!current?.blocks) return;
    current.blocks.forEach(b => {
      Store.tasks.push({
        id: Date.now() + Math.random(),
        text: `[${b.tag}] ${b.name}: ${b.desc}`,
        done: false,
      });
    });
    Store.save();
    UI.switchTab('tasks');
    Tasks.render();
  }

  function startFocus() {
    loadToTasks();
    UI.switchTab('focus');
  }

  function getCurrent() { return current; }

  function pad(n) { return String(n).padStart(2, '0'); }

  return { generate, refreshNextStep, loadToTasks, startFocus, getCurrent };

})();
