/* ════════════════════════════════════════
   js/stats.js  — Stats display (no file
   needed — included inside ui.js below)
   ════════════════════════════════════════ */

const Stats = (() => {

  function update() {
    const tasks = Store.tasks;
    const stats = Store.stats;

    const done  = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const pct   = total ? Math.round((done / total) * 100) : 0;

    setText('stat-sessions', stats.sessions);
    setText('stat-tasks',    stats.tasksDone);
    setText('stat-time',     stats.focusMinutes);
    setText('progDone',      `${done} Tasks erledigt`);
    setText('progTotal',     `${total} gesamt`);

    const bar = document.getElementById('mainProgress');
    if (bar) bar.style.width = pct + '%';
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  return { update };

})();
