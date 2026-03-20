/* ════════════════════════════════════════
   js/tasks.js — Task breakdown & management
   ════════════════════════════════════════ */

const Tasks = (() => {

  const SYSTEM = `Du bist ein Music Production Workflow Experte.
Antworte NUR mit validem JSON — kein Markdown, keine Erklärungen.`;

  // ── AI Breakdown ─────────────────────────────────────
  async function breakdown() {
    const input = document.getElementById('taskInput').value.trim();
    if (!input) return;

    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '⏳ Analysiere…';

    try {
      const text = await API.call(
        SYSTEM,
        `Zerlege diesen Task in konkrete, umsetzbare Sub-Tasks für einen Music Producer:
"${input}"

JSON Format:
{"tasks": ["Sub-Task 1", "Sub-Task 2", ...]}

Maximal 8 Tasks. Konkret, praxisorientiert, auf Deutsch.`,
        600
      );

      const json = API.parseJSON(text);
      json.tasks.forEach(t => {
        Store.tasks.push({ id: Date.now() + Math.random(), text: t, done: false });
      });
      Store.save();
      render();

    } catch (err) {
      alert('⚠ ' + err.message);
    }

    btn.disabled = false;
    btn.textContent = '🧠 AI Breakdown';
  }

  // ── Manual Add ───────────────────────────────────────
  function showManualAdd() {
    document.getElementById('manualAddPanel').style.display = 'block';
    document.getElementById('manualTaskInput').focus();
  }

  function hideManualAdd() {
    document.getElementById('manualAddPanel').style.display = 'none';
    document.getElementById('manualTaskInput').value = '';
  }

  function saveManual() {
    const val = document.getElementById('manualTaskInput').value.trim();
    if (!val) return;
    Store.tasks.push({ id: Date.now(), text: val, done: false });
    Store.save();
    render();
    hideManualAdd();
  }

  // ── Render ───────────────────────────────────────────
  function render() {
    const panel = document.getElementById('taskListPanel');
    const tasks = Store.tasks;

    if (!tasks.length) {
      panel.style.display = 'none';
      updateFocusView();
      return;
    }

    panel.style.display = 'block';

    // Progress bar
    const done = tasks.filter(t => t.done).length;
    const pct  = Math.round((done / tasks.length) * 100);

    document.getElementById('taskProgress').innerHTML = `
      <div class="progress-label">
        <span>${done}/${tasks.length} Tasks</span>
        <span>${pct}%</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${pct}%"></div>
      </div>
    `;

    // Task list
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasks.forEach((task, i) => {
      const div = document.createElement('div');
      div.className = 'task-item';
      div.style.animationDelay = `${i * 0.04}s`;

      div.innerHTML = `
        <span class="task-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="task-check ${task.done ? 'done' : ''}" onclick="Tasks.toggle(${i})"></div>
        <div class="task-text ${task.done ? 'done' : ''}">${escapeHtml(task.text)}</div>
        <button class="task-delete" onclick="Tasks.remove(${i})" title="Löschen">✕</button>
      `;
      list.appendChild(div);
    });

    Stats.update();
    updateFocusView();
  }

  // ── CRUD ─────────────────────────────────────────────
  function toggle(i) {
    Store.tasks[i].done = !Store.tasks[i].done;
    if (Store.tasks[i].done) {
      Store.stats.tasksDone++;
      Store.save();
    }
    Store.save();
    render();
  }

  function remove(i) {
    Store.tasks.splice(i, 1);
    Store.save();
    render();
  }

  function clearAll() {
    if (!confirm('Alle Tasks löschen?')) return;
    Store.tasks = [];
    Store.save();
    render();
  }

  // ── Focus Mode ───────────────────────────────────────
  function updateFocusView() {
    const active = Store.tasks.filter(t => !t.done);
    const emptyEl  = document.getElementById('focusEmpty');
    const activeEl = document.getElementById('focusActive');

    if (!active.length) {
      emptyEl.style.display  = 'block';
      activeEl.style.display = 'none';
      return;
    }

    emptyEl.style.display  = 'none';
    activeEl.style.display = 'block';

    document.getElementById('focusTask').textContent =
      active[0].text;
    document.getElementById('focusNextTask').textContent =
      active.length > 1 ? active[1].text : '✓ Das war der letzte Task!';
  }

  function focusDone() {
    const active = Store.tasks.filter(t => !t.done);
    if (!active.length) return;

    const idx = Store.tasks.findIndex(t => t.id === active[0].id);
    Store.tasks[idx].done = true;
    Store.stats.tasksDone++;
    Store.save();
    Timer.reset();
    render();
  }

  function focusSkip() {
    const active = Store.tasks.filter(t => !t.done);
    if (active.length < 2) return;

    const idx  = Store.tasks.findIndex(t => t.id === active[0].id);
    const task = Store.tasks.splice(idx, 1)[0];
    Store.tasks.push(task);
    Store.save();
    Timer.reset();
    updateFocusView();
  }

  function exitFocus() {
    Timer.reset();
    UI.switchTab('tasks');
  }

  // ── Utils ─────────────────────────────────────────────
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    breakdown,
    showManualAdd, hideManualAdd, saveManual,
    render,
    toggle, remove, clearAll,
    updateFocusView,
    focusDone, focusSkip, exitFocus,
  };

})();
