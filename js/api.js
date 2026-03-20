/* ════════════════════════════════════════
   js/api.js — Groq API wrapper
   Fast inference: llama, mixtral etc.
   ════════════════════════════════════════ */

const API = (() => {

  const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
  const MODEL    = 'llama-3.3-70b-versatile';

  function getKey() {
    return document.getElementById('grokKey')?.value.trim() || '';
  }

  async function call(system, userMsg, maxTokens = 1200) {
    const key = getKey();
    if (!key) throw new Error('Bitte Groq API Key eingeben!');

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
      throw new Error(err.error?.message || `Groq Fehler ${res.status}`);
    }

    return (await res.json()).choices[0].message.content;
  }

  async function chat(system, messages, maxTokens = 500) {
    const key = getKey();
    if (!key) throw new Error('Bitte Groq API Key eingeben!');

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
      throw new Error(err.error?.message || `Groq Fehler ${res.status}`);
    }

    return (await res.json()).choices[0].message.content;
  }

  function parseJSON(text) {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  return { call, chat, parseJSON };

})();