/**
 * ============================================================================
 * SCARFACE LAB NEURAL COMPANION ENGINE
 * Powered by Google Gemini API (Model: gemini-3.5-flash)
 * ============================================================================
 * Features:
 * - Direct Gemini API integration with streaming / fast inference
 * - Primary model target: gemini-3.5-flash (with seamless fallback)
 * - Persistent chat history stored locally
 * - Markdown & Code block formatting with instant copy button
 * - Clean Flexbox UI integration for both companion.html and index.html
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CompanionEngine = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  class GeminiCompanion {
    constructor(options = {}) {
      this.storageKey = 'scarface_companion_history_v1';
      this.apiKeyStorageKey = 'gemini_api_key';
      this.modelStorageKey = 'gemini_companion_model';

      this.model = (typeof localStorage !== 'undefined' && localStorage.getItem(this.modelStorageKey)) || 'gemini-3.5-flash';
      this.apiKey = (typeof localStorage !== 'undefined' && localStorage.getItem(this.apiKeyStorageKey)) || '';

      this.messages = this.loadHistory();
      this.isThinking = false;

      // System context prompt
      this.systemPrompt = `You are the Scarface Lab Neural Companion, an ultra-intelligent, futuristic AI assistant operating in Mir A K Sajid's CSE Portfolio and HSC Academic Hub.
Your traits:
- Technical excellence in Systems Programming (C, C++, Rust, Linux Kernel, Compilers, Distributed Systems, WebAssembly).
- Deep mastery in HSC Academic Sciences (Physics 1st & 2nd paper, Chemistry CQ/MCQ, Higher Math shortcuts, Biology).
- Clear, concise, structured responses using GitHub-flavored markdown.
- Code blocks must always have the correct language identifier.
- Professional, supportive, and sharp cyber-hacker persona.`;

      // DOM bindings
      this.container = options.container || null;
      this.messagesContainer = options.messagesContainer || null;
      this.inputEl = options.inputEl || null;
      this.sendBtn = options.sendBtn || null;
      this.statusEl = options.statusEl || null;

      if (options.autoInit !== false) {
        this.init();
      }
    }

    init() {
      this.bindEvents();
      this.renderMessages();
      this.updateStatus();
    }

    loadHistory() {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {}
        }
      }
      return [
        {
          role: 'model',
          text: `⚡ **Neural Companion Online**\n\nInitialized with **${this.model}**. I am your real-time CSE Systems & HSC Academic AI tutor.\n\nAsk me anything about systems programming, debug code, or solve HSC Physics & Chemistry problems!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }

    saveHistory() {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.messages.slice(-50)));
        } catch (e) {}
      }
    }

    clearHistory() {
      this.messages = [
        {
          role: 'model',
          text: `⚡ **Neural Memory Flushed**\n\nSession reset. Ready for new instructions with model \`${this.model}\`.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      this.saveHistory();
      this.renderMessages();
    }

    setApiKey(key) {
      this.apiKey = (key || '').trim();
      if (typeof localStorage !== 'undefined') {
        if (this.apiKey) {
          localStorage.setItem(this.apiKeyStorageKey, this.apiKey);
        } else {
          localStorage.removeItem(this.apiKeyStorageKey);
        }
      }
      this.updateStatus();
    }

    setModel(modelName) {
      this.model = modelName || 'gemini-3.5-flash';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.modelStorageKey, this.model);
      }
      this.updateStatus();
    }

    updateStatus() {
      if (this.statusEl) {
        const hasKey = Boolean(this.apiKey);
        this.statusEl.innerHTML = `
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${hasKey ? '#10b981' : '#f59e0b'};box-shadow:0 0 8px ${hasKey ? '#10b981' : '#f59e0b'};margin-right:6px;"></span>
          <strong>${this.model}</strong> • ${hasKey ? 'ACTIVE' : 'KEY REQUIRED'}
        `;
      }
    }

    bindEvents() {
      if (this.sendBtn && this.inputEl) {
        this.sendBtn.addEventListener('click', () => this.handleUserSend());
        this.inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleUserSend();
          }
        });
      }

      // Quick prompt pills
      document.querySelectorAll('.companion-quick-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const prompt = pill.getAttribute('data-prompt');
          if (prompt && this.inputEl) {
            this.inputEl.value = prompt;
            this.handleUserSend();
          }
        });
      });
    }

    async handleUserSend() {
      if (!this.inputEl || this.isThinking) return;
      const text = this.inputEl.value.trim();
      if (!text) return;

      this.inputEl.value = '';

      // Check for API key
      if (!this.apiKey) {
        this.promptForApiKey(text);
        return;
      }

      // Append user message
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.messages.push({ role: 'user', text, time: timeStr });
      this.saveHistory();
      this.renderMessages();

      // Mechanical audio feedback
      if (typeof window !== 'undefined' && window.vintageSound && typeof window.vintageSound.playMechanicalClick === 'function') {
        window.vintageSound.playMechanicalClick(1400, 0.02);
      }

      await this.sendToGemini(text);
    }

    promptForApiKey(pendingText = '') {
      let modal = document.getElementById('companionApiKeyModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'companionApiKeyModal';
        modal.className = 'vintage-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
          <div class="vintage-modal-backdrop" id="apiKeyBackdrop"></div>
          <div class="vintage-modal-dialog parchment-paper" style="max-width: 480px; z-index: 2000; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0; font-size: 1.1rem; color: #00f0ff; display: flex; align-items: center; gap: 0.5rem;">
                <span>🔑</span> Configure Google Gemini API Key
              </h3>
              <button type="button" id="closeApiKeyModalBtn" style="background:none;border:none;color:#94a3b8;font-size:1.2rem;cursor:pointer;">✕</button>
            </div>
            <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.5;">
              To chat with the <strong>${this.model}</strong> AI companion, enter your Google Gemini API key.
              It is stored safely in your browser's <code>localStorage</code> and never shared.
            </p>
            <div style="display:flex; flex-direction:column; gap:0.4rem;">
              <label style="font-size: 0.75rem; color:#94a3b8; font-family:var(--font-mono);">Gemini API Key (AIzaSy...):</label>
              <input type="password" id="geminiApiKeyInput" class="vintage-input" placeholder="AIzaSy..." value="${this.apiKey || ''}" style="width: 100%; box-sizing: border-box;">
            </div>
            <div style="display:flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color:#38bdf8; text-decoration: underline;">
                Get a free key from Google AI Studio ↗
              </a>
              <button type="button" class="vintage-btn btn-sm btn-primary" id="saveApiKeyModalBtn" style="padding: 0.35rem 0.9rem;">
                Save Key & Connect
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        const close = () => { modal.style.display = 'none'; };
        modal.querySelector('#closeApiKeyModalBtn').addEventListener('click', close);
        modal.querySelector('#apiKeyBackdrop').addEventListener('click', close);

        modal.querySelector('#saveApiKeyModalBtn').addEventListener('click', () => {
          const val = modal.querySelector('#geminiApiKeyInput').value.trim();
          if (val) {
            this.setApiKey(val);
            modal.style.display = 'none';
            if (pendingText) {
              const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              this.messages.push({ role: 'user', text: pendingText, time: timeStr });
              this.saveHistory();
              this.renderMessages();
              this.sendToGemini(pendingText);
            }
          } else {
            alert('Please enter a valid Gemini API key.');
          }
        });
      } else {
        modal.style.display = 'flex';
      }
    }

    async sendToGemini(prompt) {
      this.isThinking = true;
      this.renderThinkingIndicator();

      // Format Gemini conversation payload
      const contents = [];
      const recent = this.messages.slice(-8); // Include context window
      for (const msg of recent) {
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      }

      const bodyPayload = {
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        },
        systemInstruction: {
          parts: [{ text: this.systemPrompt }]
        }
      };

      // Model resolution hierarchy starting with user requested gemini-3.5-flash
      const candidateModels = [
        this.model,
        'gemini-3.5-flash',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ];
      const uniqueModels = Array.from(new Set(candidateModels));

      let replyText = '';
      let usedModel = this.model;
      let lastError = null;

      for (const m of uniqueModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${this.apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
          });

          if (res.ok) {
            const data = await res.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
              replyText = data.candidates[0].content.parts.map(p => p.text).join('\n');
              usedModel = m;
              break;
            }
          } else if (res.status === 404) {
            // Model not recognized in current Google API version, try next in chain
            console.warn(`Model ${m} returned 404, attempting fallback in model chain...`);
            continue;
          } else {
            const errData = await res.json().catch(() => ({}));
            lastError = errData.error?.message || `HTTP ${res.status}`;
            if (res.status === 400 && lastError.includes('API key')) {
              break;
            }
          }
        } catch (networkErr) {
          lastError = networkErr.message;
        }
      }

      this.isThinking = false;
      this.removeThinkingIndicator();

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (replyText) {
        this.messages.push({
          role: 'model',
          text: replyText,
          time: timeStr,
          model: usedModel
        });
      } else {
        const errorMsg = lastError ? `⚠️ **Gemini API Error:** ${lastError}` : `⚠️ Could not reach Gemini model \`${this.model}\`. Please check your API key or network connection.`;
        this.messages.push({
          role: 'model',
          text: errorMsg,
          time: timeStr,
          isError: true
        });
      }

      this.saveHistory();
      this.renderMessages();
    }

    renderThinkingIndicator() {
      if (!this.messagesContainer) return;
      const id = 'companionThinkingRow';
      if (document.getElementById(id)) return;

      const row = document.createElement('div');
      row.id = id;
      row.className = 'companion-msg-row companion-msg-model';
      row.innerHTML = `
        <div class="companion-avatar">🤖</div>
        <div class="companion-bubble thinking">
          <div class="thinking-dots">
            <span></span><span></span><span></span>
          </div>
          <span style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono);">
            Computing with ${this.model}...
          </span>
        </div>
      `;
      this.messagesContainer.appendChild(row);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeThinkingIndicator() {
      const row = document.getElementById('companionThinkingRow');
      if (row) row.remove();
    }

    renderMessages() {
      if (!this.messagesContainer) return;
      this.messagesContainer.innerHTML = '';

      for (const msg of this.messages) {
        const isUser = msg.role === 'user';
        const row = document.createElement('div');
        row.className = `companion-msg-row ${isUser ? 'companion-msg-user' : 'companion-msg-model'}`;

        const avatar = isUser ? '👤' : '🤖';
        const formattedHtml = this.formatMarkdown(msg.text);

        row.innerHTML = `
          <div class="companion-avatar">${avatar}</div>
          <div class="companion-bubble ${isUser ? 'user-bubble' : 'model-bubble'}">
            <div class="companion-msg-header">
              <span class="companion-sender">${isUser ? 'Operator' : 'Gemini 3.5 Flash'}</span>
              <span class="companion-time">${msg.time || ''}</span>
            </div>
            <div class="companion-msg-content">${formattedHtml}</div>
          </div>
        `;
        this.messagesContainer.appendChild(row);
      }

      // Add copy button listeners to all code blocks
      this.messagesContainer.querySelectorAll('.code-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const pre = btn.closest('.code-block-wrapper').querySelector('pre');
          if (pre) {
            navigator.clipboard.writeText(pre.innerText).then(() => {
              btn.textContent = 'Copied! ✓';
              setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
            });
          }
        });
      });

      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    formatMarkdown(text) {
      if (!text) return '';
      let escaped = this.escapeHtml(text);

      // Fenced code blocks ```lang ... ```
      escaped = escaped.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const languageLabel = lang ? lang.toUpperCase() : 'CODE';
        return `
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-lang-tag">${languageLabel}</span>
              <button type="button" class="code-copy-btn">Copy</button>
            </div>
            <pre><code>${code.trim()}</code></pre>
          </div>
        `;
      });

      // Inline code `code`
      escaped = escaped.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

      // Bold **text**
      escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // Italic *text*
      escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Bullet lists
      escaped = escaped.replace(/^[ \t]*[-*][ \t]+(.*)$/gm, '<li class="companion-li">$1</li>');

      // Line breaks
      escaped = escaped.replace(/\n\n/g, '<p></p>');
      escaped = escaped.replace(/\n/g, '<br>');

      return escaped;
    }

    escapeHtml(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag));
    }
  }

  return {
    GeminiCompanion
  };
});
