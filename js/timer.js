/* ════════════════════════════════════════
   js/timer.js — Pomodoro / focus timer
   ════════════════════════════════════════ */

const Timer = (() => {

  let seconds   = 25 * 60;
  let running   = false;
  let interval  = null;

  function set(minutes) {
    stop();
    seconds = minutes * 60;
    render();
  }

  function reset() {
    stop();
    seconds = 25 * 60;
    render();
  }

  function stop() {
    if (!running) return;
    clearInterval(interval);
    running = false;
    updateBtn();
  }

  function toggle() {
    if (running) {
      stop();
    } else {
      running = true;
      updateBtn();
      interval = setInterval(tick, 1000);
    }
  }

  function tick() {
    if (seconds <= 0) {
      stop();
      // Award focus minutes
      Store.stats.focusMinutes += 25;
      Store.save();
      Stats.update();
      // Auto-reset
      seconds = 25 * 60;
      render();
      return;
    }
    seconds--;
    render();
  }

  function render() {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const el = document.getElementById('timerDisplay');
    if (el) {
      el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  function updateBtn() {
    const btn = document.getElementById('timerBtn');
    if (btn) btn.textContent = running ? '⏸ PAUSE' : '▶ START';
  }

  return { set, reset, stop, toggle };

})();
