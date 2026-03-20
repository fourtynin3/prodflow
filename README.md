# PRODFLOW — AI Workflow Coach für Producer

Ein intelligenter Workflow-Coach speziell für Beatmaker und Music Producer.

---

## 🚀 Schnellstart

### Option A — Direkt im Browser öffnen
```
Doppelklick auf index.html
```
> ⚠️ Google Login funktioniert **nicht** via `file://`.  
> Nutze für Google Login einen lokalen Server (Option B).

### Option B — Mit lokalem Server (empfohlen)
```bash
# Mit VS Code Live Server Extension:
Rechtsklick auf index.html → "Open with Live Server"

# Oder mit Node.js:
npx serve .

# Oder mit Python:
python3 -m http.server 5500
```
Dann öffne: `http://localhost:5500`

---

## 🔑 API Keys einrichten

### 1. Anthropic API Key
- Hole deinen Key auf: https://console.anthropic.com
- In der App oben in das 🔑 Feld einfügen
- Wird **nicht gespeichert**, nur im Browser-Speicher während der Session

### 2. Google OAuth (optional)
1. Gehe zu https://console.cloud.google.com/apis/credentials
2. Projekt erstellen → **OAuth 2.0 Client ID** anlegen
3. Typ: **Webanwendung**
4. Erlaubte JS-Ursprünge eintragen (z.B. `http://localhost:5500`)
5. Client ID in der App einfügen und speichern

> Ohne Google Login kannst du den **lokalen Account** (Username + Passwort) nutzen.

---

## 📁 Projektstruktur

```
prodflow/
├── index.html          # Haupt-HTML (alle Views)
├── css/
│   ├── base.css        # Variablen, Reset, Buttons, Inputs
│   ├── login.css       # Login-Screen Styles
│   ├── app.css         # Header, Tabs, Layout
│   └── components.css  # Panels, Cards, Session, Tasks, Chat
└── js/
    ├── store.js        # User-Daten (localStorage, pro Account)
    ├── api.js          # Anthropic API Wrapper
    ├── auth.js         # Google OAuth + lokaler Login
    ├── session.js      # Session Generator
    ├── tasks.js        # Task Breakdown & Focus Mode
    ├── timer.js        # Pomodoro Timer
    ├── chat.js         # AI Chat / Coach
    ├── stats.js        # Statistiken
    ├── ui.js           # UI Helpers, Tabs, Modals
    └── main.js         # App Entry Point
```

---

## ⚙️ Features

| Feature | Beschreibung |
|---|---|
| 🎧 Session Generator | KI erstellt zeitstrukturierte Beatmaking-Sessions |
| 📋 Task Breakdown | KI zerlegt "Beat machen" in konkrete Sub-Tasks |
| ⚡ Focus Mode | Eine Task, ein Timer, kein Noise |
| 🧠 AI Chat | Producer Coach für Fragen & Kreativblock |
| 📊 Stats | Sessions, Tasks, Fokusminuten getrackt |
| 🔐 Login | Google OAuth + lokale Accounts (multi-user) |

---

## 🛠️ In VS Code entwickeln

**Empfohlene Extensions:**
- **Live Server** — lokaler Dev-Server mit Auto-Reload
- **Prettier** — Code Formatting
- **ESLint** — JS Linting

**Tipps:**
- Alle Module sind in `js/` als eigenständige IIFE-Module aufgebaut
- CSS-Variablen sind in `css/base.css` zentralisiert
- Zum Debuggen: Browser DevTools → Console

---

## 📦 Für Produktion deployen

1. Dateien auf einen Webserver hochladen (z.B. Netlify, Vercel, GitHub Pages)
2. Google OAuth: Domain in Cloud Console als erlaubten Ursprung eintragen
3. Fertig — kein Build-Schritt nötig, reines HTML/CSS/JS

---

## 📝 Lizenz
Privates Projekt — alle Rechte vorbehalten.
