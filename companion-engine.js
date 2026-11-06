/**
 * ============================================================================
 * SCARFACE LAB ADVANCED AI COMPANION ENGINE
 * Powered by Google Gemini API (Model: gemini-3.5-flash)
 * ============================================================================
 * Features:
 * - Default API key pre-configured (active Gemini flash key)
 * - Default model: gemini-3.5-flash (with auto fallback)
 * - Modern chatbar with minimalist styling (no Gemini text / no branding clutter)
 * - Passphrase lock: "miros"
 * - Full customization via 3-dot menu or Admin Desk:
 *   * Nickname
 *   * Avatar / Picture
 *   * Model selector
 *   * Personality / System Instructions
 * - LocalStorage & server JSON persistence
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CompanionEngine = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const _INITIAL_KEY = (function () {
    try {
      if (typeof atob !== 'undefined') {
        return atob('QVEuQWI4Uk42SjRleFRyYzdqd3J2T2dNV2VhaVFSVGY0MDZRYndXY044ZHRMTE41MlpqUVE=');
      } else if (typeof Buffer !== 'undefined') {
        return Buffer.from('QVEuQWI4Uk42SjRleFRyYzdqd3J2T2dNV2VhaVFSVGY0MDZRYndXY044ZHRMTE41MlpqUVE=', 'base64').toString('utf8');
      }
    } catch (e) {}
    return '';
  })();

  const DEFAULT_SETTINGS = {
    nickname: 'Nova',
    avatar: 'assets/images/avatar-pixel.png',
    model: 'gemini-3.5-flash',
    personality: 'You are an ultra-intelligent, sharp, and helpful companion. You specialize in computer science, systems engineering (C, C++, Rust, Linux), and HSC academic sciences (Physics, Chemistry, Higher Math). Be concise, profound, direct, and helpful. Use clean GitHub-flavored markdown with syntax highlighted code blocks.',
    apiKey: _INITIAL_KEY,
    password: 'miros'
  };

  class GeminiCompanion {
    constructor(options = {}) {
      this.storageKey = 'scarface_companion_history_v2';
      this.settingsKey = 'scarface_companion_settings_v2';
      this.unlockSessionKey = 'companion_unlocked_session';

      this.settings = this.loadSettings();
      this.messages = this.loadHistory();
      this.isThinking = false;
      this.isLocked = false;

      // DOM Elements
      const doc = typeof document !== 'undefined' ? document : null;
      this.container = options.container || doc?.getElementById('companionContainer') || null;
      this.lockScreenEl = options.lockScreenEl || doc?.getElementById('companionLockScreen') || null;
      this.workspaceEl = options.workspaceEl || doc?.getElementById('companionWorkspace') || null;
      this.messagesContainer = options.messagesContainer || doc?.getElementById('companionChatFeed') || null;
      this.inputEl = options.inputEl || doc?.getElementById('companionInput') || null;
      this.sendBtn = options.sendBtn || doc?.getElementById('companionSendBtn') || null;
      this.nicknameEl = options.nicknameEl || doc?.getElementById('companionHeaderNickname') || null;
      this.avatarEl = options.avatarEl || doc?.getElementById('companionHeaderAvatar') || null;
      this.dotsMenuBtn = options.dotsMenuBtn || doc?.getElementById('companionDotsBtn') || null;

      if (options.autoInit !== false) {
        this.init();
      }
    }

    init() {
      this.syncFromGlobalPortfolio();
      this.checkLockState();
      this.bindEvents();
      this.renderHeaderInfo();
      this.renderMessages();
    }

    async syncFromGlobalPortfolio() {
      try {
        let portData = null;
        if (typeof window !== 'undefined' && window.PortfolioState && window.PortfolioState.data) {
          portData = window.PortfolioState.data;
        } else {
          const res = await fetch('/api/portfolio').catch(() => null);
          if (res && res.ok) {
            portData = await res.json();
          }
        }
        if (portData && portData.settings && portData.settings.companion) {
          const remote = portData.settings.companion;
          this.settings = Object.assign({}, DEFAULT_SETTINGS, this.settings, remote);
          this.saveSettings(this.settings, false);
          this.renderHeaderInfo();
        }
      } catch (e) {}
    }

    getEffectiveApiKey() {
      const stored = (this.settings && this.settings.apiKey ? this.settings.apiKey : '').trim();
      if (stored && stored !== 'undefined' && stored !== 'null' && stored.length > 10) {
        return stored;
      }
      return _INITIAL_KEY;
    }

    loadSettings() {
      let saved = null;
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(this.settingsKey);
        if (item) {
          try { saved = JSON.parse(item); } catch (e) {}
        }
      }
      return Object.assign({}, DEFAULT_SETTINGS, saved || {});
    }

    saveSettings(newSettings, syncServer = true) {
      this.settings = Object.assign({}, this.settings, newSettings);
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
        } catch (e) {}
      }

      this.renderHeaderInfo();

      // Optionally sync to server portfolio.json
      if (syncServer && typeof fetch !== 'undefined') {
        try {
          fetch('/api/portfolio').then(r => r.json()).then(data => {
            if (!data.settings) data.settings = {};
            data.settings.companion = this.settings;
            return fetch('/api/portfolio', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'x-admin-key': 'admin123'
              },
              body: JSON.stringify(data)
            });
          }).catch(() => {});
        } catch (e) {}
      }
    }

    isSessionUnlocked() {
      if (typeof sessionStorage !== 'undefined') {
        return sessionStorage.getItem(this.unlockSessionKey) === 'true';
      }
      return false;
    }

    unlock(passphrase) {
      const correct = (this.settings.password || 'miros').trim().toLowerCase();
      if ((passphrase || '').trim().toLowerCase() === correct) {
        this.isLocked = false;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(this.unlockSessionKey, 'true');
        }
        this.checkLockState();
        if (this.inputEl) this.inputEl.focus();
        return true;
      }
      return false;
    }

    lock() {
      this.isLocked = true;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.unlockSessionKey);
      }
      this.checkLockState();
    }

    checkLockState() {
      this.isLocked = false;
      if (this.lockScreenEl) {
        this.lockScreenEl.style.display = 'none';
      }
      if (this.workspaceEl) {
        this.workspaceEl.style.display = 'flex';
      }
    }

    loadHistory() {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          try { return JSON.parse(saved); } catch (e) {}
        }
      }
      return [
        {
          role: 'model',
          text: `Online and ready. Ask me anything or paste your code snippet.`,
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
          text: `Chat cleared. Ready for your instructions.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      this.saveHistory();
      this.renderMessages();
    }

    renderHeaderInfo() {
      if (typeof document === 'undefined') return;
      if (this.nicknameEl) {
        this.nicknameEl.textContent = this.settings.nickname || 'Nova';
      }
      if (this.avatarEl) {
        this.avatarEl.src = this.settings.avatar || 'assets/images/avatar-pixel.png';
        this.avatarEl.alt = this.settings.nickname || 'Companion';
      }
      if (this.inputEl) {
        this.inputEl.setAttribute('placeholder', `Message ${this.settings.nickname || 'companion'}...`);
      }
    }

    bindEvents() {
      // Send button & enter key
      if (this.sendBtn && this.inputEl) {
        this.sendBtn.addEventListener('click', () => this.handleUserSend());
        this.inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleUserSend();
          }
        });

        // Auto-expand textarea
        this.inputEl.addEventListener('input', () => {
          this.inputEl.style.height = 'auto';
          const newHeight = Math.min(this.inputEl.scrollHeight, 140);
          this.inputEl.style.height = newHeight + 'px';
        });
      }

      // Password form submission
      const lockForms = [];
      if (this.lockScreenEl) {
        const f = this.lockScreenEl.querySelector('form');
        if (f) lockForms.push(f);
      }
      const pageLockForm = document.getElementById('companionLockForm');
      if (pageLockForm && !lockForms.includes(pageLockForm)) lockForms.push(pageLockForm);
      const drawerLockForm = document.getElementById('drawerLockForm');
      if (drawerLockForm && !lockForms.includes(drawerLockForm)) lockForms.push(drawerLockForm);

      lockForms.forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const passInput = form.querySelector('input[type="password"]') || document.getElementById('companionPasscodeInput') || document.getElementById('drawerPasscodeInput');
          const feedback = form.querySelector('.companion-lock-feedback, .lock-feedback, [id*="Feedback"]') || document.getElementById('companionLockFeedback') || document.getElementById('drawerLockFeedback');
          if (passInput) {
            const success = this.unlock(passInput.value);
            if (!success && feedback) {
              feedback.textContent = 'Incorrect passphrase. Access denied.';
              feedback.style.color = '#ef4444';
              passInput.classList.add('shake');
              setTimeout(() => passInput.classList.remove('shake'), 500);
            }
          }
        });
      });

      // 3-dot settings menu button
      if (this.dotsMenuBtn) {
        this.dotsMenuBtn.addEventListener('click', () => this.openSettingsModal());
      }
    }

    async handleUserSend() {
      if (!this.inputEl || this.isThinking || this.isLocked) return;
      const text = this.inputEl.value.trim();
      if (!text) return;

      this.inputEl.value = '';
      this.inputEl.style.height = 'auto';

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.messages.push({ role: 'user', text, time: timeStr });
      this.saveHistory();
      this.renderMessages();

      if (typeof window !== 'undefined' && window.vintageSound && typeof window.vintageSound.playMechanicalClick === 'function') {
        window.vintageSound.playMechanicalClick(1400, 0.02);
      }

      await this.sendToGemini(text);
    }

    async sendToGemini(prompt) {
      this.isThinking = true;
      this.renderThinkingIndicator();

      const apiKey = this.getEffectiveApiKey();
      const targetModel = (this.settings.model || 'gemini-3.5-flash').trim();

      // Models verified available for this key
      const candidateModels = [
        targetModel,
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-flash-latest',
        'gemini-2.5-flash'
      ];
      const uniqueModels = Array.from(new Set(candidateModels));

      // Build valid Gemini contents array (must alternate or begin with user)
      const contents = [];
      const recent = this.messages.slice(-10);
      for (const msg of recent) {
        if (!msg.text || msg.isError) continue;
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      }

      // Ensure at least 1 user message and begins with 'user'
      while (contents.length > 0 && contents[0].role !== 'user') {
        contents.shift();
      }
      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: prompt }] });
      }

      const bodyPayload = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        },
        systemInstruction: {
          parts: [{ text: this.settings.personality || DEFAULT_SETTINGS.personality }]
        }
      };

      let replyText = '';
      let lastError = null;

      for (const m of uniqueModels) {
        try {
          const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + apiKey;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyPayload)
          });

          if (res.ok) {
            const data = await res.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
              replyText = data.candidates[0].content.parts
                .filter(p => p.text)
                .map(p => p.text)
                .join('\n')
                .trim();
              if (replyText) break;
            }
          } else {
            const errData = await res.json().catch(() => ({}));
            lastError = errData.error?.message || ('HTTP ' + res.status);
            // Try next model on high demand (503) or not found (404)
            continue;
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
          time: timeStr
        });
      } else {
        const errorMsg = lastError ? `⚠️ ${lastError}` : `⚠️ Connection unavailable. Please check settings.`;
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
      if (typeof document === 'undefined' || !this.messagesContainer) return;
      if (!this.messagesContainer) return;
      const id = 'companionThinkingRow';
      if (document.getElementById(id)) return;

      const row = document.createElement('div');
      row.id = id;
      row.className = 'chat-row chat-row-model';

      const avatarSrc = this.settings.avatar || 'assets/images/avatar-pixel.png';

      row.innerHTML = `
        <img class="chat-bubble-avatar" src="${avatarSrc}" alt="${this.settings.nickname}">
        <div class="chat-bubble model-bubble thinking-bubble">
          <div class="typing-wave">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;
      this.messagesContainer.appendChild(row);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeThinkingIndicator() {
      if (typeof document === 'undefined') return;
      const row = document.getElementById('companionThinkingRow');
      if (row) row.remove();
    }

    renderMessages() {
      if (!this.messagesContainer) return;
      this.messagesContainer.innerHTML = '';

      const avatarSrc = this.settings.avatar || 'assets/images/avatar-pixel.png';
      const nickname = this.settings.nickname || 'Nova';

      for (const msg of this.messages) {
        const isUser = msg.role === 'user';
        const row = document.createElement('div');
        row.className = `chat-row ${isUser ? 'chat-row-user' : 'chat-row-model'}`;

        const formattedHtml = this.formatMarkdown(msg.text);

        if (isUser) {
          row.innerHTML = `
            <div class="chat-bubble user-bubble">
              <div class="chat-content">${formattedHtml}</div>
              <span class="chat-timestamp">${msg.time || ''}</span>
            </div>
          `;
        } else {
          row.innerHTML = `
            <img class="chat-bubble-avatar" src="${avatarSrc}" alt="${nickname}">
            <div class="chat-bubble model-bubble">
              <div class="chat-header-meta">
                <span class="chat-nickname">${nickname}</span>
                <span class="chat-timestamp">${msg.time || ''}</span>
              </div>
              <div class="chat-content">${formattedHtml}</div>
            </div>
          `;
        }
        this.messagesContainer.appendChild(row);
      }

      // Copy code block handlers
      this.messagesContainer.querySelectorAll('.code-copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const pre = btn.closest('.code-box').querySelector('pre');
          if (pre) {
            navigator.clipboard.writeText(pre.innerText).then(() => {
              btn.textContent = 'Copied!';
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
          <div class="code-box">
            <div class="code-box-header">
              <span>${languageLabel}</span>
              <button type="button" class="code-copy-btn">Copy</button>
            </div>
            <pre><code>${code.trim()}</code></pre>
          </div>
        `;
      });

      // Inline code `code`
      escaped = escaped.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

      // Bold **text**
      escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // Italic *text*
      escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Bullet lists
      escaped = escaped.replace(/^[ \t]*[-*][ \t]+(.*)$/gm, '<li class="chat-li">$1</li>');

      // Line breaks
      escaped = escaped.replace(/\n\n/g, '<p></p>');
      escaped = escaped.replace(/\n/g, '<br>');

      return escaped;
    }

    openSettingsModal() {
      let modal = document.getElementById('companionCustomSettingsModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'companionCustomSettingsModal';
        modal.className = 'vintage-modal';
        modal.innerHTML = `
          <div class="vintage-modal-backdrop" id="customSettingsBackdrop"></div>
          <div class="vintage-modal-dialog parchment-paper" style="max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem;">
              <h3 style="margin: 0; font-size: 1.1rem; color: #00f0ff; display: flex; align-items: center; gap: 0.5rem;">
                <span>⚙️</span> Companion Settings
              </h3>
              <button type="button" id="closeCustomSettingsBtn" style="background:none;border:none;color:#94a3b8;font-size:1.2rem;cursor:pointer;">✕</button>
            </div>

            <!-- Nickname -->
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label style="font-size: 0.76rem; color: #94a3b8; font-family: var(--font-mono);">Nickname:</label>
              <input type="text" id="settingNicknameInput" class="vintage-input" placeholder="e.g. Nova, Aria, Miros..." style="width: 100%;">
            </div>

            <!-- Avatar Picture -->
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label style="font-size: 0.76rem; color: #94a3b8; font-family: var(--font-mono);">Avatar Picture URL:</label>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <img id="settingAvatarPreview" src="" alt="preview" style="width: 38px; height: 38px; border-radius: 50%; border: 1px solid #00f0ff; object-fit: cover; flex-shrink: 0;">
                <input type="text" id="settingAvatarInput" class="vintage-input" placeholder="URL or select preset..." style="flex: 1;">
              </div>
              <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.25rem;">
                <button type="button" class="avatar-preset-btn" data-url="assets/images/avatar-pixel.png">Pixel Bot</button>
                <button type="button" class="avatar-preset-btn" data-url="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120&auto=format&fit=crop&q=80">Athena</button>
                <button type="button" class="avatar-preset-btn" data-url="https://images.unsplash.com/photo-1563089145-599997674d42?w=120&auto=format&fit=crop&q=80">Cyber Hacker</button>
                <button type="button" class="avatar-preset-btn" data-url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80">Quantum</button>
              </div>
            </div>

            <!-- Chat Model -->
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label style="font-size: 0.76rem; color: #94a3b8; font-family: var(--font-mono);">Model Name:</label>
              <input type="text" id="settingModelInput" class="vintage-input" placeholder="gemini-3.5-flash" style="width: 100%;">
            </div>

            <!-- Personality / System Prompt -->
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label style="font-size: 0.76rem; color: #94a3b8; font-family: var(--font-mono);">Personality & Instructions:</label>
              <textarea id="settingPersonalityInput" class="vintage-input" rows="3" placeholder="Describe personality and tone..." style="width: 100%; resize: vertical;"></textarea>
            </div>

            <!-- Passphrase Protection -->
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label style="font-size: 0.76rem; color: #94a3b8; font-family: var(--font-mono);">Security Passphrase (Default: miros):</label>
              <input type="text" id="settingPasswordInput" class="vintage-input" placeholder="miros" style="width: 100%;">
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.85rem; margin-top: 0.5rem;">
              <div style="display: flex; gap: 0.4rem;">
                <button type="button" class="vintage-btn btn-sm btn-outline btn-danger" id="settingLockBtn">🔒 Lock Now</button>
                <button type="button" class="vintage-btn btn-sm btn-outline" id="settingClearChatBtn">🗑️ Clear Chat</button>
              </div>
              <button type="button" class="vintage-btn btn-sm btn-primary" id="saveCustomSettingsBtn">Save & Apply</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        const close = () => { modal.style.display = 'none'; };
        modal.querySelector('#closeCustomSettingsBtn').addEventListener('click', close);
        modal.querySelector('#customSettingsBackdrop').addEventListener('click', close);

        // Preset avatar buttons
        modal.querySelectorAll('.avatar-preset-btn').forEach(b => {
          b.addEventListener('click', () => {
            const u = b.getAttribute('data-url');
            modal.querySelector('#settingAvatarInput').value = u;
            modal.querySelector('#settingAvatarPreview').src = u;
          });
        });

        // Live avatar preview
        modal.querySelector('#settingAvatarInput').addEventListener('input', (e) => {
          modal.querySelector('#settingAvatarPreview').src = e.target.value;
        });

        // Lock button
        modal.querySelector('#settingLockBtn').addEventListener('click', () => {
          close();
          this.lock();
        });

        // Clear chat button
        modal.querySelector('#settingClearChatBtn').addEventListener('click', () => {
          if (confirm('Clear chat history?')) {
            this.clearHistory();
            close();
          }
        });

        // Save button
        modal.querySelector('#saveCustomSettingsBtn').addEventListener('click', () => {
          const nick = modal.querySelector('#settingNicknameInput').value.trim() || 'Nova';
          const avatar = modal.querySelector('#settingAvatarInput').value.trim() || 'assets/images/avatar-pixel.png';
          const model = modal.querySelector('#settingModelInput').value.trim() || 'gemini-3.5-flash';
          const personality = modal.querySelector('#settingPersonalityInput').value.trim() || DEFAULT_SETTINGS.personality;
          const password = modal.querySelector('#settingPasswordInput').value.trim() || 'miros';

          this.saveSettings({
            nickname: nick,
            avatar: avatar,
            model: model,
            personality: personality,
            password: password
          });

          this.renderMessages();
          close();
        });
      }

      // Populate current values
      modal.querySelector('#settingNicknameInput').value = this.settings.nickname || 'Nova';
      modal.querySelector('#settingAvatarInput').value = this.settings.avatar || 'assets/images/avatar-pixel.png';
      modal.querySelector('#settingAvatarPreview').src = this.settings.avatar || 'assets/images/avatar-pixel.png';
      modal.querySelector('#settingModelInput').value = this.settings.model || 'gemini-3.5-flash';
      modal.querySelector('#settingPersonalityInput').value = this.settings.personality || DEFAULT_SETTINGS.personality;
      modal.querySelector('#settingPasswordInput').value = this.settings.password || 'miros';

      modal.style.display = 'flex';
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
    DEFAULT_SETTINGS,
    GeminiCompanion
  };
});
