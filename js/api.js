/* ════════════════════════════════════════
   js/api.js — xAI Grok API wrapper
   ════════════════════════════════════════ */

const API = (() => {

  const ENDPOINT = 'https://api.x.ai/v1/chat/completions';
 const MODEL = 'grok-3-beta';

  function getKey() {
    const el = document.getElementById('grokKey');
    return el ? el.value.trim() : '';
  }

  /**
   * Single-turn call (system + one user message)
   */
  async function call(system, userMsg, maxTokens = 1200) {
    const key = getKey();
    if (!key) throw new Error('Bitte xAI / Grok API Key eingeben!');

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: userMsg },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Grok Fehler ${res.status}`);
    }

    return (await res.json()).choices[0].message.content;
  }

  /**
   * Multi-turn chat (full history)
   */
  async function chat(system, messages, maxTokens = 500) {
    const key = getKey();
    if (!key) throw new Error('Bitte xAI / Grok API Key eingeben!');

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          ...messages,
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Grok Fehler ${res.status}`);
    }

    return (await res.json()).choices[0].message.content;
  }

  /** Strip JSON fences and parse safely */
  function parseJSON(text) {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  return { call, chat, parseJSON };

})();
