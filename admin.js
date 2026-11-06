/**
 * Admin Desk Management Panel Controller
 * Handles authentication, full CRUD operations, image uploads,
 * message inbox management, and live synchronizations.
 */

window.AdminPanel = {
  token: sessionStorage.getItem('cse_admin_token') || null,
  isUnlocked: Boolean(sessionStorage.getItem('cse_admin_token')),
  activeTab: 'tab-profile',
  messages: [],
  selectedMessageId: null,
  inboxFilter: 'all',

  async init() {
    this.bindEvents();
    this.checkHash();
    await this.verifySession();
  },

  async verifySession() {
    const lockScreen = document.getElementById('adminLockScreen');
    const workspace = document.getElementById('adminWorkspace');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    if (this.token) {
      try {
        const res = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        const data = await res.json();
        if (data && data.authenticated) {
          this.isUnlocked = true;
          sessionStorage.setItem('cse_admin_unlocked', 'true');
          this.showWorkspace();
          this.refreshAllTabs();
          return;
        }
      } catch (e) {
        console.warn('Session verification error:', e);
      }
    }

    // Token missing or invalid
    this.token = null;
    this.isUnlocked = false;
    sessionStorage.removeItem('cse_admin_token');
    sessionStorage.removeItem('cse_admin_unlocked');
    this.showLockScreen();
  },

  showWorkspace() {
    const lockScreen = document.getElementById('adminLockScreen');
    const workspace = document.getElementById('adminWorkspace');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (lockScreen) lockScreen.style.display = 'none';
    if (workspace) workspace.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  },

  showLockScreen() {
    const lockScreen = document.getElementById('adminLockScreen');
    const workspace = document.getElementById('adminWorkspace');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (lockScreen) lockScreen.style.display = 'flex';
    if (workspace) workspace.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    const pinInput = document.getElementById('adminPinInput');
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  },

  handleSessionExpired() {
    this.token = null;
    this.isUnlocked = false;
    sessionStorage.removeItem('cse_admin_token');
    sessionStorage.removeItem('cse_admin_unlocked');
    this.showLockScreen();
    const feedback = document.getElementById('lockFeedback');
    if (feedback) {
      feedback.textContent = '⚠️ Session expired or invalid. Please re-authenticate.';
      feedback.style.color = 'var(--accent-rust)';
    }
  },

  async authFetch(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    options.headers = headers;

    const res = await fetch(url, options);
    if (res.status === 401) {
      this.handleSessionExpired();
      throw new Error('Unauthorized or session expired');
    }
    return res;
  },

  checkHash() {
    if (window.location.hash === '#admin') {
      this.openPanel();
    }
  },

  openPanel() {
    const overlay = document.getElementById('adminPanelOverlay');
    if (!overlay) {
      window.location.href = 'admin.html';
      return;
    }
    overlay.classList.add('active');

    if (!this.isUnlocked) {
      this.showLockScreen();
    } else {
      this.showWorkspace();
      this.refreshAllTabs();
    }
  },

  closePanel() {
    const overlay = document.getElementById('adminPanelOverlay');
    if (overlay) overlay.classList.remove('active');
    if (window.location.hash === '#admin') {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  },

  async login(pin) {
    const feedback = document.getElementById('lockFeedback');
    const submitBtn = document.getElementById('adminLoginSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;
    if (feedback) {
      feedback.textContent = '⚡ Authenticating with Station Master Cluster...';
      feedback.style.color = 'var(--accent-patina)';
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pin })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        this.token = data.token;
        this.isUnlocked = true;
        sessionStorage.setItem('cse_admin_token', data.token);
        sessionStorage.setItem('cse_admin_unlocked', 'true');
        if (feedback) {
          feedback.textContent = '✔ Access Authorized! Loading console...';
          feedback.style.color = 'var(--accent-patina)';
        }
        setTimeout(() => {
          this.showWorkspace();
          this.refreshAllTabs();
        }, 300);
      } else {
        const errorMsg = data.error || 'Access Denied: Invalid Access Code.';
        if (feedback) {
          feedback.textContent = `❌ ${errorMsg}`;
          feedback.style.color = 'var(--accent-rust)';
        }
        const pinInput = document.getElementById('adminPinInput');
        if (pinInput) {
          pinInput.classList.add('shake');
          setTimeout(() => pinInput.classList.remove('shake'), 500);
          pinInput.focus();
        }
      }
    } catch (err) {
      if (feedback) {
        feedback.textContent = '❌ Authentication server offline or unreachable.';
        feedback.style.color = 'var(--accent-rust)';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  async logout() {
    try {
      if (this.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
      }
    } catch (e) {}

    this.token = null;
    this.isUnlocked = false;
    sessionStorage.removeItem('cse_admin_token');
    sessionStorage.removeItem('cse_admin_unlocked');
    this.showLockScreen();

    const feedback = document.getElementById('lockFeedback');
    if (feedback) {
      feedback.textContent = '🔒 Console locked securely. Session terminated.';
      feedback.style.color = 'var(--ink-secondary)';
      setTimeout(() => { if (feedback) feedback.textContent = ''; }, 3500);
    }
  },

  bindEvents() {
    // Open/Close triggers
    const openBtn = document.getElementById('openAdminBtn');
    if (openBtn) openBtn.addEventListener('click', () => this.openPanel());

    const footerLink = document.getElementById('footerAdminLink');
    if (footerLink) footerLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openPanel();
    });

    const closeBtn = document.getElementById('closeAdminPanelBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closePanel());

    const viewPublicBtn = document.getElementById('viewPublicSiteBtn');
    if (viewPublicBtn) viewPublicBtn.addEventListener('click', () => this.closePanel());

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

    // Lock Screen Authentication
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = document.getElementById('adminPinInput')?.value.trim();
        if (!pin) return;
        this.login(pin);
      });
    }

    // Sidebar Tab Navigation
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Profile Form Save
    const profileForm = document.getElementById('profileEditForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Avatar Presets, Upload & Remove
    document.querySelectorAll('[data-set-avatar]').forEach(img => {
      img.addEventListener('click', async () => {
        const path = img.getAttribute('data-set-avatar');
        const input = document.getElementById('adminProfAvatar');
        const prev = document.getElementById('adminAvatarPreviewImg');
        const status = document.getElementById('adminAvatarStatus');
        if (input) input.value = path;
        if (prev) prev.src = path;
        if (status) status.textContent = 'Stock 2D Preset';
        if (window.PortfolioState.data?.profile) {
          window.PortfolioState.data.profile.avatar = path;
          await this.persistPortfolioData(window.PortfolioState.data);
        }
      });
    });

    const avatarFileInput = document.getElementById('adminAvatarFileInput');
    if (avatarFileInput) {
      avatarFileInput.addEventListener('change', async (e) => {
        const uploadedUrl = await this.handleImageUpload(e, 'adminProfAvatar');
        const val = uploadedUrl || document.getElementById('adminProfAvatar')?.value;
        const prev = document.getElementById('adminAvatarPreviewImg');
        const status = document.getElementById('adminAvatarStatus');
        if (prev && val) prev.src = val;
        if (status) status.textContent = 'Uploaded Photo';
        if (window.PortfolioState.data?.profile && val) {
          window.PortfolioState.data.profile.avatar = val;
          await this.persistPortfolioData(window.PortfolioState.data);
        }
      });
    }

    const removeAvatarBtn = document.getElementById('adminRemoveAvatarBtn');
    if (removeAvatarBtn) {
      removeAvatarBtn.addEventListener('click', async () => {
        const input = document.getElementById('adminProfAvatar');
        const prev = document.getElementById('adminAvatarPreviewImg');
        const status = document.getElementById('adminAvatarStatus');
        if (input) input.value = '';
        if (prev) prev.src = 'assets/images/avatar-notionist.png';
        if (status) status.textContent = 'No Photo (Default 2D)';
        if (window.PortfolioState.data?.profile) {
          window.PortfolioState.data.profile.avatar = '';
          await this.persistPortfolioData(window.PortfolioState.data);
        }
      });
    }

    const profAvatarInput = document.getElementById('adminProfAvatar');
    if (profAvatarInput) {
      profAvatarInput.addEventListener('input', () => {
        const val = profAvatarInput.value.trim();
        const prev = document.getElementById('adminAvatarPreviewImg');
        const status = document.getElementById('adminAvatarStatus');
        if (val) {
          if (prev) prev.src = val;
          if (status) status.textContent = 'Custom Photo';
        } else {
          if (prev) prev.src = 'assets/images/avatar-notionist.png';
          if (status) status.textContent = 'No Photo (Default 2D)';
        }
      });
    }

    // Projects CRUD
    const addProjBtn = document.getElementById('addNewProjectBtn');
    if (addProjBtn) {
      addProjBtn.addEventListener('click', () => this.openProjectEditor(null));
    }

    const cancelProjBtn = document.getElementById('cancelProjectEditBtn');
    if (cancelProjBtn) {
      cancelProjBtn.addEventListener('click', () => {
        document.getElementById('projectEditorCard').style.display = 'none';
      });
    }

    const projForm = document.getElementById('projectForm');
    if (projForm) {
      projForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProject();
      });
    }

    const projImgInput = document.getElementById('projImageFileInput');
    if (projImgInput) {
      projImgInput.addEventListener('change', (e) => this.handleImageUpload(e, 'projImage'));
    }

    document.querySelectorAll('[data-set-img]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('projImage').value = btn.getAttribute('data-set-img');
      });
    });

    // Skills CRUD
    const addSkillBtn = document.getElementById('addNewSkillBtn');
    if (addSkillBtn) {
      addSkillBtn.addEventListener('click', () => this.openSkillEditor(null));
    }

    const cancelSkillBtn = document.getElementById('cancelSkillEditBtn');
    if (cancelSkillBtn) {
      cancelSkillBtn.addEventListener('click', () => {
        document.getElementById('skillEditorCard').style.display = 'none';
      });
    }

    const skillLevelRange = document.getElementById('skillLevel');
    const skillLevelDisplay = document.getElementById('skillLevelDisplay');
    if (skillLevelRange && skillLevelDisplay) {
      skillLevelRange.addEventListener('input', () => {
        skillLevelDisplay.textContent = `${skillLevelRange.value}%`;
      });
    }

    const skillForm = document.getElementById('skillForm');
    if (skillForm) {
      skillForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSkill();
      });
    }

    // Academics & Experience CRUD
    const eduForm = document.getElementById('educationEditForm');
    if (eduForm) {
      eduForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveEducation();
      });
    }

    const addExpBtn = document.getElementById('addNewExpBtn');
    if (addExpBtn) {
      addExpBtn.addEventListener('click', () => this.openExpEditor(null));
    }

    const cancelExpBtn = document.getElementById('cancelExpEditBtn');
    if (cancelExpBtn) {
      cancelExpBtn.addEventListener('click', () => {
        document.getElementById('expEditorCard').style.display = 'none';
      });
    }

    const expForm = document.getElementById('expForm');
    if (expForm) {
      expForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveExperience();
      });
    }

    // Inbox Filters
    document.querySelectorAll('[data-inbox-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-inbox-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.inboxFilter = btn.getAttribute('data-inbox-filter');
        this.renderInbox();
      });
    });

    // Theme selector cards
    document.querySelectorAll('[data-set-theme]').forEach(card => {
      card.addEventListener('click', () => {
        const themeVal = card.getAttribute('data-set-theme');
        window.applyTheme(themeVal);
      });
    });

    const toggleScanlines = document.getElementById('toggleScanlines');
    if (toggleScanlines) {
      toggleScanlines.checked = window.PortfolioState.scanlinesEnabled;
      toggleScanlines.addEventListener('change', () => {
        window.applyScanlines(toggleScanlines.checked);
      });
    }

    const toggleAudio = document.getElementById('toggleAudioFX');
    if (toggleAudio) {
      toggleAudio.checked = window.PortfolioState.audioEnabled;
      toggleAudio.addEventListener('change', () => {
        window.PortfolioState.audioEnabled = toggleAudio.checked;
        localStorage.setItem('cse_audio_fx', toggleAudio.checked);
      });
    }

    // Backup & Export buttons
    const exportBtn = document.getElementById('exportJsonBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportBackup());
    }

    const importInput = document.getElementById('importJsonFileInput');
    if (importInput) {
      importInput.addEventListener('change', (e) => this.importBackup(e));
    }

    const resetBtn = document.getElementById('adminResetDefaultBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetDefaults());
    }

    const footerReset = document.getElementById('resetDemoDataBtn');
    if (footerReset) {
      footerReset.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetDefaults();
      });
    }

    // Music & Atmosphere Studio Events
    this.bindMusicStudioEvents();

    // Background Artwork Events
    this.bindBackgroundImageEvents();

    // Personal Vault & Drive Events
    this.bindVaultEvents();

    // Security & Auth Credentials Events
    this.bindSecurityEvents();
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
    const pane = document.getElementById(tabId);
    if (pane) pane.classList.add('active');

    if (tabId === 'tab-inbox') {
      this.loadMessages();
    }
    if (tabId === 'tab-music') {
      this.initMusicStudio();
    }
    if (tabId === 'tab-appearance') {
      this.syncBackgroundImageUI();
    }
    if (tabId === 'tab-vault') {
      this.initVaultManager();
    }
    if (tabId === 'tab-hsc') {
      this.initHscManager();
    }
  },

  refreshAllTabs() {
    this.populateProfileForm();
    this.renderProjectsTable();
    this.renderSkillsManager();
    this.populateEducationForm();
    this.renderExperienceManager();
    this.loadMessages();
    this.initMusicStudio();
    this.syncBackgroundImageUI();
    this.initVaultManager();
    this.initHscManager();
  },

  syncData(data) {
    if (this.isUnlocked) {
      this.refreshAllTabs();
    }
  },

  // ------------------------------------------------------------------------
  // Profile Management
  // ------------------------------------------------------------------------
  populateProfileForm() {
    const data = window.PortfolioState.data;
    if (!data || !data.profile) return;
    const prof = data.profile;

    document.getElementById('adminProfName').value = prof.name || '';
    document.getElementById('adminProfRole').value = prof.role || '';
    document.getElementById('adminProfUniversity').value = prof.university || '';
    document.getElementById('adminProfDegree').value = prof.degree || '';
    document.getElementById('adminProfGpa').value = prof.gpa || '';
    document.getElementById('adminProfStatus').value = prof.status || '';
    document.getElementById('adminProfBio').value = prof.bio || '';
    document.getElementById('adminProfAvatar').value = prof.avatar || '';
    document.getElementById('adminProfEmail').value = prof.email || '';
    document.getElementById('adminProfLocation').value = prof.location || '';
    document.getElementById('adminProfGithub').value = prof.github || '';
    document.getElementById('adminProfLinkedin').value = prof.linkedin || '';
    document.getElementById('adminProfLeetcode').value = prof.leetcode || '';
    document.getElementById('adminProfCodeforces').value = prof.codeforces || '';

    // Synchronize avatar preview & status badge
    const prev = document.getElementById('adminAvatarPreviewImg');
    const status = document.getElementById('adminAvatarStatus');
    if (prev) {
      prev.src = prof.avatar && prof.avatar.trim() !== '' ? prof.avatar : 'assets/images/avatar-notionist.png';
    }
    if (status) {
      status.textContent = prof.avatar && prof.avatar.trim() !== '' ? 'Active Photo' : 'No Photo (Default 2D)';
    }
  },

  async saveProfile() {
    const data = window.PortfolioState.data;
    if (!data) return;

    data.profile = {
      ...data.profile,
      name: document.getElementById('adminProfName').value.trim(),
      role: document.getElementById('adminProfRole').value.trim(),
      university: document.getElementById('adminProfUniversity').value.trim(),
      degree: document.getElementById('adminProfDegree').value.trim(),
      gpa: document.getElementById('adminProfGpa').value.trim(),
      status: document.getElementById('adminProfStatus').value.trim(),
      bio: document.getElementById('adminProfBio').value.trim(),
      avatar: document.getElementById('adminProfAvatar').value.trim(),
      email: document.getElementById('adminProfEmail').value.trim(),
      location: document.getElementById('adminProfLocation').value.trim(),
      github: document.getElementById('adminProfGithub').value.trim(),
      linkedin: document.getElementById('adminProfLinkedin').value.trim(),
      leetcode: document.getElementById('adminProfLeetcode').value.trim(),
      codeforces: document.getElementById('adminProfCodeforces').value.trim()
    };

    await this.persistPortfolioData(data);
    
    const indicator = document.getElementById('profileSaveIndicator');
    if (indicator) {
      indicator.textContent = '✔ Profile updated live!';
      indicator.style.color = 'var(--accent-patina)';
      setTimeout(() => indicator.textContent = '', 3000);
    }
  },

  // ------------------------------------------------------------------------
  // Projects Management (CRUD)
  // ------------------------------------------------------------------------
  renderProjectsTable() {
    const tbody = document.getElementById('adminProjectsTableBody');
    const countEl = document.getElementById('adminProjectCount');
    if (!tbody || !window.PortfolioState.data) return;

    const projs = window.PortfolioState.data.projects || [];
    if (countEl) countEl.textContent = projs.length;

    if (projs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem;">No projects registered.</td></tr>`;
      return;
    }

    tbody.innerHTML = projs.map(p => `
      <tr>
        <td>
          <strong>${this.escape(p.title)}</strong><br>
          <span style="font-size:0.75rem; color:var(--accent-rust);">${this.escape(p.category)}</span>
        </td>
        <td>${this.escape(p.year || '2025')}</td>
        <td>
          <div style="display:flex; flex-wrap:wrap; gap:3px;">
            ${(p.techStack || []).slice(0, 3).map(t => `<span class="tech-tag" style="font-size:0.65rem;">${this.escape(t)}</span>`).join('')}
            ${(p.techStack || []).length > 3 ? `<span style="font-size:0.65rem;">+${p.techStack.length - 3}</span>` : ''}
          </div>
        </td>
        <td><span class="vintage-tag">${this.escape(p.badge || 'Active')}</span></td>
        <td>
          <div style="display:flex; gap:4px;">
            <button class="btn-icon-xs edit-proj-btn" data-id="${p.id}" title="Edit">✏️</button>
            <button class="btn-icon-xs delete-proj-btn" data-id="${p.id}" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-proj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openProjectEditor(id);
      });
    });

    tbody.querySelectorAll('.delete-proj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.deleteProject(id);
      });
    });
  },

  openProjectEditor(projectId) {
    const card = document.getElementById('projectEditorCard');
    const title = document.getElementById('projectEditorTitle');
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth' });

    if (projectId) {
      title.textContent = 'Edit Project Blueprint';
      const proj = window.PortfolioState.data.projects.find(p => p.id === projectId);
      if (!proj) return;
      document.getElementById('projEditId').value = proj.id;
      document.getElementById('projTitle').value = proj.title;
      document.getElementById('projCategory').value = proj.category;
      document.getElementById('projTagline').value = proj.tagline || '';
      document.getElementById('projBadge').value = proj.badge || '';
      document.getElementById('projDescription').value = proj.description;
      document.getElementById('projTechStack').value = (proj.techStack || []).join(', ');
      document.getElementById('projYear').value = proj.year || '2025';
      document.getElementById('projImage').value = proj.image || '';
      document.getElementById('projGithub').value = proj.github || '';
      document.getElementById('projDemo').value = proj.demo || '';
      document.getElementById('projFeatured').checked = !!proj.featured;
    } else {
      title.textContent = 'Add New Project Blueprint';
      document.getElementById('projEditId').value = '';
      document.getElementById('projectForm').reset();
      document.getElementById('projImage').value = 'assets/images/project-circuits.jpg';
      document.getElementById('projYear').value = '2025';
    }
  },

  async saveProject() {
    const id = document.getElementById('projEditId').value;
    const data = window.PortfolioState.data;
    if (!data.projects) data.projects = [];

    const techString = document.getElementById('projTechStack').value;
    const techStack = techString.split(',').map(s => s.trim()).filter(Boolean);

    const projectObj = {
      id: id || 'proj-' + Date.now(),
      title: document.getElementById('projTitle').value.trim(),
      category: document.getElementById('projCategory').value,
      tagline: document.getElementById('projTagline').value.trim(),
      badge: document.getElementById('projBadge').value.trim() || 'Verified',
      description: document.getElementById('projDescription').value.trim(),
      techStack: techStack,
      year: document.getElementById('projYear').value.trim() || '2025',
      image: document.getElementById('projImage').value.trim() || 'assets/images/project-circuits.jpg',
      github: document.getElementById('projGithub').value.trim(),
      demo: document.getElementById('projDemo').value.trim(),
      featured: document.getElementById('projFeatured').checked
    };

    if (id) {
      const idx = data.projects.findIndex(p => p.id === id);
      if (idx !== -1) data.projects[idx] = projectObj;
    } else {
      data.projects.unshift(projectObj);
    }

    await this.persistPortfolioData(data);
    document.getElementById('projectEditorCard').style.display = 'none';
    this.renderProjectsTable();
  },

  async deleteProject(id) {
    if (!confirm('Are you sure you wish to retire this project blueprint?')) return;
    const data = window.PortfolioState.data;
    data.projects = (data.projects || []).filter(p => p.id !== id);
    await this.persistPortfolioData(data);
    this.renderProjectsTable();
  },

  // ------------------------------------------------------------------------
  // Skills Management (CRUD)
  // ------------------------------------------------------------------------
  renderSkillsManager() {
    const grid = document.getElementById('adminSkillsGrid');
    const countEl = document.getElementById('adminSkillCount');
    if (!grid || !window.PortfolioState.data) return;

    const skills = window.PortfolioState.data.skills || [];
    if (countEl) countEl.textContent = skills.length;

    grid.innerHTML = skills.map((s, index) => `
      <div class="admin-skill-pill">
        <div class="skill-pill-meta">
          <span class="skill-pill-name">${this.escape(s.name)} (${s.level}%)</span>
          <span class="skill-pill-cat">${this.escape(s.category)}</span>
        </div>
        <div class="skill-pill-actions">
          <button class="btn-icon-xs edit-skill-btn" data-index="${index}">✏️</button>
          <button class="btn-icon-xs delete-skill-btn" data-index="${index}">🗑️</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.edit-skill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        this.openSkillEditor(idx);
      });
    });

    grid.querySelectorAll('.delete-skill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        this.deleteSkill(idx);
      });
    });
  },

  openSkillEditor(index) {
    const card = document.getElementById('skillEditorCard');
    const title = document.getElementById('skillEditorTitle');
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth' });

    if (index !== null) {
      title.textContent = 'Edit Competency';
      const skill = window.PortfolioState.data.skills[index];
      if (!skill) return;
      document.getElementById('skillEditIndex').value = index;
      document.getElementById('skillName').value = skill.name;
      document.getElementById('skillCategory').value = skill.category;
      document.getElementById('skillLevel').value = skill.level;
      document.getElementById('skillLevelDisplay').textContent = `${skill.level}%`;
      document.getElementById('skillIcon').value = skill.icon || 'cplusplus';
      document.getElementById('skillDesc').value = skill.desc || '';
    } else {
      title.textContent = 'Add New Competency';
      document.getElementById('skillEditIndex').value = '';
      document.getElementById('skillForm').reset();
      document.getElementById('skillLevel').value = 85;
      document.getElementById('skillLevelDisplay').textContent = '85%';
    }
  },

  async saveSkill() {
    const idxStr = document.getElementById('skillEditIndex').value;
    const data = window.PortfolioState.data;
    if (!data.skills) data.skills = [];

    const skillObj = {
      name: document.getElementById('skillName').value.trim(),
      category: document.getElementById('skillCategory').value,
      level: parseInt(document.getElementById('skillLevel').value, 10),
      icon: document.getElementById('skillIcon').value,
      desc: document.getElementById('skillDesc').value.trim()
    };

    if (idxStr !== '') {
      const idx = parseInt(idxStr, 10);
      data.skills[idx] = skillObj;
    } else {
      data.skills.push(skillObj);
    }

    await this.persistPortfolioData(data);
    document.getElementById('skillEditorCard').style.display = 'none';
    this.renderSkillsManager();
  },

  async deleteSkill(index) {
    if (!confirm('Remove this competency from registry?')) return;
    const data = window.PortfolioState.data;
    data.skills.splice(index, 1);
    await this.persistPortfolioData(data);
    this.renderSkillsManager();
  },

  // ------------------------------------------------------------------------
  // Academics & Experience Management
  // ------------------------------------------------------------------------
  populateEducationForm() {
    const data = window.PortfolioState.data;
    if (!data || !data.education || data.education.length === 0) return;
    const edu = data.education[0];

    document.getElementById('adminEduDegree').value = edu.degree || '';
    document.getElementById('adminEduInstitution').value = edu.institution || '';
    document.getElementById('adminEduPeriod').value = edu.period || '';
    document.getElementById('adminEduScore').value = edu.score || '';
    document.getElementById('adminEduCoursework').value = (edu.coursework || []).join('\n');
  },

  async saveEducation() {
    const data = window.PortfolioState.data;
    const courses = document.getElementById('adminEduCoursework').value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    data.education = [{
      degree: document.getElementById('adminEduDegree').value.trim(),
      institution: document.getElementById('adminEduInstitution').value.trim(),
      period: document.getElementById('adminEduPeriod').value.trim(),
      score: document.getElementById('adminEduScore').value.trim(),
      highlights: (data.education[0] && data.education[0].highlights) || '',
      coursework: courses
    }];

    await this.persistPortfolioData(data);
    alert('Education & Coursework updated live!');
  },

  renderExperienceManager() {
    const container = document.getElementById('adminExperienceList');
    if (!container || !window.PortfolioState.data) return;

    const list = window.PortfolioState.data.experience || [];
    container.innerHTML = list.map(exp => `
      <div class="admin-skill-pill" style="margin-bottom:0.5rem;">
        <div class="skill-pill-meta">
          <strong>${this.escape(exp.role)} @ ${this.escape(exp.company)}</strong>
          <span style="font-size:0.75rem; color:var(--ink-muted);">${this.escape(exp.period)} (${this.escape(exp.type)})</span>
        </div>
        <div class="skill-pill-actions">
          <button class="btn-icon-xs edit-exp-btn" data-id="${exp.id}">✏️</button>
          <button class="btn-icon-xs delete-exp-btn" data-id="${exp.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.edit-exp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openExpEditor(id);
      });
    });

    container.querySelectorAll('.delete-exp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.deleteExperience(id);
      });
    });
  },

  openExpEditor(id) {
    const card = document.getElementById('expEditorCard');
    const title = document.getElementById('expEditorTitle');
    card.style.display = 'block';

    if (id) {
      title.textContent = 'Edit Experience Entry';
      const exp = window.PortfolioState.data.experience.find(e => e.id === id);
      if (!exp) return;
      document.getElementById('expEditId').value = exp.id;
      document.getElementById('expRole').value = exp.role;
      document.getElementById('expCompany').value = exp.company;
      document.getElementById('expPeriod').value = exp.period;
      document.getElementById('expType').value = exp.type;
      document.getElementById('expDesc').value = exp.description;
      document.getElementById('expBadges').value = (exp.badges || []).join(', ');
    } else {
      title.textContent = 'Add Experience Entry';
      document.getElementById('expEditId').value = '';
      document.getElementById('expForm').reset();
    }
  },

  async saveExperience() {
    const id = document.getElementById('expEditId').value;
    const data = window.PortfolioState.data;
    if (!data.experience) data.experience = [];

    const badgeStr = document.getElementById('expBadges').value;
    const badges = badgeStr.split(',').map(s => s.trim()).filter(Boolean);

    const expObj = {
      id: id || 'exp-' + Date.now(),
      role: document.getElementById('expRole').value.trim(),
      company: document.getElementById('expCompany').value.trim(),
      period: document.getElementById('expPeriod').value.trim(),
      type: document.getElementById('expType').value,
      description: document.getElementById('expDesc').value.trim(),
      badges: badges
    };

    if (id) {
      const idx = data.experience.findIndex(e => e.id === id);
      if (idx !== -1) data.experience[idx] = expObj;
    } else {
      data.experience.unshift(expObj);
    }

    await this.persistPortfolioData(data);
    document.getElementById('expEditorCard').style.display = 'none';
    this.renderExperienceManager();
  },

  async deleteExperience(id) {
    if (!confirm('Delete this experience entry?')) return;
    const data = window.PortfolioState.data;
    data.experience = (data.experience || []).filter(e => e.id !== id);
    await this.persistPortfolioData(data);
    this.renderExperienceManager();
  },

  // ------------------------------------------------------------------------
  // Messages & Telegram Inbox
  // ------------------------------------------------------------------------
  async loadMessages() {
    try {
      const res = await this.authFetch('/api/messages');
      if (res.ok) {
        this.messages = await res.json();
      } else {
        throw new Error();
      }
    } catch (e) {
      this.messages = JSON.parse(localStorage.getItem('cse_local_messages') || '[]');
    }

    this.renderInbox();
  },

  renderInbox() {
    const listEl = document.getElementById('inboxList');
    const badgeEl = document.getElementById('adminInboxCount');
    if (!listEl) return;

    const unreadCount = this.messages.filter(m => !m.read).length;
    if (badgeEl) badgeEl.textContent = unreadCount;

    let filtered = [...this.messages];
    if (this.inboxFilter === 'unread') {
      filtered = filtered.filter(m => !m.read);
    } else if (this.inboxFilter === 'starred') {
      filtered = filtered.filter(m => m.starred);
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="inbox-empty-state" style="padding:1.5rem; text-align:center;">No dispatches found in this view.</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(m => `
      <div class="inbox-item ${!m.read ? 'unread' : ''} ${m.id === this.selectedMessageId ? 'active' : ''}" data-msg-id="${m.id}">
        <div class="inbox-item-top">
          <span class="msg-sender">${m.starred ? '⭐ ' : ''}${this.escape(m.name)}</span>
          <span class="msg-date">${new Date(m.date).toLocaleDateString()}</span>
        </div>
        <div class="msg-subject">${this.escape(m.subject || 'Dispatch')}</div>
      </div>
    `).join('');

    listEl.querySelectorAll('.inbox-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-msg-id');
        this.selectMessage(id);
      });
    });

    if (this.selectedMessageId) {
      this.renderMessageViewer(this.selectedMessageId);
    }
  },

  async selectMessage(id) {
    this.selectedMessageId = id;
    const msg = this.messages.find(m => m.id === id);
    if (msg && !msg.read) {
      msg.read = true;
      try {
        await this.authFetch(`/api/messages/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true })
        });
      } catch (e) {
        localStorage.setItem('cse_local_messages', JSON.stringify(this.messages));
      }
    }

    this.renderInbox();
    this.renderMessageViewer(id);
  },

  renderMessageViewer(id) {
    const viewer = document.getElementById('inboxViewer');
    if (!viewer) return;

    const msg = this.messages.find(m => m.id === id);
    if (!msg) {
      viewer.innerHTML = `<div class="inbox-empty-state">Select a dispatch from the list to read.</div>`;
      return;
    }

    viewer.innerHTML = `
      <div class="viewer-header">
        <h3 class="viewer-subject">${this.escape(msg.subject)}</h3>
        <div class="viewer-meta">
          From: <strong>${this.escape(msg.name)}</strong> &lt;<a href="mailto:${this.escape(msg.email)}">${this.escape(msg.email)}</a>&gt;<br>
          Dispatched: ${new Date(msg.date).toLocaleString()}
        </div>
      </div>
      <div class="viewer-body">${this.escape(msg.message)}</div>
      <div class="viewer-actions">
        <a href="mailto:${this.escape(msg.email)}?subject=Re: ${encodeURIComponent(msg.subject)}" class="vintage-btn btn-primary btn-sm">
          ✉ Reply via Mail
        </a>
        <button class="vintage-btn btn-outline btn-sm" id="toggleStarMsgBtn">
          ${msg.starred ? '★ Unstar' : '☆ Star'}
        </button>
        <button class="vintage-btn btn-danger btn-sm" id="deleteMsgBtn">
          🗑 Delete Dispatch
        </button>
      </div>
    `;

    document.getElementById('toggleStarMsgBtn').addEventListener('click', async () => {
      msg.starred = !msg.starred;
      try {
        await this.authFetch(`/api/messages/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ starred: msg.starred })
        });
      } catch (e) {
        localStorage.setItem('cse_local_messages', JSON.stringify(this.messages));
      }
      this.renderInbox();
    });

    document.getElementById('deleteMsgBtn').addEventListener('click', async () => {
      if (!confirm('Delete this dispatch permanently?')) return;
      this.messages = this.messages.filter(m => m.id !== id);
      try {
        await this.authFetch(`/api/messages/${id}`, { method: 'DELETE' });
      } catch (e) {
        localStorage.setItem('cse_local_messages', JSON.stringify(this.messages));
      }
      this.selectedMessageId = null;
      this.renderInbox();
      viewer.innerHTML = `<div class="inbox-empty-state">Dispatch removed.</div>`;
    });
  },

  // ------------------------------------------------------------------------
  // Image Upload Handler
  // ------------------------------------------------------------------------
  handleImageUpload(e, targetInputId) {
    const file = e.target.files[0];
    if (!file) return Promise.resolve(null);

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        let finalUrl = base64;
        try {
          const res = await this.authFetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64, filename: file.name })
          });
          if (res.ok) {
            const result = await res.json();
            finalUrl = result.url;
          } else {
            const err = await res.json();
            alert(`Upload error: ${err.error || 'Failed'}`);
          }
        } catch (err) {
          console.warn('Upload API fallback to data-uri:', err);
        }

        if (targetInputId) {
          const el = document.getElementById(targetInputId);
          if (el) el.value = finalUrl;
        }
        resolve(finalUrl);
      };
      reader.readAsDataURL(file);
    });
  },

  // ------------------------------------------------------------------------
  // Backup & Reset Operations
  // ------------------------------------------------------------------------
  exportBackup() {
    const data = window.PortfolioState.data;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackup(e) {
    const file = e.target.files[0];
    const statusEl = document.getElementById('importStatus');
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!importedData.profile || !importedData.projects) {
          throw new Error('Invalid portfolio schema');
        }
        window.PortfolioState.data = importedData;
        await this.persistPortfolioData(importedData);
        statusEl.textContent = '✔ Portfolio restored successfully!';
        statusEl.style.color = 'var(--accent-patina)';
        this.refreshAllTabs();
      } catch (err) {
        statusEl.textContent = '❌ Failed to parse JSON archive.';
        statusEl.style.color = 'var(--accent-rust)';
      }
    };
    reader.readAsText(file);
  },

  async resetDefaults() {
    if (!confirm('Reset all portfolio entries to standard CSE template? All local edits will be replaced.')) return;
    localStorage.removeItem('cse_portfolio_data');
    await window.loadPortfolioData();
    this.refreshAllTabs();
    alert('✔ Reset to factory CSE template complete.');
  },

  // ------------------------------------------------------------------------
  // Helper: Persist data across API and LocalStorage
  // ------------------------------------------------------------------------
  async persistPortfolioData(data) {
    localStorage.setItem('cse_portfolio_data', JSON.stringify(data));
    try {
      await this.authFetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.warn('Backend unavailable, saved locally');
    }

    // Immediately reflect changes on public UI
    window.renderPortfolio();
  },

  // ------------------------------------------------------------------------
  // Music & Atmosphere Studio Management
  // ------------------------------------------------------------------------
  bindMusicStudioEvents() {
    // Play/Pause master toggle
    const playToggle = document.getElementById('adminPlayToggleBtn');
    if (playToggle) {
      playToggle.addEventListener('click', () => {
        window.BgmPlayer?.toggle();
      });
    }

    // Prev / Next track
    const prevBtn = document.getElementById('adminPrevTrackBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        window.BgmPlayer?.prevTrack();
      });
    }

    const nextBtn = document.getElementById('adminNextTrackBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        window.BgmPlayer?.nextTrack();
      });
    }

    // Mute toggle
    let previousVol = 0.35;
    const muteBtn = document.getElementById('adminMuteToggleBtn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const curVol = window.BgmPlayer?.getVolume() ?? 0.35;
        if (curVol > 0) {
          previousVol = curVol;
          window.BgmPlayer?.setVolume(0);
        } else {
          window.BgmPlayer?.setVolume(previousVol || 0.35);
        }
      });
    }

    // Volume Slider
    const volSlider = document.getElementById('adminVolumeSlider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        window.BgmPlayer?.setVolume(val);
        const valDisplay = document.getElementById('adminVolumeVal');
        if (valDisplay) valDisplay.textContent = `${Math.round(val * 100)}%`;
      });
    }

    // Autostart toggle
    const autoStart = document.getElementById('adminBgmAutoStart');
    if (autoStart) {
      autoStart.checked = localStorage.getItem('cse_bgm_playing') === 'true';
      autoStart.addEventListener('change', () => {
        localStorage.setItem('cse_bgm_playing', autoStart.checked);
      });
    }

    // Add Custom Track Form
    const addTrackForm = document.getElementById('adminAddTrackForm');
    if (addTrackForm) {
      addTrackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('adminNewTrackTitle').value.trim();
        const tag = document.getElementById('adminNewTrackTag').value.trim();
        const src = document.getElementById('adminNewTrackSrc').value.trim();
        if (!title || !src) return;

        const newTrack = {
          id: 'track-' + Date.now(),
          src,
          tag: tag || '🍃 Genshin Acoustic',
          title
        };

        window.BgmPlayer?.addTrack(newTrack);
        this.renderMusicTrackTable();
        addTrackForm.reset();
        this.saveAtmosphereSettings(false);
      });
    }

    // Live Floating Boxes Real-time Preview
    const toggleFloat = document.getElementById('adminToggleFloatingBoxes');
    const floatStyle = document.getElementById('adminFloatingStyle');
    if (toggleFloat && floatStyle) {
      toggleFloat.addEventListener('change', () => {
        window.applyFloatingBoxes?.(toggleFloat.checked, floatStyle.value);
      });
      floatStyle.addEventListener('change', () => {
        window.applyFloatingBoxes?.(toggleFloat.checked, floatStyle.value);
      });
    }

    // Particle Density Real-time Preview
    const densitySelect = document.getElementById('adminParticleDensity');
    if (densitySelect) {
      densitySelect.addEventListener('change', () => {
        window.setAtmosphereDensity?.(parseInt(densitySelect.value, 10));
      });
    }

    // Save Studio & FX Configuration Button
    const saveFxBtn = document.getElementById('saveAtmosphereSettingsBtn');
    if (saveFxBtn) {
      saveFxBtn.addEventListener('click', () => {
        this.saveAtmosphereSettings(true);
      });
    }

    // Register BgmPlayer Listener for real-time console updates
    if (window.BgmPlayer && typeof window.BgmPlayer.addListener === 'function') {
      window.BgmPlayer.addListener((state) => {
        this.updateMusicConsole(state);
      });
    }
  },

  initMusicStudio() {
    const data = window.PortfolioState.data || {};
    const settings = data.settings || {};

    // Populate Floating settings
    const toggleFloat = document.getElementById('adminToggleFloatingBoxes');
    if (toggleFloat) toggleFloat.checked = settings.floatingBoxes !== false;

    const floatStyle = document.getElementById('adminFloatingStyle');
    if (floatStyle && settings.floatingIntensity) floatStyle.value = settings.floatingIntensity;

    const densitySelect = document.getElementById('adminParticleDensity');
    if (densitySelect && settings.particleDensity) densitySelect.value = String(settings.particleDensity);

    const tickerInput = document.getElementById('adminTickerText');
    if (tickerInput && settings.tickerText) tickerInput.value = settings.tickerText;

    const footerText = document.getElementById('adminFooterText');
    if (footerText && settings.footerText) footerText.value = settings.footerText;

    const footerAuthor = document.getElementById('adminFooterAuthor');
    if (footerAuthor && settings.footerAuthor) footerAuthor.value = settings.footerAuthor;

    // Render Track Table
    this.renderMusicTrackTable();

    // Sync current Bgm state
    if (window.BgmPlayer) {
      const state = window.BgmPlayer.getState();
      this.updateMusicConsole(state);
    }
  },

  updateMusicConsole(state) {
    if (!state) return;

    const statusDot = document.getElementById('adminMusicStatusDot');
    const statusText = document.getElementById('adminMusicStatusText');
    const playIcon = document.getElementById('adminPlayBtnIcon');
    const playLabel = document.getElementById('adminPlayBtnLabel');
    const trackTag = document.getElementById('adminMusicTrackTag');
    const trackTitle = document.getElementById('adminMusicTrackTitle');
    const volSlider = document.getElementById('adminVolumeSlider');
    const volVal = document.getElementById('adminVolumeVal');

    if (state.isPlaying) {
      if (statusDot) statusDot.classList.remove('paused');
      if (statusText) statusText.textContent = 'LIVE: AUDIO PLAYING';
      if (playIcon) playIcon.textContent = '❚❚';
      if (playLabel) playLabel.textContent = 'Pause Master Audio';
    } else {
      if (statusDot) statusDot.classList.add('paused');
      if (statusText) statusText.textContent = 'LIVE: AUDIO PAUSED';
      if (playIcon) playIcon.textContent = '▶';
      if (playLabel) playLabel.textContent = 'Start Master Audio';
    }

    if (state.currentTrack) {
      if (trackTag) trackTag.textContent = state.currentTrack.tag;
      if (trackTitle) trackTitle.textContent = state.currentTrack.title;
    }

    if (volSlider) volSlider.value = state.volume;
    if (volVal) volVal.textContent = `${Math.round(state.volume * 100)}%`;

    // Highlight active row in table
    document.querySelectorAll('#adminTrackTableBody tr').forEach((row, idx) => {
      if (idx === state.currentTrackIdx) {
        row.classList.add('active-track');
      } else {
        row.classList.remove('active-track');
      }
    });
  },

  renderMusicTrackTable() {
    const tbody = document.getElementById('adminTrackTableBody');
    if (!tbody) return;

    const tracks = (window.BgmPlayer && window.BgmPlayer.getTracks()) || 
                   (window.PortfolioState.data?.settings?.audio?.tracks) || [];

    const currentIdx = (window.BgmPlayer && window.BgmPlayer.getState().currentTrackIdx) || 0;

    tbody.innerHTML = tracks.map((t, idx) => `
      <tr class="${idx === currentIdx ? 'active-track' : ''}">
        <td><strong>${this.escape(t.tag)}</strong></td>
        <td>${this.escape(t.title)}</td>
        <td style="color: var(--ink-muted); font-size: 0.72rem;"><code>${this.escape(t.src)}</code></td>
        <td>
          <button type="button" class="vintage-btn btn-sm btn-outline play-track-row-btn" data-track-idx="${idx}">
            ${idx === currentIdx ? 'Playing' : '▶ Play'}
          </button>
          ${tracks.length > 1 ? `
            <button type="button" class="vintage-btn btn-sm btn-outline btn-danger delete-track-row-btn" data-track-idx="${idx}" style="margin-left: 0.25rem;">
              ✕
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.play-track-row-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-track-idx'), 10);
        window.BgmPlayer?.setTrack(idx);
        window.BgmPlayer?.play();
      });
    });

    tbody.querySelectorAll('.delete-track-row-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-track-idx'), 10);
        if (confirm(`Remove "${tracks[idx]?.title}" from playlist?`)) {
          window.BgmPlayer?.removeTrack(idx);
          this.renderMusicTrackTable();
          this.saveAtmosphereSettings(false);
        }
      });
    });
  },

  async saveAtmosphereSettings(showToast = true) {
    const data = window.PortfolioState.data || {};
    if (!data.settings) data.settings = {};

    const toggleFloat = document.getElementById('adminToggleFloatingBoxes');
    const floatStyle = document.getElementById('adminFloatingStyle');
    const densitySelect = document.getElementById('adminParticleDensity');
    const tickerInput = document.getElementById('adminTickerText');
    const footerText = document.getElementById('adminFooterText');
    const footerAuthor = document.getElementById('adminFooterAuthor');

    data.settings.floatingBoxes = toggleFloat ? toggleFloat.checked : true;
    data.settings.floatingIntensity = floatStyle ? floatStyle.value : 'normal';
    data.settings.particleDensity = densitySelect ? parseInt(densitySelect.value, 10) : 65;
    data.settings.tickerText = tickerInput ? tickerInput.value.trim() : "AVAILABLE FOR SWE INTERNSHIPS • VINTAGE 2D ARCHITECTURE • MADE ON SCARFACE LAB • MIR A K SAJID";
    data.settings.footerText = footerText ? footerText.value.trim() : "Made on Scarface Lab";
    data.settings.footerAuthor = footerAuthor ? footerAuthor.value.trim() : "Mir A K Sajid • Computer Science & Engineering Student";

    if (!data.settings.audio) data.settings.audio = {};
    if (window.BgmPlayer) {
      data.settings.audio.tracks = window.BgmPlayer.getTracks();
      data.settings.audio.volume = window.BgmPlayer.getVolume();
      data.settings.audio.currentTrackIdx = window.BgmPlayer.getState().currentTrackIdx;
    }

    await this.persistPortfolioData(data);

    if (showToast) {
      const feedback = document.getElementById('saveFxFeedback');
      if (feedback) {
        feedback.textContent = '✔ Studio configuration saved & live deployed!';
        feedback.style.color = 'var(--accent-patina)';
        setTimeout(() => { feedback.textContent = ''; }, 3500);
      }
    }
  },

  // ------------------------------------------------------------------------
  // Background Image Management
  // ------------------------------------------------------------------------
  bindBackgroundImageEvents() {
    const bgUrlInput = document.getElementById('adminBgImageUrl');
    const bgFileInput = document.getElementById('adminBgFileInput');
    const removeBgBtn = document.getElementById('adminRemoveBgBtn');
    const defaultBgBtn = document.getElementById('adminSetDefaultBgBtn');
    const opacityRange = document.getElementById('adminBgOpacityRange');
    const opacityVal = document.getElementById('adminBgOpacityVal');
    const saveBgBtn = document.getElementById('adminSaveBgBtn');

    // Live URL typing preview
    if (bgUrlInput) {
      bgUrlInput.addEventListener('input', () => {
        const url = bgUrlInput.value.trim();
        const opacity = opacityRange ? parseFloat(opacityRange.value) : 0.88;
        this.updateBgPreview(url);
        if (window.applyBackgroundImage) {
          window.applyBackgroundImage(url, opacity);
        }
      });
    }

    // Upload custom background image
    if (bgFileInput) {
      bgFileInput.addEventListener('change', async (e) => {
        const uploadedUrl = await this.handleImageUpload(e, 'adminBgImageUrl');
        const url = uploadedUrl || bgUrlInput?.value.trim();
        const opacity = opacityRange ? parseFloat(opacityRange.value) : 0.88;
        if (url) {
          this.updateBgPreview(url);
          if (window.applyBackgroundImage) {
            window.applyBackgroundImage(url, opacity);
          }
          await this.saveBackgroundSettings(false);
          const feedback = document.getElementById('adminBgFeedback');
          if (feedback) {
            feedback.textContent = '✔ Background uploaded & applied!';
            feedback.style.color = 'var(--accent-patina)';
            setTimeout(() => { feedback.textContent = ''; }, 3500);
          }
        }
      });
    }

    // Remove / Delete background image
    if (removeBgBtn) {
      removeBgBtn.addEventListener('click', async () => {
        if (bgUrlInput) bgUrlInput.value = '';
        this.updateBgPreview('');
        if (window.applyBackgroundImage) {
          window.applyBackgroundImage('', 0.88);
        }
        await this.saveBackgroundSettings(false);
        const feedback = document.getElementById('adminBgFeedback');
        if (feedback) {
          feedback.textContent = '✔ Background image deleted/removed!';
          feedback.style.color = 'var(--accent-rust)';
          setTimeout(() => { feedback.textContent = ''; }, 3500);
        }
      });
    }

    // Restore default bg1.jpg
    if (defaultBgBtn) {
      defaultBgBtn.addEventListener('click', async () => {
        const defaultBg = 'assets/images/bg1.jpg';
        if (bgUrlInput) bgUrlInput.value = defaultBg;
        const opacity = opacityRange ? parseFloat(opacityRange.value) : 0.88;
        this.updateBgPreview(defaultBg);
        if (window.applyBackgroundImage) {
          window.applyBackgroundImage(defaultBg, opacity);
        }
        await this.saveBackgroundSettings(false);
        const feedback = document.getElementById('adminBgFeedback');
        if (feedback) {
          feedback.textContent = '✔ Default bg1.jpg restored!';
          feedback.style.color = 'var(--accent-patina)';
          setTimeout(() => { feedback.textContent = ''; }, 3500);
        }
      });
    }

    // Opacity Range Slider
    if (opacityRange) {
      opacityRange.addEventListener('input', () => {
        const op = parseFloat(opacityRange.value);
        if (opacityVal) opacityVal.textContent = `${Math.round(op * 100)}%`;
        const layer = document.getElementById('siteBackgroundLayer');
        if (layer) layer.style.opacity = op;
        localStorage.setItem('cse_custom_bg_opacity', op);
      });
    }

    // Save button
    if (saveBgBtn) {
      saveBgBtn.addEventListener('click', async () => {
        await this.saveBackgroundSettings(true);
      });
    }
  },

  updateBgPreview(url) {
    const box = document.getElementById('adminBgPreviewBox');
    const badge = document.getElementById('adminBgBadge');
    if (!box) return;

    if (url && url.trim() !== '' && url !== 'none') {
      box.style.backgroundImage = `url('${url}')`;
      box.style.backgroundColor = 'transparent';
      if (badge) {
        if (url.includes('bg1.jpg')) {
          badge.textContent = 'bg1.jpg (Active)';
          badge.style.background = 'rgba(0,0,0,0.75)';
        } else {
          badge.textContent = 'Custom Artwork (Active)';
          badge.style.background = 'var(--accent-patina)';
        }
      }
    } else {
      box.style.backgroundImage = 'none';
      box.style.backgroundColor = 'rgba(0,0,0,0.06)';
      if (badge) {
        badge.textContent = 'No Background (Solid)';
        badge.style.background = 'rgba(100,100,100,0.8)';
      }
    }
  },

  syncBackgroundImageUI() {
    const settings = window.PortfolioState.data?.settings || {};
    const bgUrl = settings.backgroundImage !== undefined ? settings.backgroundImage : (localStorage.getItem('cse_custom_bg') ?? 'assets/images/bg1.jpg');
    const opacity = settings.backgroundOpacity !== undefined ? settings.backgroundOpacity : parseFloat(localStorage.getItem('cse_custom_bg_opacity') || '0.88');

    const bgUrlInput = document.getElementById('adminBgImageUrl');
    const opacityRange = document.getElementById('adminBgOpacityRange');
    const opacityVal = document.getElementById('adminBgOpacityVal');

    if (bgUrlInput) bgUrlInput.value = bgUrl || '';
    if (opacityRange) opacityRange.value = opacity;
    if (opacityVal) opacityVal.textContent = `${Math.round(opacity * 100)}%`;

    this.updateBgPreview(bgUrl);
  },

  async saveBackgroundSettings(showToast = true) {
    const data = window.PortfolioState.data || {};
    if (!data.settings) data.settings = {};

    const bgUrlInput = document.getElementById('adminBgImageUrl');
    const opacityRange = document.getElementById('adminBgOpacityRange');

    const url = bgUrlInput ? bgUrlInput.value.trim() : '';
    const opacity = opacityRange ? parseFloat(opacityRange.value) : 0.88;

    data.settings.backgroundImage = url;
    data.settings.backgroundOpacity = opacity;

    if (window.applyBackgroundImage) {
      window.applyBackgroundImage(url, opacity);
    }

    await this.persistPortfolioData(data);

    if (showToast) {
      const feedback = document.getElementById('adminBgFeedback');
      if (feedback) {
        feedback.textContent = '✔ Background settings saved & deployed!';
        feedback.style.color = 'var(--accent-patina)';
        setTimeout(() => { feedback.textContent = ''; }, 3500);
      }
    }
  },

  // ------------------------------------------------------------------------
  // Personal Vault & Google Drive Filesystem Management
  // ------------------------------------------------------------------------
  bindVaultEvents() {
    const pwdForm = document.getElementById('adminVaultPasswordForm');
    const addFileForm = document.getElementById('adminAddDriveFileForm');

    if (pwdForm) {
      pwdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('adminVaultPasswordInput');
        const feedback = document.getElementById('adminVaultPasswordFeedback');
        if (!input) return;

        const newPwd = input.value.trim();
        if (newPwd.length < 3) {
          if (feedback) {
            feedback.textContent = '❌ Passcode must be at least 3 characters.';
            feedback.style.color = 'var(--accent-rust)';
          }
          return;
        }

        try {
          const res = await this.authFetch('/api/vault/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: newPwd })
          });
          const result = await res.json();
          if (res.ok) {
            if (feedback) {
              feedback.textContent = `✔ Directory passcode updated & cryptographically saved!`;
              feedback.style.color = 'var(--accent-patina)';
              setTimeout(() => { if (feedback) feedback.textContent = ''; }, 3500);
            }
            const quickInput = document.getElementById('adminQuickVaultPasswordInput');
            if (quickInput) quickInput.value = newPwd;
          } else {
            throw new Error(result.error);
          }
        } catch (err) {
          if (feedback) {
            feedback.textContent = `❌ ${err.message || 'Failed to update passcode'}`;
            feedback.style.color = 'var(--accent-rust)';
          }
        }
      });
    }

    if (addFileForm) {
      addFileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('adminDriveFileName')?.value.trim();
        const driveUrl = document.getElementById('adminDriveFileUrl')?.value.trim();
        const folder = document.getElementById('adminDriveFileFolder')?.value.trim() || 'General Files';
        const type = document.getElementById('adminDriveFileType')?.value || 'pdf';
        const size = document.getElementById('adminDriveFileSize')?.value.trim() || 'Drive File';
        const desc = document.getElementById('adminDriveFileDesc')?.value.trim() || '';

        if (!name || !driveUrl) return;

        if (!window.PortfolioState.data) window.PortfolioState.data = {};
        if (!window.PortfolioState.data.personalDirectory) {
          window.PortfolioState.data.personalDirectory = { password: '1234', folders: [], files: [] };
        }

        const pDir = window.PortfolioState.data.personalDirectory;
        if (!pDir.files) pDir.files = [];
        if (!pDir.folders) pDir.folders = [];

        if (!pDir.folders.some(f => f.name.toLowerCase() === folder.toLowerCase())) {
          pDir.folders.push({
            id: 'f-' + Date.now(),
            name: folder,
            icon: '📁'
          });
        }

        const newFile = {
          id: 'drive-' + Date.now(),
          name,
          folder,
          size,
          type,
          driveUrl,
          updated: new Date().toISOString().slice(0, 7),
          desc
        };

        pDir.files.unshift(newFile);

        await this.persistPortfolioData(window.PortfolioState.data);

        addFileForm.reset();
        this.initVaultManager();
      });
    }
  },

  initVaultManager() {
    const data = window.PortfolioState.data?.personalDirectory || {};
    const pwdInput = document.getElementById('adminVaultPasswordInput');
    const folderList = document.getElementById('adminDriveFolderDatalist');
    const tableBody = document.getElementById('adminDriveTableBody');
    const totalBadge = document.getElementById('adminDriveTotalBadge');
    const countPill = document.getElementById('adminVaultCount');

    if (pwdInput && data.password !== undefined) {
      pwdInput.value = data.password;
    }

    const folders = data.folders || [];
    if (folderList) {
      folderList.innerHTML = folders.map(f => `<option value="${this.escape(f.name)}"></option>`).join('');
    }

    const files = data.files || [];
    if (totalBadge) totalBadge.textContent = `${files.length} Total Files`;
    if (countPill) countPill.textContent = files.length;

    if (!tableBody) return;

    if (files.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 1.5rem; color: var(--ink-secondary);">
            No Google Drive files cataloged. Use the registration form above to link files.
          </td>
        </tr>
      `;
      return;
    }

    const getIcon = (t) => {
      switch (t) {
        case 'pdf': return '📄';
        case 'zip': return '📦';
        case 'code': return '💻';
        case 'doc': return '📝';
        case 'sheet': return '📊';
        case 'img': return '🖼️';
        default: return '📁';
      }
    };

    tableBody.innerHTML = files.map(f => `
      <tr>
        <td style="text-align: center; font-size: 1.25rem;">${getIcon(f.type)}</td>
        <td>
          <div style="font-weight: 600; font-family: var(--font-mono); font-size: 0.85rem;">${this.escape(f.name)}</div>
          ${f.desc ? `<div style="font-size: 0.75rem; color: var(--ink-secondary);">${this.escape(f.desc)}</div>` : ''}
        </td>
        <td>
          <span class="tech-tag" style="font-size: 0.75rem;">${this.escape(f.folder)}</span>
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.78rem;">${this.escape(f.size || 'Drive Link')}</td>
        <td style="font-family: var(--font-mono); font-size: 0.78rem;">${this.escape(f.updated || '2026')}</td>
        <td style="text-align: right; white-space: nowrap;">
          <a href="${this.escape(f.driveUrl)}" target="_blank" rel="noopener" class="vintage-btn btn-sm btn-outline" style="margin-right: 4px;">
            🔗 Drive
          </a>
          <button type="button" class="vintage-btn btn-sm btn-danger delete-admin-drive-file" data-id="${f.id}" title="Delete file reference">
            🗑
          </button>
        </td>
      </tr>
    `).join('');

    tableBody.querySelectorAll('.delete-admin-drive-file').forEach(btn => {
      btn.addEventListener('click', async () => {
        const fileId = btn.getAttribute('data-id');
        if (confirm('Delete this Google Drive file reference?')) {
          data.files = data.files.filter(f => f.id !== fileId);
          await this.persistPortfolioData(window.PortfolioState.data);
          this.initVaultManager();
        }
      });
    });
  },

  // ------------------------------------------------------------------------
  // Security & Authentication Management
  // ------------------------------------------------------------------------
  bindSecurityEvents() {
    // Master Console PIN Update
    const masterPwdForm = document.getElementById('adminChangeMasterPasswordForm');
    if (masterPwdForm) {
      masterPwdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPwd = document.getElementById('adminCurrentMasterPwd')?.value.trim();
        const newPwd = document.getElementById('adminNewMasterPwd')?.value.trim();
        const confirmPwd = document.getElementById('adminConfirmMasterPwd')?.value.trim();
        const feedback = document.getElementById('adminMasterPwdFeedback');
        const submitBtn = document.getElementById('adminUpdateMasterPwdBtn');

        if (!currentPwd || !newPwd || !confirmPwd) {
          if (feedback) {
            feedback.textContent = '❌ All fields are required.';
            feedback.style.color = 'var(--accent-rust)';
          }
          return;
        }

        if (newPwd !== confirmPwd) {
          if (feedback) {
            feedback.textContent = '❌ New passcodes do not match.';
            feedback.style.color = 'var(--accent-rust)';
          }
          return;
        }

        if (newPwd.length < 6) {
          if (feedback) {
            feedback.textContent = '❌ New passcode must be at least 6 characters.';
            feedback.style.color = 'var(--accent-rust)';
          }
          return;
        }

        if (submitBtn) submitBtn.disabled = true;
        if (feedback) {
          feedback.textContent = '⚡ Updating master credentials with salted PBKDF2 hash...';
          feedback.style.color = 'var(--ink-secondary)';
        }

        try {
          const res = await this.authFetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
          });
          const result = await res.json();

          if (res.ok) {
            if (feedback) {
              feedback.textContent = '✔ Station Master PIN successfully updated!';
              feedback.style.color = 'var(--accent-patina)';
            }
            masterPwdForm.reset();
            setTimeout(() => { if (feedback) feedback.textContent = ''; }, 4500);
          } else {
            throw new Error(result.error || 'Failed to update passcode');
          }
        } catch (err) {
          if (feedback) {
            feedback.textContent = `❌ ${err.message}`;
            feedback.style.color = 'var(--accent-rust)';
          }
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // Quick Vault Password Update
    const quickVaultForm = document.getElementById('adminQuickVaultPasswordForm');
    if (quickVaultForm) {
      quickVaultForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('adminQuickVaultPasswordInput');
        const feedback = document.getElementById('adminQuickVaultPasswordFeedback');
        if (!input) return;

        const newPwd = input.value.trim();
        if (newPwd.length < 3) {
          if (feedback) {
            feedback.textContent = '❌ Vault passcode must be at least 3 characters.';
            feedback.style.color = 'var(--accent-rust)';
          }
          return;
        }

        try {
          const res = await this.authFetch('/api/vault/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: newPwd })
          });
          const result = await res.json();

          if (res.ok) {
            if (feedback) {
              feedback.textContent = '✔ Personal Directory passcode updated & active!';
              feedback.style.color = 'var(--accent-patina)';
              setTimeout(() => { if (feedback) feedback.textContent = ''; }, 3500);
            }
            const vaultInput = document.getElementById('adminVaultPasswordInput');
            if (vaultInput) vaultInput.value = newPwd;
          } else {
            throw new Error(result.error || 'Failed to update passcode');
          }
        } catch (err) {
          if (feedback) {
            feedback.textContent = `❌ ${err.message}`;
            feedback.style.color = 'var(--accent-rust)';
          }
        }
      });
    }
  },

  // ------------------------------------------------------------------------
  // HSC Academic Resources Management (Hierarchical Books, Board Solutions, Tricks, Tests)
  // ------------------------------------------------------------------------
  hscCategories: {
    books: {
      key: 'books',
      formId: 'adminAddHscBookForm',
      subjectId: 'hscBookSubject',
      paperId: 'hscBookPaper',
      nameId: 'hscBookName',
      authorId: 'hscBookAuthor',
      urlId: 'hscBookUrl',
      yearId: 'hscBookYear',
      descId: 'hscBookDesc',
      submitId: 'hscBookSubmitBtn',
      cancelId: 'hscBookCancelEdit',
      editIdId: 'hscBookEditId',
      feedbackId: 'hscBookFeedback',
      tableBodyId: 'hscBooksTableBody',
      countId: 'hscBookCount'
    },
    board: {
      key: 'board',
      formId: 'adminAddHscBoardForm',
      subjectId: 'hscBoardSubject',
      paperId: 'hscBoardPaper',
      nameId: 'hscBoardName',
      boardId: 'hscBoardBoard',
      urlId: 'hscBoardUrl',
      yearId: 'hscBoardYear',
      descId: 'hscBoardDesc',
      submitId: 'hscBoardSubmitBtn',
      cancelId: 'hscBoardCancelEdit',
      editIdId: 'hscBoardEditId',
      feedbackId: 'hscBoardFeedback',
      tableBodyId: 'hscBoardTableBody',
      countId: 'hscBoardCount'
    },
    tricks: {
      key: 'tricks',
      formId: 'adminAddHscTricksForm',
      nameId: 'hscTricksName',
      subjectId: 'hscTricksSubject',
      urlId: 'hscTricksUrl',
      yearId: 'hscTricksYear',
      descId: 'hscTricksDesc',
      submitId: 'hscTricksSubmitBtn',
      cancelId: 'hscTricksCancelEdit',
      editIdId: 'hscTricksEditId',
      feedbackId: 'hscTricksFeedback',
      tableBodyId: 'hscTricksTableBody',
      countId: 'hscTricksCount'
    },
    tests: {
      key: 'tests',
      formId: 'adminAddHscTestsForm',
      nameId: 'hscTestsName',
      subjectId: 'hscTestsSubject',
      urlId: 'hscTestsUrl',
      yearId: 'hscTestsYear',
      descId: 'hscTestsDesc',
      submitId: 'hscTestsSubmitBtn',
      cancelId: 'hscTestsCancelEdit',
      editIdId: 'hscTestsEditId',
      feedbackId: 'hscTestsFeedback',
      tableBodyId: 'hscTestsTableBody',
      countId: 'hscTestsCount'
    }
  },

  hscDataCache: null,
  hscBound: false,

  async fetchHscData() {
    try {
      const res = await fetch('/api/hsc');
      if (res.ok) {
        this.hscDataCache = await res.json();
        localStorage.setItem('cse_hsc_data', JSON.stringify(this.hscDataCache));
        return this.hscDataCache;
      }
    } catch (e) {
      console.warn('HSC API fetch fallback to local storage:', e);
    }
    const cached = localStorage.getItem('cse_hsc_data');
    if (cached) {
      try { this.hscDataCache = JSON.parse(cached); return this.hscDataCache; } catch (e) {}
    }
    this.hscDataCache = { books: [], board: [], tricks: [], tests: [] };
    return this.hscDataCache;
  },

  async initHscManager() {
    if (!this.hscBound) {
      this.bindHscControls();
      this.hscBound = true;
    }
    await this.fetchHscData();
    this.renderAllHscTables();
  },

  bindHscControls() {
    document.querySelectorAll('.admin-hsc-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-hsc-tab-btn').forEach(b => {
          b.style.background = 'var(--bg-subtle)';
          b.style.color = 'var(--ink-secondary)';
          b.classList.remove('active');
        });
        document.querySelectorAll('.hsc-admin-pane').forEach(p => p.style.display = 'none');
        btn.style.background = 'var(--bg-surface)';
        btn.style.color = 'var(--accent-rust)';
        btn.classList.add('active');
        const paneId = btn.getAttribute('data-hsc-pane');
        const targetPane = document.getElementById(paneId);
        if (targetPane) targetPane.style.display = 'block';
      });
    });

    Object.keys(this.hscCategories).forEach(catKey => {
      const cfg = this.hscCategories[catKey];
      const form = document.getElementById(cfg.formId);
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleHscFormSubmit(catKey);
        });
      }
      const cancelBtn = document.getElementById(cfg.cancelId);
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this.resetHscForm(catKey);
        });
      }
    });
  },

  async handleHscFormSubmit(catKey) {
    const cfg = this.hscCategories[catKey];
    const nameInput = document.getElementById(cfg.nameId);
    const subjectInput = document.getElementById(cfg.subjectId);
    const paperInput = cfg.paperId ? document.getElementById(cfg.paperId) : null;
    const authorInput = cfg.authorId ? document.getElementById(cfg.authorId) : null;
    const boardInput = cfg.boardId ? document.getElementById(cfg.boardId) : null;
    const urlInput = document.getElementById(cfg.urlId);
    const yearInput = document.getElementById(cfg.yearId);
    const descInput = document.getElementById(cfg.descId);
    const editIdInput = document.getElementById(cfg.editIdId);
    const feedback = document.getElementById(cfg.feedbackId);

    const name = nameInput ? nameInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : '';
    const paper = paperInput ? paperInput.value.trim() : '1st Paper';
    const author = authorInput ? authorInput.value.trim() : '';
    const board = boardInput ? boardInput.value.trim() : '';
    const downloadUrl = urlInput ? urlInput.value.trim() : '';
    const year = yearInput ? yearInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const editId = editIdInput ? editIdInput.value.trim() : '';

    if (!name || !downloadUrl) {
      if (feedback) {
        feedback.textContent = '⚠️ Title and Download Link are required.';
        feedback.style.color = 'var(--accent-rust)';
      }
      return;
    }

    const payload = {
      id: editId || undefined,
      name,
      subject,
      paper,
      author,
      board,
      edition: year,
      year,
      downloadUrl,
      desc
    };

    if (feedback) {
      feedback.textContent = '💾 Saving resource...';
      feedback.style.color = 'var(--accent-amber)';
    }

    try {
      const res = await this.authFetch(`/api/hsc/${catKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        if (feedback) {
          feedback.textContent = editId ? '✔ Resource updated!' : '✔ Resource added to library!';
          feedback.style.color = 'var(--accent-patina)';
          setTimeout(() => { if (feedback) feedback.textContent = ''; }, 3500);
        }
        this.resetHscForm(catKey);
        await this.fetchHscData();
        this.renderHscTable(catKey);
      } else {
        throw new Error(data.error || 'Failed to save resource');
      }
    } catch (err) {
      if (feedback) {
        feedback.textContent = `❌ ${err.message}`;
        feedback.style.color = 'var(--accent-rust)';
      }
    }
  },

  resetHscForm(catKey) {
    const cfg = this.hscCategories[catKey];
    const form = document.getElementById(cfg.formId);
    if (form) form.reset();
    const editIdInput = document.getElementById(cfg.editIdId);
    if (editIdInput) editIdInput.value = '';
    const submitBtn = document.getElementById(cfg.submitId);
    if (submitBtn) {
      submitBtn.textContent = catKey === 'books' ? '+ Save Science Book' :
                              catKey === 'board' ? '+ Save Solution Book' :
                              catKey === 'tricks' ? '+ Save Trick Sheet' : '+ Save Test Paper';
    }
    const cancelBtn = document.getElementById(cfg.cancelId);
    if (cancelBtn) cancelBtn.style.display = 'none';
  },

  editHscItem(catKey, id) {
    if (!this.hscDataCache || !this.hscDataCache[catKey]) return;
    const cfg = this.hscCategories[catKey];

    let foundItem = null;
    let foundSubject = '';

    if (catKey === 'books' || catKey === 'board') {
      // Search inside subject group papers
      for (const group of this.hscDataCache[catKey]) {
        if (Array.isArray(group.papers)) {
          const p = group.papers.find(x => x.id === id);
          if (p) {
            foundItem = p;
            foundSubject = group.subject || '';
            break;
          }
        }
        if (group.id === id) {
          foundItem = group;
          foundSubject = group.subject || '';
          break;
        }
      }
    }

    if (!foundItem) {
      foundItem = this.hscDataCache[catKey].find(x => x.id === id);
    }

    if (!foundItem) return;

    const setVal = (elemId, val) => {
      const el = document.getElementById(elemId);
      if (el) el.value = val || '';
    };

    setVal(cfg.editIdId, foundItem.id);
    setVal(cfg.nameId, foundItem.name);
    if (cfg.subjectId) setVal(cfg.subjectId, foundSubject || foundItem.subject || 'Physics');
    if (cfg.paperId) setVal(cfg.paperId, foundItem.paper || '1st Paper');
    if (cfg.authorId) setVal(cfg.authorId, foundItem.author || foundItem.edition || '');
    if (cfg.boardId) setVal(cfg.boardId, foundItem.board || '');
    setVal(cfg.urlId, foundItem.downloadUrl);
    setVal(cfg.yearId, foundItem.edition || foundItem.year || '');
    setVal(cfg.descId, foundItem.desc);

    const submitBtn = document.getElementById(cfg.submitId);
    if (submitBtn) submitBtn.textContent = '💾 Update Resource';
    const cancelBtn = document.getElementById(cfg.cancelId);
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';

    const form = document.getElementById(cfg.formId);
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  async deleteHscItem(catKey, id) {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const res = await this.authFetch(`/api/hsc/${catKey}/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await this.fetchHscData();
        this.renderHscTable(catKey);
      } else {
        const err = await res.json();
        alert(`Failed to delete: ${err.error || 'Server error'}`);
      }
    } catch (e) {
      alert(`Error deleting item: ${e.message}`);
    }
  },

  renderAllHscTables() {
    Object.keys(this.hscCategories).forEach(catKey => {
      this.renderHscTable(catKey);
    });
  },

  renderHscTable(catKey) {
    const cfg = this.hscCategories[catKey];
    const tbody = document.getElementById(cfg.tableBodyId);
    const countEl = document.getElementById(cfg.countId);
    if (!tbody) return;

    const rawData = (this.hscDataCache && this.hscDataCache[catKey]) || [];

    // Flatten hierarchical data for tabular display in admin
    let tableRows = [];
    if (catKey === 'books' || catKey === 'board') {
      rawData.forEach(group => {
        if (Array.isArray(group.papers) && group.papers.length > 0) {
          group.papers.forEach(p => {
            tableRows.push({
              id: p.id,
              subject: group.subject || 'General',
              paper: p.paper || '1st Paper',
              name: p.name,
              author: p.author || p.board || '',
              board: p.board || '',
              year: p.edition || p.year || '',
              downloadUrl: p.downloadUrl,
              desc: p.desc || ''
            });
          });
        } else {
          tableRows.push({
            id: group.id,
            subject: group.subject || 'General',
            paper: group.paper || 'Full Guide',
            name: group.name || group.subject,
            author: group.author || '',
            board: group.board || '',
            year: group.year || group.edition || '',
            downloadUrl: group.downloadUrl || '',
            desc: group.desc || ''
          });
        }
      });
    } else {
      tableRows = rawData;
    }

    if (countEl) countEl.textContent = tableRows.length;

    if (tableRows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--ink-muted); font-family: var(--font-mono); padding: 1.5rem;">
            No ${catKey} items cataloged yet. Use the form above to add one.
          </td>
        </tr>
      `;
      return;
    }

    if (catKey === 'books') {
      tbody.innerHTML = tableRows.map(item => `
        <tr>
          <td>
            <span class="vintage-tag" style="font-size: 0.72rem; font-weight:700;">${this.escape(item.subject)}</span>
          </td>
          <td>
            <span class="hsc-paper-pill ${String(item.paper).includes('1st') ? 'pill-1st' : 'pill-2nd'}">${this.escape(item.paper)}</span>
          </td>
          <td>
            <div style="font-weight: 700; font-family: var(--font-serif); font-size: 0.92rem;">${this.escape(item.name)}</div>
            ${item.author ? `<div style="font-size: 0.78rem; color: var(--ink-secondary);">✍️ ${this.escape(item.author)}</div>` : ''}
            ${item.desc ? `<div style="font-size: 0.75rem; color: var(--ink-muted); margin-top:2px;">${this.escape(item.desc)}</div>` : ''}
          </td>
          <td style="font-family: var(--font-mono); font-size: 0.78rem;">${this.escape(item.year || '—')}</td>
          <td>
            ${item.downloadUrl ? `
              <a href="${this.escape(item.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="vintage-btn btn-sm btn-outline" style="font-size: 0.7rem; padding: 2px 7px;">
                🔗 PDF ↗
              </a>
            ` : '<span style="color:var(--ink-muted); font-size:0.75rem;">None</span>'}
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button type="button" class="vintage-btn btn-sm" onclick="window.AdminPanel.editHscItem('${catKey}', '${this.escape(item.id)}')">✏️ Edit</button>
            <button type="button" class="vintage-btn btn-sm btn-outline btn-danger" onclick="window.AdminPanel.deleteHscItem('${catKey}', '${this.escape(item.id)}')">🗑️</button>
          </td>
        </tr>
      `).join('');
    } else if (catKey === 'board') {
      tbody.innerHTML = tableRows.map(item => `
        <tr>
          <td>
            <span class="vintage-tag" style="font-size: 0.72rem; font-weight:700;">${this.escape(item.subject)}</span>
          </td>
          <td>
            <span class="hsc-paper-pill ${String(item.paper).includes('1st') ? 'pill-1st' : 'pill-2nd'}">${this.escape(item.paper)}</span>
          </td>
          <td>
            <div style="font-weight: 700; font-family: var(--font-serif); font-size: 0.92rem;">${this.escape(item.name)}</div>
            ${item.desc ? `<div style="font-size: 0.75rem; color: var(--ink-muted); margin-top:2px;">${this.escape(item.desc)}</div>` : ''}
          </td>
          <td style="font-family: var(--font-mono); font-size: 0.78rem;">
            ${item.board ? `<div>🏛️ ${this.escape(item.board)}</div>` : ''}
            <div>📅 ${this.escape(item.year || '—')}</div>
          </td>
          <td>
            ${item.downloadUrl ? `
              <a href="${this.escape(item.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="vintage-btn btn-sm btn-outline" style="font-size: 0.7rem; padding: 2px 7px;">
                🔗 PDF ↗
              </a>
            ` : '<span style="color:var(--ink-muted); font-size:0.75rem;">None</span>'}
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button type="button" class="vintage-btn btn-sm" onclick="window.AdminPanel.editHscItem('${catKey}', '${this.escape(item.id)}')">✏️ Edit</button>
            <button type="button" class="vintage-btn btn-sm btn-outline btn-danger" onclick="window.AdminPanel.deleteHscItem('${catKey}', '${this.escape(item.id)}')">🗑️</button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = tableRows.map(item => `
        <tr>
          <td>
            <div style="font-weight: 700; font-family: var(--font-serif); font-size: 0.95rem;">${this.escape(item.name)}</div>
            ${item.desc ? `<div style="font-size: 0.78rem; color: var(--ink-muted); line-height: 1.4;">${this.escape(item.desc)}</div>` : ''}
          </td>
          <td>
            <span class="vintage-tag" style="font-size: 0.7rem;">${this.escape(item.subject || 'General')}</span>
          </td>
          <td style="font-family: var(--font-mono); font-size: 0.78rem;">${this.escape(item.year || '—')}</td>
          <td>
            ${item.downloadUrl ? `
              <a href="${this.escape(item.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="vintage-btn btn-sm btn-outline" style="font-size: 0.7rem; padding: 2px 7px;">
                🔗 Link ↗
              </a>
            ` : '<span style="color:var(--ink-muted); font-size:0.75rem;">None</span>'}
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button type="button" class="vintage-btn btn-sm" onclick="window.AdminPanel.editHscItem('${catKey}', '${this.escape(item.id)}')">✏️ Edit</button>
            <button type="button" class="vintage-btn btn-sm btn-outline btn-danger" onclick="window.AdminPanel.deleteHscItem('${catKey}', '${this.escape(item.id)}')">🗑️</button>
          </td>
        </tr>
      `).join('');
    }
  },

  escape(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
};

// Initialize Admin Panel on load
document.addEventListener('DOMContentLoaded', () => {
  window.AdminPanel.init();
});
