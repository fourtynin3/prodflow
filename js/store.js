/* ════════════════════════════════════════
   js/store.js — Per-user data persistence
   ════════════════════════════════════════ */

const Store = (() => {

  let currentUser = null;

  function dataKey(uid) {
    return `pf_data_${uid}`;
  }

  function load(uid) {
    const raw = localStorage.getItem(dataKey(uid));
    if (raw) {
      try {
        const d = JSON.parse(raw);
        Store._tasks = d.tasks || [];
        Store._stats = d.stats || defaultStats();
      } catch {
        Store._tasks = [];
        Store._stats = defaultStats();
      }
    } else {
      Store._tasks = [];
      Store._stats = defaultStats();
    }
  }

  function save() {
    if (!currentUser) return;
    localStorage.setItem(dataKey(currentUser.id), JSON.stringify({
      tasks: Store._tasks,
      stats: Store._stats,
    }));
  }

  function defaultStats() {
    return { sessions: 0, tasksDone: 0, focusMinutes: 0 };
  }

  function resetAll() {
    if (!confirm('Wirklich alle Daten zurücksetzen?')) return;
    Store._tasks = [];
    Store._stats = defaultStats();
    save();
    Tasks.render();
    Stats.update();
  }

  // Expose mutable state via getters/setters so modules can share it
  return {
    get currentUser() { return currentUser; },
    set currentUser(u) { currentUser = u; },

    get tasks() { return Store._tasks; },
    set tasks(v) { Store._tasks = v; },

    get stats() { return Store._stats; },
    set stats(v) { Store._stats = v; },

    load,
    save,
    resetAll,
    defaultStats,
  };

})();

// Initialise backing arrays immediately so other modules can reference them
Store._tasks = [];
Store._stats = Store.defaultStats();
