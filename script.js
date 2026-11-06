/**
 * Vintage 2D CSE Developer Portfolio & Interactive Terminal Engine
 * Pure Vanilla JavaScript ES6
 */

// Global State
window.PortfolioState = {
  data: null,
  activeFilter: 'all',
  theme: localStorage.getItem('cse_vintage_theme') || 'vintage-parchment',
  audioEnabled: localStorage.getItem('cse_audio_fx') !== 'false',
  scanlinesEnabled: localStorage.getItem('cse_scanlines') === 'true'
};

// Web Audio API Typewriter Click Sound Synthesizer
class VintageAudio {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext))) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playMechanicalClick(freq = 880, duration = 0.035) {
    if (!window.PortfolioState || !window.PortfolioState.audioEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Clean modern cyber sine-chirp
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration * 0.4);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay fallback
    }
  }

  playBell() {
    if (!window.PortfolioState || !window.PortfolioState.audioEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      // Dual-tone harmonic crystal chime
      const freqs = [1046.5, 1318.5]; // C6 and E6
      freqs.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      });
    } catch (e) {}
  }
}

const vintageSound = new VintageAudio();

// Fallback Default Data (ensures 100% offline functionality)
const DEFAULT_FALLBACK_PORTFOLIO = {
  profile: {
    name: "Mir A K Sajid",
    role: "Computer Science & Engineering Student",
    subtitle: "Systems Engineer, Compiler Enthusiast & Full-Stack Developer",
    university: "Department of Computer Science & Engineering",
    degree: "B.S. in Computer Science & Engineering (2022 – 2026)",
    gpa: "3.89 / 4.00 (Dean's Honor Roll)",
    status: "Available for Summer/Fall 2026 SWE Internships",
    bio: "Third-year CSE undergraduate passionate about exploring computing from silicon transistors to distributed web architectures. I spend my days building optimizing bytecode compilers, dissecting OS kernels, solving algorithmic challenges on LeetCode, and crafting snappy, bloat-free software systems.",
    avatar: "assets/uploads/Mir_jpg.jpg",
    location: "San Francisco, CA / Open to Remote",
    email: "mir.sajid.cse@example.edu",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    leetcode: "https://leetcode.com",
    codeforces: "https://codeforces.com",
    resumeUrl: "#",
    stats: [
      { label: "LeetCode Solved", value: "520+" },
      { label: "Projects Built", value: "16+" },
      { label: "CGPA", value: "3.89" },
      { label: "Hackathon Wins", value: "3x" }
    ]
  },
  projects: [
    {
      id: "proj-1",
      title: "VintageOS: 32-Bit Microkernel & Shell",
      category: "Systems & OS",
      tagline: "Educational x86 kernel with preemptive scheduler & custom filesystem",
      description: "A bare-metal 32-bit protected-mode operating system written from scratch in C and x86 Assembly. Implements memory paging, interrupt service routines (IDT/PIC), preemptive round-robin task scheduler, FAT16 filesystem reader, and a vintage 2D shell with 18 built-in Unix-like commands.",
      image: "assets/images/project-circuits.jpg",
      techStack: ["C", "x86 Assembly", "QEMU", "GDB", "Make", "Linker Scripts"],
      github: "https://github.com/example/vintage-os",
      demo: "https://example.com/vintage-os",
      year: "2025",
      badge: "O(1) Scheduler",
      featured: true
    },
    {
      id: "proj-2",
      title: "RetroCompiler: Bytecode VM & Parser",
      category: "Compilers & Langs",
      tagline: "Statically-typed language compiler with custom register-based VM",
      description: "An end-to-end compiler pipeline and runtime virtual machine for 'VintageLang'. Features a handwritten recursive descent lexer, LALR(1) parser with detailed syntax diagnostics, abstract syntax tree (AST) constant folding, and an optimizing bytecode interpreter running 3.2x faster than standard tree-walk evaluators.",
      image: "assets/images/project-terminal.jpg",
      techStack: ["C++", "C++20", "LLVM", "CMake", "GTest"],
      github: "https://github.com/example/retro-compiler",
      demo: "https://example.com/retro-compiler",
      year: "2025",
      badge: "3.2x Faster",
      featured: true
    },
    {
      id: "proj-3",
      title: "AlgoCraft: Interactive Graph & Tree Visualizer",
      category: "Web & Algorithms",
      tagline: "Step-by-step visual exploration of complex DSA algorithms",
      description: "A responsive 2D algorithm canvas designed for CSE students to visually inspect pathfinding (Dijkstra, A*, Floyd-Warshall), Red-Black Tree rotations, dynamic programming memoization tables, and stack frame execution in real time with playback controls and step-by-step state inspection.",
      image: "assets/images/project-devdesk.jpg",
      techStack: ["TypeScript", "Canvas API", "Algorithms", "Web Audio", "Vite"],
      github: "https://github.com/example/algocraft",
      demo: "https://example.com/algocraft",
      year: "2024",
      badge: "60 FPS Canvas",
      featured: true
    },
    {
      id: "proj-4",
      title: "RaftKV: Distributed Consensus Key-Value Engine",
      category: "Distributed Systems",
      tagline: "Fault-tolerant cluster storage implementing Raft consensus",
      description: "A distributed key-value storage engine implementing the Raft distributed consensus algorithm. Handles network partitions, leader election, log replication with write-ahead logging (WAL), log compaction via snapshotting, and linearizable client reads/writes across multi-node clusters.",
      image: "assets/images/project-vintage-pc.jpg",
      techStack: ["Go", "gRPC", "Protobuf", "Raft Protocol", "Docker"],
      github: "https://github.com/example/raft-kv",
      demo: "https://example.com/raft-kv",
      year: "2024",
      badge: "Linearizable",
      featured: true
    },
    {
      id: "proj-5",
      title: "NeuralFromScratch: C++ Deep Learning Engine",
      category: "AI / ML & Math",
      tagline: "Header-only matrix engine & neural network without frameworks",
      description: "A matrix computation and autodiff tensor engine created without any external machine learning dependencies. Implements 2D convolutions, multi-head attention blocks, AdamW optimizer, and SIMD vectorization yielding 98.4% classification accuracy on benchmark datasets.",
      image: "assets/images/academics-notes.jpg",
      techStack: ["C++", "AVX2 SIMD", "Linear Algebra", "Calculus"],
      github: "https://github.com/example/neural-scratch",
      demo: "https://example.com/neural-scratch",
      year: "2024",
      badge: "0 Dependencies",
      featured: false
    },
    {
      id: "proj-6",
      title: "MechTerm: Retro Vintage Terminal Emulator",
      category: "Tooling & CLI",
      tagline: "Aesthetic mechanical 2D terminal with CRT phosphor shader",
      description: "A lightweight web terminal emulator featuring retro phosphor beam bloom, scanline shaders, tactile mechanical click synthesis via Web Audio API, and seamless POSIX shell commands simulation for Unix enthusiasts.",
      image: "assets/images/project-keyboard.jpg",
      techStack: ["JavaScript", "WebGL", "Web Audio API", "CSS Shaders"],
      github: "https://github.com/example/mech-term",
      demo: "https://example.com/mech-term",
      year: "2023",
      badge: "CRT Shader",
      featured: false
    }
  ],
  skills: [
    { name: "Data Structures & Algorithms", category: "Core CS", level: 94, icon: "cplusplus", desc: "Graphs, DP, Trees, Heaps, Complexity Analysis" },
    { name: "Operating Systems & Linux", category: "Core CS", level: 90, icon: "linux", desc: "Paging, Virtual Memory, Concurrency, Syscalls, POSIX" },
    { name: "Database Management (DBMS)", category: "Core CS", level: 88, icon: "postgresql", desc: "ACID, B+ Trees, Query Optimization, Normalization" },
    { name: "Computer Networks", category: "Core CS", level: 85, icon: "linux", desc: "TCP/IP, Sockets, HTTP/2, DNS, Routing Protocols" },
    { name: "C / C++ (C++20)", category: "Languages", level: 92, icon: "cplusplus", desc: "Pointers, Memory Mgmt, RAII, Templates, STL" },
    { name: "Python", category: "Languages", level: 90, icon: "python", desc: "Scripting, PyTorch, Automation, Data Processing" },
    { name: "Rust", category: "Languages", level: 78, icon: "rust", desc: "Ownership model, Borrow checker, Memory safety" },
    { name: "TypeScript / JavaScript", category: "Languages", level: 88, icon: "javascript", desc: "Async/Await, Strict Types, DOM Canvas, Modern ES" },
    { name: "Java", category: "Languages", level: 84, icon: "java", desc: "OOP, Concurrency, JVM Internals, Design Patterns" },
    { name: "React & Modern Web", category: "Frameworks", level: 86, icon: "react", desc: "State architecture, Hooks, Virtual DOM, CSS" },
    { name: "Docker & Containers", category: "Tools & Systems", level: 82, icon: "docker", desc: "Multi-stage builds, Compose, Container isolation" },
    { name: "Git & GitHub", category: "Tools & Systems", level: 92, icon: "git", desc: "Branching strategies, Rebase, Actions CI/CD" }
  ],
  experience: [
    {
      id: "exp-1",
      role: "Systems Software Engineering Intern",
      company: "VectorScale Systems",
      period: "June 2025 – August 2025",
      location: "Palo Alto, CA",
      type: "Internship",
      description: "Engineered an in-memory packet caching layer in C++ reducing P99 network latency by 32%. Authored end-to-end integration tests using Docker and GTest. Contributed to microservice telemetry tracing handling 50k requests/sec.",
      badges: ["C++", "Distributed Systems", "Performance Tuning"]
    },
    {
      id: "exp-2",
      role: "Undergraduate Teaching Assistant (DSA)",
      company: "Department of Computer Science",
      period: "August 2024 – May 2025",
      location: "University Campus",
      type: "Academic",
      description: "Conducted weekly lab sessions for 140+ sophomore students covering advanced Graph algorithms, Dynamic Programming, and Red-Black Trees. Developed automated autograder test suites evaluating time and memory bounds.",
      badges: ["DSA", "Code Review", "Mentorship", "Python"]
    },
    {
      id: "exp-3",
      role: "Open Source Systems Lead",
      company: "University Hackers & CS Society",
      period: "January 2024 – Present",
      location: "Student Chapter",
      type: "Leadership",
      description: "Organized 8 workshops on Linux internals, Git workflows, and competitive programming. Spearheaded the university's annual 36-hour hackathon attracting over 450 student participants.",
      badges: ["Linux", "Community", "Leadership", "Competitive Programming"]
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science & Engineering",
      institution: "University School of Computing & Engineering",
      period: "2022 – Expected May 2026",
      score: "CGPA: 3.89 / 4.00",
      highlights: "Dean's Honor List (All Semesters), President of Systems Computing Club, ACM Student Member",
      coursework: [
        "Data Structures & Algorithms (Grade: A)",
        "Operating Systems & Architecture (Grade: A)",
        "Database Management Systems (Grade: A)",
        "Computer Networks (Grade: A-)",
        "Theory of Computation & Automata (Grade: A)",
        "Compiler Design (Grade: A)"
      ]
    }
  ],
  settings: {
    backgroundImage: "assets/images/bg1.jpg",
    backgroundOpacity: 0.35,
    floatingBoxes: true,
    floatingIntensity: "normal",
    particleDensity: 65,
    particleType: "auto",
    tickerText: "AVAILABLE FOR SWE INTERNSHIPS • VINTAGE 2D ARCHITECTURE • MADE ON SCARFACE LAB • MIR A K SAJID • SYSTEMS & COMPILERS",
    footerText: "Made on Scarface Lab",
    footerAuthor: "Mir A K Sajid • Computer Science & Engineering Student",
    audio: {
      bgmEnabled: true,
      volume: 0.35,
      currentTrackIdx: 0,
      tracks: [
        {
          id: "track-1",
          src: "assets/audio/dawn_winery_acoustic.mp3",
          tag: "🍃 Mondstadt Winds",
          title: "Dawn Winery Tavern (Acoustic)"
        },
        {
          id: "track-2",
          src: "assets/audio/genshin_bgm.mp3",
          tag: "🌙 Liyue Nightfall",
          title: "Peaceful Piano Exploration"
        },
        {
          id: "track-3",
          src: "assets/audio/genshin_bgm.mp3",
          tag: "🌸 Inazuma Breeze",
          title: "Autumn Tranquility (Acoustic Koto)"
        },
        {
          id: "track-4",
          src: "assets/audio/dawn_winery_acoustic.mp3",
          tag: "🌿 Sumeru Oasis",
          title: "Port Ormos Acoustic Rhythms"
        }
      ]
    }
  },
  personalDirectory: {
    password: "1234",
    title: "Mir's Personal Drive & Filesystem",
    description: "Curated engineering notes, textbooks, research papers, and lab archives hosted on Google Drive.",
    folders: [
      { id: "f-1", name: "OS & Compilers", icon: "⚙️" },
      { id: "f-2", name: "Textbooks & Cheatsheets", icon: "📚" },
      { id: "f-3", name: "Distributed Systems", icon: "🌐" },
      { id: "f-4", name: "Competitive Programming", icon: "⚡" },
      { id: "f-5", name: "Resumes & Certifications", icon: "🏆" }
    ],
    files: [
      {
        id: "file-1",
        name: "VintageOS_32Bit_Kernel_Architecture.pdf",
        folder: "OS & Compilers",
        size: "4.8 MB",
        type: "pdf",
        driveUrl: "https://drive.google.com/file/d/example_vintage_os/view",
        updated: "2026-10",
        desc: "Protected-mode x86 microkernel design specification and syscall ABI documentation."
      },
      {
        id: "file-2",
        name: "Compilers_Bytecode_VM_Specification.pdf",
        folder: "OS & Compilers",
        size: "8.2 MB",
        type: "pdf",
        driveUrl: "https://drive.google.com/file/d/example_compiler_vm/view",
        updated: "2026-09",
        desc: "Grammar AST definitions, constant folding passes, and register-based VM opcode spec."
      },
      {
        id: "file-3",
        name: "Raft_Consensus_Distributed_Store.zip",
        folder: "Distributed Systems",
        size: "15.4 MB",
        type: "zip",
        driveUrl: "https://drive.google.com/file/d/example_raft_kv/view",
        updated: "2026-08",
        desc: "Source code archive, cluster docker-compose configurations, and benchmark outputs."
      },
      {
        id: "file-4",
        name: "DSA_Advanced_Algorithms_Cheatsheet.cpp",
        folder: "Competitive Programming",
        size: "85 KB",
        type: "code",
        driveUrl: "https://drive.google.com/file/d/example_dsa_code/view",
        updated: "2026-10",
        desc: "Graph algorithms (Tarjan, Dijkstra), Segment Tree with Lazy Propagation, and DSU templates."
      },
      {
        id: "file-5",
        name: "Operating_Systems_Three_Easy_Pieces_Notes.pdf",
        folder: "Textbooks & Cheatsheets",
        size: "11.1 MB",
        type: "pdf",
        driveUrl: "https://drive.google.com/file/d/example_ostep_notes/view",
        updated: "2026-07",
        desc: "Summary of virtualization, concurrency primitives (semaphores, mutexes), and persistence."
      },
      {
        id: "file-6",
        name: "Mir_A_K_Sajid_Official_CSE_Resume.pdf",
        folder: "Resumes & Certifications",
        size: "240 KB",
        type: "pdf",
        driveUrl: "https://drive.google.com/file/d/example_mir_resume/view",
        updated: "2026-10",
        desc: "Updated resume for Software Engineering internships and research opportunities."
      }
    ]
  }
};

/**
 * Custom Background Artwork Controller
 */
function applyBackgroundImage(bgUrl, opacity) {
  let layer = document.getElementById('siteBackgroundLayer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'siteBackgroundLayer';
    document.body.prepend(layer);
  }

  if (bgUrl && bgUrl.trim() !== '' && bgUrl !== 'none') {
    layer.style.backgroundImage = `url("${bgUrl}")`;
    layer.style.display = 'block';
    document.body.classList.add('has-custom-bg');
    document.body.classList.remove('no-custom-bg');
    if (opacity !== undefined && opacity !== null) {
      layer.style.opacity = opacity;
    }
  } else {
    layer.style.backgroundImage = 'none';
    layer.style.display = 'none';
    document.body.classList.remove('has-custom-bg');
    document.body.classList.add('no-custom-bg');
  }

  localStorage.setItem('cse_custom_bg', bgUrl || '');
  if (opacity !== undefined && opacity !== null) {
    localStorage.setItem('cse_custom_bg_opacity', opacity);
  }
}
window.applyBackgroundImage = applyBackgroundImage;

/**
 * 2D Retro Game Floating Boxes Controller
 */
function applyFloatingBoxes(enabled = true, intensity = 'normal') {
  if (enabled) {
    document.body.classList.remove('no-floating-boxes');
  } else {
    document.body.classList.add('no-floating-boxes');
  }

  if (intensity === 'dynamic') {
    document.body.classList.add('floating-dynamic');
  } else {
    document.body.classList.remove('floating-dynamic');
  }

  localStorage.setItem('cse_floating_boxes', enabled);
  localStorage.setItem('cse_floating_style', intensity);
}
window.applyFloatingBoxes = applyFloatingBoxes;

/**
 * 2D Floating Boxes & Quick Navigation HUD (Removed per User Request)
 */
function initFloatingBoxes() {
  const dock = document.getElementById('floatingHudDock');
  if (dock) dock.remove();
}

/**
 * Floating AI Companion Drawer (Gemini 3.5 Flash) on Home Page
 */
function initFloatingCompanionDrawer() {
  const trigger = document.getElementById('floatingCompanionTrigger');
  const drawer = document.getElementById('floatingCompanionDrawer');
  const closeBtn = document.getElementById('closeCompanionDrawerBtn');
  const feed = document.getElementById('drawerCompanionFeed');
  const input = document.getElementById('drawerCompanionInput');
  const sendBtn = document.getElementById('drawerCompanionSendBtn');

  if (!trigger || !drawer) return;

  let drawerCompanion = null;

  trigger.addEventListener('click', () => {
    const isHidden = drawer.style.display === 'none' || !drawer.style.display;
    if (isHidden) {
      drawer.style.display = 'flex';
      if (!drawerCompanion && window.CompanionEngine && window.CompanionEngine.GeminiCompanion) {
        drawerCompanion = new window.CompanionEngine.GeminiCompanion({
          messagesContainer: feed,
          inputEl: input,
          sendBtn: sendBtn
        });
      }
      if (input) input.focus();
    } else {
      drawer.style.display = 'none';
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      drawer.style.display = 'none';
    });
  }
}

// Main Initialization
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(window.PortfolioState.theme);
  applyScanlines(window.PortfolioState.scanlinesEnabled);
  
  // Custom Background Initialization (defaults to bg1.jpg)
  const savedBg = localStorage.getItem('cse_custom_bg') ?? 'assets/images/bg1.jpg';
  const savedBgOpacity = parseFloat(localStorage.getItem('cse_custom_bg_opacity') || '0.88');
  applyBackgroundImage(savedBg, savedBgOpacity);

  // Floating Boxes Initialization
  const floatingOn = localStorage.getItem('cse_floating_boxes') !== 'false';
  const floatingStyle = localStorage.getItem('cse_floating_style') || 'normal';
  applyFloatingBoxes(floatingOn, floatingStyle);

  initAudioToggle();
  initThemeMenu();
  initDotsMenu();
  initMobileNav();
  initTypewriter();
  initClock();
  initProjectFilters();
  initContactForm();
  initInteractiveTerminal();
  initModals();
  initAtmosphere(); // 2D Floating snow / embers / dust canvas engine
  initBgmPlayer(); // Genshin Impact BGM audio player
  initPersonalVault(); // Encrypted Personal Directory & Google Drive Filesystem
  initExpandedJukebox(); // Expanded Genshin BGM Jukebox Modal
  initFloatingBoxes(); // Interactive 2D Floating Boxes & HUD Navigation
  initFloatingCompanionDrawer(); // AI Companion (Gemini 3.5 Flash) Drawer on Home Page

  // Load Data
  await loadPortfolioData();

  // Audio click listener on vintage buttons
  document.querySelectorAll('.vintage-btn, .nav-item, .filter-btn, .avatar-pill, .cmd-pill').forEach(btn => {
    btn.addEventListener('click', () => vintageSound.playMechanicalClick());
  });
});

/**
 * Atmospheric 2D Snowfall & Weather Engine
 * Renders fluttering soft crystalline snowflakes, winter breezes, and particle physics
 */
function initAtmosphere() {
  let canvas = document.getElementById('vintageAtmosphereCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'vintageAtmosphereCanvas';
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Track mouse for interactive snowflake deflection
  let mouse = { x: -9999, y: -9999, radius: 120 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Snowfall mode: 'gentle' (85 flakes), 'blizzard' (190 flakes), 'off' (0 flakes)
  let snowfallMode = localStorage.getItem('cse_snowfall_mode') || 'gentle';
  let targetCount = snowfallMode === 'off' ? 0 : (snowfallMode === 'blizzard' ? 190 : 85);

  const flakes = [];

  function createFlake() {
    const radius = Math.random() * 3.8 + 1.2;
    const isCrystal = Math.random() > 0.65;
    const isSparkle = !isCrystal && Math.random() > 0.5;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: radius,
      speedY: (radius * 0.45) + (Math.random() * 0.8 + 0.6),
      flutter: Math.random() * 0.9 + 0.35,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.025 + 0.01,
      alpha: Math.random() * 0.45 + 0.5,
      type: isCrystal ? 'crystal' : (isSparkle ? 'sparkle' : 'circle'),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02
    };
  }

  function syncFlakeCount() {
    targetCount = snowfallMode === 'off' ? 0 : (snowfallMode === 'blizzard' ? 190 : 85);
    while (flakes.length < targetCount) {
      flakes.push(createFlake());
    }
    if (flakes.length > targetCount) {
      flakes.length = targetCount;
    }
    updateSnowfallUI();
  }

  syncFlakeCount();

  function updateSnowfallUI() {
    const heroBtn = document.getElementById('toggleSnowFloatingBtn');
    const heroText = document.getElementById('heroSnowText');
    const dockText = document.getElementById('snowStatusText');

    const labels = {
      gentle: { hero: '[SNOW: GENTLE ❄️]', dock: 'Snow: Gentle' },
      blizzard: { hero: '[SNOW: BLIZZARD 🌨️]', dock: 'Snow: Blizzard' },
      off: { hero: '[SNOW: OFF ⛅]', dock: 'Snow: Off' }
    };

    const current = labels[snowfallMode] || labels.gentle;
    if (heroText) heroText.textContent = current.hero;
    if (dockText) dockText.textContent = current.dock;
  }

  function cycleSnowfall() {
    if (snowfallMode === 'gentle') {
      snowfallMode = 'blizzard';
    } else if (snowfallMode === 'blizzard') {
      snowfallMode = 'off';
    } else {
      snowfallMode = 'gentle';
    }
    localStorage.setItem('cse_snowfall_mode', snowfallMode);
    syncFlakeCount();
    vintageSound.playMechanicalClick(1800, 0.03);
  }

  window.cycleSnowfallMode = cycleSnowfall;

  // Bind Snowfall toggle buttons
  const heroSnowBtn = document.getElementById('toggleSnowFloatingBtn');
  const dockSnowBtn = document.getElementById('dockSnowBtn');
  if (heroSnowBtn) heroSnowBtn.addEventListener('click', cycleSnowfall);
  if (dockSnowBtn) dockSnowBtn.addEventListener('click', cycleSnowfall);

  // Render Snowfall animation loop
  function renderSnow() {
    ctx.clearRect(0, 0, width, height);

    if (snowfallMode === 'off' || flakes.length === 0) {
      requestAnimationFrame(renderSnow);
      return;
    }

    const wind = snowfallMode === 'blizzard' ? 0.8 : 0.2;

    for (let i = 0; i < flakes.length; i++) {
      const p = flakes[i];

      p.wobble += p.wobbleSpeed;
      p.rotation += p.rotSpeed;
      p.x += Math.sin(p.wobble) * p.flutter + wind;
      p.y += p.speedY;

      // Mouse deflection physics - gentle breeze push
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        p.x -= (dx / dist) * force * 4.5;
        p.y -= (dy / dist) * force * 2.5;
      }

      // Wrap around bounds
      if (p.y > height + 15) {
        p.y = -15;
        p.x = Math.random() * width;
      }
      if (p.x < -15) p.x = width + 15;
      if (p.x > width + 15) p.x = -15;

      // Draw snowflake according to type
      if (p.type === 'crystal') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.lineWidth = 1.3;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        for (let a = 0; a < 3; a++) {
          ctx.rotate(Math.PI / 3);
          ctx.moveTo(-p.radius, 0);
          ctx.lineTo(p.radius, 0);
          // small branch
          ctx.moveTo(-p.radius * 0.5, -p.radius * 0.25);
          ctx.lineTo(-p.radius * 0.5, p.radius * 0.25);
          ctx.moveTo(p.radius * 0.5, -p.radius * 0.25);
          ctx.lineTo(p.radius * 0.5, p.radius * 0.25);
        }
        ctx.stroke();
        ctx.restore();
      } else if (p.type === 'sparkle') {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowBlur = 3;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.radius);
        ctx.lineTo(p.x + p.radius * 0.35, p.y);
        ctx.lineTo(p.x, p.y + p.radius);
        ctx.lineTo(p.x - p.radius * 0.35, p.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Soft round snowflake with feathered edges
        ctx.save();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
        grad.addColorStop(0.65, `rgba(240, 248, 255, ${p.alpha * 0.75})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    requestAnimationFrame(renderSnow);
  }

  requestAnimationFrame(renderSnow);

  window.setAtmosphereDensity = function(newCount) {
    newCount = parseInt(newCount, 10);
    if (isNaN(newCount) || newCount < 0) newCount = 85;
    targetCount = newCount;
    while (flakes.length < targetCount) {
      flakes.push(createFlake());
    }
    if (flakes.length > targetCount) {
      flakes.length = targetCount;
    }
  };
}

/**
 * Vintage Genshin Impact Style BGM Audio Player Engine
 * Headless background audio player without the floating box widget
 */
function initBgmPlayer() {
  const existingPlayer = document.getElementById('vintageMusicPlayer');
  if (existingPlayer) existingPlayer.remove();

  const defaultTracks = [
    {
      id: 'track-1',
      src: 'assets/audio/dawn_winery_acoustic.mp3',
      tag: '🍃 Mondstadt Winds',
      title: 'Dawn Winery Tavern (Acoustic)'
    },
    {
      id: 'track-2',
      src: 'assets/audio/genshin_bgm.mp3',
      tag: '🌙 Liyue Nightfall',
      title: 'Peaceful Piano Exploration'
    }
  ];

  let TRACKS = (window.PortfolioState.data?.settings?.audio?.tracks) || defaultTracks;

  let currentTrackIdx = parseInt(localStorage.getItem('cse_bgm_track') || '0', 10);
  if (isNaN(currentTrackIdx) || currentTrackIdx < 0 || currentTrackIdx >= TRACKS.length) {
    currentTrackIdx = 0;
  }

  let savedVolume = parseFloat(localStorage.getItem('cse_bgm_volume') || '0.35');
  if (isNaN(savedVolume) || savedVolume < 0 || savedVolume > 1) {
    savedVolume = 0.35;
  }

  // Create persistent audio element
  const audio = new Audio();
  audio.loop = true;
  audio.volume = savedVolume;
  audio.preload = 'auto';

  const listeners = [];
  function notifyListeners() {
    const state = {
      isPlaying: !audio.paused,
      currentTrackIdx,
      currentTrack: TRACKS[currentTrackIdx],
      volume: audio.volume,
      tracks: TRACKS
    };
    listeners.forEach(fn => {
      try { fn(state); } catch(e) {}
    });
  }

  function updateTrackDisplay() {
    if (!TRACKS[currentTrackIdx]) currentTrackIdx = 0;
    const track = TRACKS[currentTrackIdx];
    audio.src = track.src;
    notifyListeners();
  }

  function setPlayingState(isPlaying) {
    if (isPlaying) {
      localStorage.setItem('cse_bgm_playing', 'true');
    } else {
      localStorage.setItem('cse_bgm_playing', 'false');
    }
    notifyListeners();
  }

  async function playAudio() {
    try {
      if (!audio.src || !audio.src.includes(TRACKS[currentTrackIdx].src)) {
        audio.src = TRACKS[currentTrackIdx].src;
      }
      await audio.play();
      setPlayingState(true);
    } catch (err) {
      console.log('Autoplay deferred pending user interaction:', err);
      setPlayingState(false);
      const resumeOnGesture = () => {
        if (localStorage.getItem('cse_bgm_playing') === 'true') {
          audio.play().then(() => setPlayingState(true)).catch(() => {});
        }
        window.removeEventListener('click', resumeOnGesture);
        window.removeEventListener('keydown', resumeOnGesture);
      };
      window.addEventListener('click', resumeOnGesture);
      window.addEventListener('keydown', resumeOnGesture);
    }
  }

  function pauseAudio() {
    audio.pause();
    setPlayingState(false);
  }

  function togglePlay() {
    if (audio.paused) {
      localStorage.setItem('cse_bgm_playing', 'true');
      playAudio();
    } else {
      pauseAudio();
    }
  }

  function switchTrack() {
    currentTrackIdx = (currentTrackIdx + 1) % TRACKS.length;
    localStorage.setItem('cse_bgm_track', currentTrackIdx);
    const wasPlaying = !audio.paused || localStorage.getItem('cse_bgm_playing') === 'true';
    updateTrackDisplay();
    if (wasPlaying) {
      playAudio();
    }
  }

  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  });

  // Expose Global BgmPlayer API for Admin Panel & Controls
  window.BgmPlayer = {
    play: playAudio,
    pause: pauseAudio,
    toggle: togglePlay,
    nextTrack: switchTrack,
    prevTrack: () => {
      currentTrackIdx = (currentTrackIdx - 1 + TRACKS.length) % TRACKS.length;
      localStorage.setItem('cse_bgm_track', currentTrackIdx);
      const wasPlaying = !audio.paused || localStorage.getItem('cse_bgm_playing') === 'true';
      updateTrackDisplay();
      if (wasPlaying) playAudio();
      notifyListeners();
    },
    setTrack: (idx) => {
      if (idx >= 0 && idx < TRACKS.length) {
        currentTrackIdx = idx;
        localStorage.setItem('cse_bgm_track', currentTrackIdx);
        const wasPlaying = !audio.paused || localStorage.getItem('cse_bgm_playing') === 'true';
        updateTrackDisplay();
        if (wasPlaying) playAudio();
        notifyListeners();
      }
    },
    setVolume: (val) => {
      audio.volume = Math.max(0, Math.min(1, val));
      localStorage.setItem('cse_bgm_volume', audio.volume);
      notifyListeners();
    },
    getVolume: () => audio.volume,
    getTracks: () => TRACKS,
    addTrack: (trackObj) => {
      TRACKS.push(trackObj);
      notifyListeners();
    },
    removeTrack: (idx) => {
      if (TRACKS.length > 1 && idx >= 0 && idx < TRACKS.length) {
        TRACKS.splice(idx, 1);
        if (currentTrackIdx >= TRACKS.length) currentTrackIdx = 0;
        updateTrackDisplay();
        notifyListeners();
      }
    },
    getState: () => ({
      isPlaying: !audio.paused,
      currentTrackIdx,
      currentTrack: TRACKS[currentTrackIdx],
      volume: audio.volume,
      tracks: TRACKS
    }),
    addListener: (cb) => {
      listeners.push(cb);
      try {
        cb({
          isPlaying: !audio.paused,
          currentTrackIdx,
          currentTrack: TRACKS[currentTrackIdx],
          volume: audio.volume,
          tracks: TRACKS
        });
      } catch (e) {}
    }
  };

  updateTrackDisplay();

  // ── AUTO-PLAY on every visit ──────────────────────────────────────────────
  // Browsers require a user gesture before audio can play. Strategy:
  //   1. Try to play immediately (works if the browser permits it, e.g. user
  //      has previously interacted with the site or browser policy allows it).
  //   2. If blocked, register a one-time listener on the first real user
  //      interaction (click, touch, or key) and auto-play at that moment.
  // This means audio starts AUTOMATICALLY without the user needing to press
  // any play button — it fires as soon as the browser lets it.

  // Always mark as "should play" so it auto-resumes on page navigation too
  localStorage.setItem('cse_bgm_playing', 'true');

  const GESTURE_EVENTS = ['click', 'pointerdown', 'touchstart', 'touchend', 'keydown'];

  function removeGestureListeners() {
    GESTURE_EVENTS.forEach(ev => {
      window.removeEventListener(ev, onUserGesture, true);
      document.removeEventListener(ev, onUserGesture, true);
    });
    const prompt = document.getElementById('audioAutoplayPrompt');
    if (prompt) {
      prompt.style.opacity = '0';
      prompt.style.transform = 'translateY(10px)';
      setTimeout(() => prompt.remove(), 400);
    }
  }

  function playWithHandling() {
    if (!audio.paused) {
      removeGestureListeners();
      return;
    }

    try {
      if (vintageSound && vintageSound.ctx && vintageSound.ctx.state === 'suspended') {
        vintageSound.ctx.resume().catch(() => {});
      }
    } catch(e) {}

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setPlayingState(true);
        removeGestureListeners();
      }).catch(err => {
        // Autoplay blocked by browser policy — keep listeners active for first gesture
        showAutoplayHint();
      });
    }
  }

  function onUserGesture() {
    playWithHandling();
  }

  function showAutoplayHint() {
    if (document.getElementById('audioAutoplayPrompt') || !audio.paused) return;
    const prompt = document.createElement('div');
    prompt.id = 'audioAutoplayPrompt';
    prompt.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-surface);
      border: 2px solid var(--accent-rust);
      box-shadow: var(--shadow-tactile);
      padding: 8px 18px;
      border-radius: var(--radius-badge);
      font-family: var(--font-mono);
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--accent-rust);
      z-index: 9999;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      animation: promptPulse 2s infinite ease-in-out;
    `;
    prompt.innerHTML = `<span>🎵</span> Click anywhere to start ambient BGM`;
    prompt.addEventListener('click', () => playWithHandling());
    document.body.appendChild(prompt);
  }

  // Try immediately on script execution
  playWithHandling();

  // Attach to user gesture events without 'once' so it stays active until it actually succeeds
  GESTURE_EVENTS.forEach(ev => {
    window.addEventListener(ev, onUserGesture, { capture: true, passive: true });
    document.addEventListener(ev, onUserGesture, { capture: true, passive: true });
  });
}

/**
 * Load Portfolio Data from REST API with LocalStorage sync
 */
async function loadPortfolioData() {
  let loadedData = null;
  
  // Try API first, fallback to static JSON
  try {
    let res = await fetch('/api/portfolio');
    if (!res.ok) {
      res = await fetch('data/portfolio.json');
    }
    if (res.ok) {
      loadedData = await res.json();
      localStorage.setItem('cse_portfolio_data', JSON.stringify(loadedData));
    }
  } catch (err) {
    try {
      const staticRes = await fetch('data/portfolio.json');
      if (staticRes.ok) {
        loadedData = await staticRes.json();
        localStorage.setItem('cse_portfolio_data', JSON.stringify(loadedData));
      }
    } catch(e) {}
  }

  // Fallback to localStorage or Default
  if (!loadedData || Object.keys(loadedData).length === 0) {
    const cached = localStorage.getItem('cse_portfolio_data');
    if (cached) {
      try { loadedData = JSON.parse(cached); } catch(e){}
    }
  }

  if (!loadedData || Object.keys(loadedData).length === 0) {
    loadedData = DEFAULT_FALLBACK_PORTFOLIO;
  }

  window.PortfolioState.data = loadedData;
  renderPortfolio();

  // Also notify admin panel if open
  if (window.AdminPanel && typeof window.AdminPanel.syncData === 'function') {
    window.AdminPanel.syncData(loadedData);
  }
}

/**
 * Render all public sections using loaded state
 */
function renderPortfolio() {
  const data = window.PortfolioState.data;
  if (!data || !data.profile) return;

  const prof = data.profile;

  // Header Brand & Status
  const headerBrand = document.getElementById('headerBrand');
  if (headerBrand) headerBrand.textContent = `CSE://${(prof.name || 'DEVELOPER').toUpperCase().replace(/\s+/g, '_')}`;

  const headerStatus = document.getElementById('headerStatus');
  if (headerStatus) headerStatus.textContent = prof.status || 'AVAILABLE FOR HIRE';

  // Hero Section
  const heroName = document.getElementById('heroName');
  if (heroName) heroName.textContent = prof.name || 'Mir A K Sajid';

  const heroBio = document.getElementById('heroBio');
  if (heroBio) heroBio.textContent = prof.bio;

  const heroAvatarImg = document.getElementById('heroAvatarImg');
  if (heroAvatarImg) {
    if (prof.avatar && prof.avatar.trim() !== '') {
      heroAvatarImg.src = prof.avatar;
      heroAvatarImg.style.display = 'block';
    } else {
      heroAvatarImg.src = 'assets/images/avatar-notionist.png';
    }
  }

  const polaroidDegree = document.getElementById('polaroidDegree');
  if (polaroidDegree) polaroidDegree.textContent = prof.degree || 'B.S. Computer Science & Eng.';

  const polaroidGpa = document.getElementById('polaroidGpa');
  if (polaroidGpa) polaroidGpa.textContent = prof.gpa ? `GPA: ${prof.gpa}` : 'Computer Science Focus';

  const resumeBtn = document.getElementById('resumeDownloadBtn');
  if (resumeBtn && prof.resumeUrl) resumeBtn.href = prof.resumeUrl;

  // Stats Bar
  const statsBar = document.getElementById('heroStatsBar');
  if (statsBar && prof.stats) {
    statsBar.innerHTML = prof.stats.map(s => `
      <div class="stat-box">
        <div class="stat-val">${escapeHtml(s.value)}</div>
        <div class="stat-lbl">${escapeHtml(s.label)}</div>
      </div>
    `).join('');
  }

  // Social Links
  const socialContainer = document.getElementById('heroSocialLinks');
  if (socialContainer) {
    const links = [];
    if (prof.github) links.push(`<a href="${prof.github}" target="_blank" rel="noopener" class="social-pill">🐙 GitHub</a>`);
    if (prof.leetcode) links.push(`<a href="${prof.leetcode}" target="_blank" rel="noopener" class="social-pill">⚡ LeetCode</a>`);
    if (prof.linkedin) links.push(`<a href="${prof.linkedin}" target="_blank" rel="noopener" class="social-pill">💼 LinkedIn</a>`);
    if (prof.codeforces) links.push(`<a href="${prof.codeforces}" target="_blank" rel="noopener" class="social-pill">🏆 Codeforces</a>`);
    if (prof.email) links.push(`<a href="mailto:${prof.email}" class="social-pill">✉ Email</a>`);
    socialContainer.innerHTML = links.join('');
  }

  // Contact Info Section
  const contactEmailLink = document.getElementById('contactEmailLink');
  if (contactEmailLink && prof.email) {
    contactEmailLink.textContent = prof.email;
    contactEmailLink.href = `mailto:${prof.email}`;
  }
  const contactLocation = document.getElementById('contactLocation');
  if (contactLocation && prof.location) contactLocation.textContent = prof.location;

  const contactStatusText = document.getElementById('contactStatusText');
  if (contactStatusText && prof.status) contactStatusText.textContent = prof.status;

  const contactGithubLink = document.getElementById('contactGithubLink');
  if (contactGithubLink && prof.github) {
    contactGithubLink.href = prof.github;
    contactGithubLink.textContent = prof.github.replace('https://', '');
  }

  // Studio & FX Settings
  const settings = data.settings || {};

  // Background Artwork
  const currentBg = settings.backgroundImage !== undefined ? settings.backgroundImage : (localStorage.getItem('cse_custom_bg') ?? 'assets/images/bg1.jpg');
  const currentBgOpacity = settings.backgroundOpacity !== undefined ? settings.backgroundOpacity : parseFloat(localStorage.getItem('cse_custom_bg_opacity') || '0.88');
  applyBackgroundImage(currentBg, currentBgOpacity);

  if (typeof settings.floatingBoxes === 'boolean') {
    applyFloatingBoxes(settings.floatingBoxes, settings.floatingIntensity || 'normal');
  }
  if (settings.particleDensity && typeof window.setAtmosphereDensity === 'function') {
    window.setAtmosphereDensity(settings.particleDensity);
  }

  // Marquee Ticker Tape customization
  if (settings.tickerText) {
    document.querySelectorAll('.ticker-track').forEach(track => {
      const items = settings.tickerText.split('•').map(t => t.trim()).filter(Boolean);
      if (items.length > 0) {
        const doubled = [...items, ...items];
        track.innerHTML = doubled.map((txt, idx) => `
          <span class="ticker-item"><span class="ticker-dot">${idx % 2 === 0 ? '⚡' : '●'}</span> ${escapeHtml(txt)}</span>
        `).join('');
      }
    });
  }

  // Footer Branding
  const footerBrand = document.getElementById('footerBrand');
  if (footerBrand) {
    footerBrand.textContent = settings.footerAuthor || `${prof.name || 'Mir A K Sajid'} • ${prof.role || 'Computer Science & Engineering Student'}`;
  }

  document.querySelectorAll('.footer-copy').forEach(el => {
    el.textContent = settings.footerText || 'Made on Scarface Lab';
  });

  // Render Sub-components
  renderProjects();
  renderSkills();
  renderAcademics();
  renderExperience();
  setupAvatarPicker();
}

/**
 * Render Projects with filtering
 */
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || !window.PortfolioState.data) return;

  const projects = window.PortfolioState.data.projects || [];
  const filter = window.PortfolioState.activeFilter;

  const filtered = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state parchment-paper">No blueprints cataloged under "${escapeHtml(filter)}".</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <article class="project-card" data-id="${p.id}">
      <div class="project-card-header">
        <span class="proj-cat-stamp">${escapeHtml(p.category || 'PROJECT')}</span>
        <span class="proj-year-badge">${escapeHtml(p.year || '2025')}</span>
      </div>
      <div class="project-media-wrap">
        <img src="${p.image || 'assets/images/project-circuits.jpg'}" alt="${escapeHtml(p.title)}" class="project-thumb" loading="lazy">
        ${p.badge ? `<span class="proj-metric-badge">${escapeHtml(p.badge)}</span>` : ''}
      </div>
      <div class="project-body">
        <h3 class="project-title">${escapeHtml(p.title)}</h3>
        <div class="project-tagline">${escapeHtml(p.tagline || '')}</div>
        <p class="project-desc">${escapeHtml(p.description)}</p>
        <div class="project-tech-tags">
          ${(p.techStack || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <div class="project-card-footer">
        <button class="vintage-btn btn-sm btn-outline open-case-study" data-project-id="${p.id}">
          <span>🔍</span> Blueprint Spec
        </button>
        <div class="proj-links-cluster">
          ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener" class="proj-link" title="Source Code">🐙 Git</a>` : ''}
          ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener" class="proj-link" title="Live Preview">❖ Demo</a>` : ''}
        </div>
      </div>
    </article>
  `).join('');

  // Attach click to modal inspector
  grid.querySelectorAll('.open-case-study').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const projId = btn.getAttribute('data-project-id');
      openProjectModal(projId);
    });
  });
}

/**
 * Render Categorized Skills with animated ink gauges
 */
function renderSkills() {
  const container = document.getElementById('skillsCategoriesGrid');
  if (!container || !window.PortfolioState.data) return;

  const skills = window.PortfolioState.data.skills || [];
  
  // Group by category
  const categories = {};
  skills.forEach(s => {
    const cat = s.category || 'General CS';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(s);
  });

  const catNames = Object.keys(categories);
  if (catNames.length === 0) {
    container.innerHTML = `<div class="empty-state">No technical competencies registered.</div>`;
    return;
  }

  container.innerHTML = catNames.map(cat => `
    <div class="skill-category-card">
      <div class="skill-category-header">
        <h3 class="cat-title">${escapeHtml(cat)}</h3>
        <span class="cat-stamp">${categories[cat].length} UNITS</span>
      </div>
      <div class="skills-list">
        ${categories[cat].map(skill => `
          <div class="skill-row">
            <div class="skill-header">
              <span class="skill-name-wrap">
                ${renderSkillIcon(skill.icon)}
                <span>${escapeHtml(skill.name)}</span>
              </span>
              <span class="skill-pct">${skill.level}%</span>
            </div>
            <div class="ink-meter">
              <div class="ink-fill" style="width: ${skill.level}%;"></div>
            </div>
            ${skill.desc ? `<div class="skill-subdesc">${escapeHtml(skill.desc)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderSkillIcon(iconKey) {
  const safeIcons = ['cplusplus', 'c', 'python', 'rust', 'linux', 'git', 'docker', 'postgresql', 'javascript', 'react', 'java'];
  if (safeIcons.includes(iconKey)) {
    return `<img src="assets/icons/${iconKey}.svg" alt="${iconKey}" class="skill-icon-img" onerror="this.style.display='none'">`;
  }
  return `<span>⚡</span>`;
}

/**
 * Render Academics & Coursework
 */
function renderAcademics() {
  const container = document.getElementById('academicsContainer');
  if (!container || !window.PortfolioState.data) return;

  const educationList = window.PortfolioState.data.education || [];
  if (educationList.length === 0) return;

  container.innerHTML = educationList.map(edu => `
    <div class="academics-card">
      <div class="edu-header">
        <div>
          <h3 class="edu-degree">${escapeHtml(edu.degree)}</h3>
          <div class="edu-institution">${escapeHtml(edu.institution)}</div>
        </div>
        <div class="edu-meta">
          <div class="edu-period">${escapeHtml(edu.period)}</div>
          <div class="edu-gpa">${escapeHtml(edu.score)}</div>
        </div>
      </div>
      ${edu.highlights ? `<p class="edu-highlights"><strong>Honors & Society:</strong> ${escapeHtml(edu.highlights)}</p>` : ''}
      <h4 style="font-family: var(--font-mono); font-size: 0.85rem; margin-top: 1rem; color: var(--accent-rust);">CORE UNDERGRADUATE COURSEWORK:</h4>
      <div class="coursework-grid">
        ${(edu.coursework || []).map(c => `<div class="course-item">${escapeHtml(c)}</div>`).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * Render Experience & Internships Timeline
 */
function renderExperience() {
  const container = document.getElementById('timelineContainer');
  if (!container || !window.PortfolioState.data) return;

  const expList = window.PortfolioState.data.experience || [];
  if (expList.length === 0) return;

  container.innerHTML = expList.map(exp => `
    <div class="timeline-entry">
      <div class="timeline-ticket">
        <div class="ticket-header-row">
          <div>
            <h3 class="exp-role-title">${escapeHtml(exp.role)}</h3>
            <span class="exp-company-name">@ ${escapeHtml(exp.company)}</span>
          </div>
          <span class="exp-period-badge">${escapeHtml(exp.period)}</span>
        </div>
        <p class="exp-desc">${escapeHtml(exp.description)}</p>
        <div class="exp-badges-list">
          ${(exp.badges || []).map(b => `<span class="exp-tag">${escapeHtml(b)}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Filter Tabs Logic
 */
function initProjectFilters() {
  const bar = document.getElementById('projectFilterBar');
  if (!bar) return;

  bar.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      window.PortfolioState.activeFilter = e.target.getAttribute('data-filter');
      renderProjects();
    }
  });
}

/**
 * Project Blueprint Modal Viewer
 */
function openProjectModal(projectId) {
  const data = window.PortfolioState.data;
  if (!data || !data.projects) return;

  const proj = data.projects.find(p => p.id === projectId);
  if (!proj) return;

  const modal = document.getElementById('projectModal');
  document.getElementById('modalProjectTitle').textContent = proj.title;
  document.getElementById('modalProjectCategory').textContent = `${proj.category} • ${proj.year || '2025'}`;
  document.getElementById('modalProjectTagline').textContent = proj.tagline || 'System Architecture Blueprint';
  document.getElementById('modalProjectDescription').textContent = proj.description;
  document.getElementById('modalProjectImage').src = proj.image || 'assets/images/project-circuits.jpg';
  document.getElementById('modalProjectBadge').textContent = proj.badge || 'Verified';

  const techContainer = document.getElementById('modalProjectTech');
  techContainer.innerHTML = (proj.techStack || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');

  const gitLink = document.getElementById('modalGithubLink');
  if (proj.github) {
    gitLink.href = proj.github;
    gitLink.style.display = 'inline-flex';
  } else {
    gitLink.style.display = 'none';
  }

  const demoLink = document.getElementById('modalDemoLink');
  if (proj.demo) {
    demoLink.href = proj.demo;
    demoLink.style.display = 'inline-flex';
  } else {
    demoLink.style.display = 'none';
  }

  modal.classList.add('active');
}

function initModals() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('closeProjectModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

/**
 * Avatar Switcher
 */
function setupAvatarPicker() {
  document.querySelectorAll('.avatar-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.avatar-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const avatarSrc = pill.getAttribute('data-avatar');
      const heroImg = document.getElementById('heroAvatarImg');
      if (heroImg && avatarSrc) {
        heroImg.src = avatarSrc;
      }
    });
  });
}

/**
 * Typewriter Rotating Console
 */
function initTypewriter() {
  const element = document.getElementById('typewriterText');
  if (!element) return;

  const phrases = [
    "Building Optimizing Bytecode Compilers & Virtual Machines",
    "Writing Bare-Metal 32-bit x86 OS Microkernel & Drivers",
    "Engineering Distributed Raft-Consensus Key-Value Stores",
    "Solving Graph & Dynamic Programming Challenges (500+ LeetCode)",
    "Shipping High-Fidelity, Bloat-Free Software Systems"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 60;

  function typeStep() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      element.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 30;
    } else {
      element.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 65;
    }

    if (!isDeleting && charIndex === current.length) {
      typingSpeed = 2200; // Pause at end of line
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 400;
    }

    setTimeout(typeStep, typingSpeed);
  }

  setTimeout(typeStep, 600);
}

/**
 * Interactive POSIX Linux Terminal & Shell Engine
 */
function initInteractiveTerminal() {
  const input = document.getElementById('terminalInput');
  const output = document.getElementById('terminalOutput');
  const jumpBtn = document.getElementById('heroTerminalJumpBtn');

  if (jumpBtn) {
    jumpBtn.addEventListener('click', () => {
      const termSec = document.getElementById('terminal-section') || document.querySelector('.terminal-chassis');
      if (termSec) termSec.scrollIntoView({ behavior: 'smooth' });
      if (input) input.focus();
    });
  }

  if (!input || !output) return;

  // If LinuxTerminalEngine is available, boot full Linux VM
  if (window.LinuxTerminalEngine && window.LinuxTerminalEngine.LinuxTerminalVM) {
    window.activeTerminalVM = new window.LinuxTerminalEngine.LinuxTerminalVM({
      inputEl: input,
      outputEl: output,
      promptEl: document.querySelector('.term-prompt'),
      screenEl: document.getElementById('terminalScreen')
    });
    return;
  }

  // Fallback: dynamically load terminal-engine.js if not yet present
  const scriptTag = document.createElement('script');
  scriptTag.src = 'terminal-engine.js';
  scriptTag.onload = () => {
    if (window.LinuxTerminalEngine && window.LinuxTerminalEngine.LinuxTerminalVM) {
      window.activeTerminalVM = new window.LinuxTerminalEngine.LinuxTerminalVM({
        inputEl: input,
        outputEl: output,
        promptEl: document.querySelector('.term-prompt'),
        screenEl: document.getElementById('terminalScreen')
      });
    }
  };
  document.head.appendChild(scriptTag);
}

/**
 * Contact Form Dispatch Submission
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('dispatchStatus');
  const submitBtn = document.getElementById('sendDispatchBtn');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    if (submitBtn) submitBtn.disabled = true;
    status.textContent = 'Transmitting telegram across circuits...';
    status.className = 'dispatch-status';

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        vintageSound.playBell();
        status.textContent = '✔ Telegram delivered directly to Station Master Desk!';
        status.className = 'dispatch-status success';
        form.reset();
        updateUnreadBadgeCount();
      } else if (res.status === 429) {
        status.textContent = `⚠️ Rate limit: ${data.error || 'Too many transmissions. Please wait 10 minutes.'}`;
        status.className = 'dispatch-status error';
      } else if (res.status === 400) {
        status.textContent = `❌ ${data.error || 'Please correct your dispatch details.'}`;
        status.className = 'dispatch-status error';
      } else {
        throw new Error(data.error || 'API dispatch failed');
      }
    } catch (err) {
      // Offline fallback: save to localStorage if network failed
      const localMsgs = JSON.parse(localStorage.getItem('cse_local_messages') || '[]');
      localMsgs.unshift({
        id: 'msg-' + Date.now(),
        ...payload,
        date: new Date().toISOString(),
        read: false,
        starred: false
      });
      localStorage.setItem('cse_local_messages', JSON.stringify(localMsgs));
      
      vintageSound.playBell();
      status.textContent = '✔ Telegram recorded locally in Admin Offline Registry!';
      status.className = 'dispatch-status success';
      form.reset();
      updateUnreadBadgeCount();
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

/**
 * Theme & Audio Management
 */
function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  window.PortfolioState.theme = themeName;
  localStorage.setItem('cse_vintage_theme', themeName);

  const displayMap = {
    'vintage-parchment': 'Quantum Dark',
    'cyber-deck': 'Cyberdeck Neon',
    'blueprint-cyan': 'Blueprint Cyan',
    'terminal-phosphor': 'CRT Green',
    'amber-crt': 'Amber Plasma',
    'solarized-dark': 'Solarized Dark'
  };
  const label = document.getElementById('themeActiveName');
  if (label) label.textContent = displayMap[themeName] || 'Parchment';

  document.querySelectorAll('.theme-option').forEach(opt => {
    if (opt.getAttribute('data-theme-val') === themeName) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
}

function applyScanlines(enabled) {
  window.PortfolioState.scanlinesEnabled = enabled;
  localStorage.setItem('cse_scanlines', enabled);
  if (enabled) {
    document.body.classList.remove('no-scanlines');
  } else {
    document.body.classList.add('no-scanlines');
  }
}

function initThemeMenu() {
  const btn = document.getElementById('themeDropdownBtn');
  const menu = document.getElementById('themeMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    menu.classList.remove('show');
  });

  menu.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const themeVal = opt.getAttribute('data-theme-val');
      applyTheme(themeVal);
      menu.classList.remove('show');
    });
  });
}

function initDotsMenu() {
  const btn = document.getElementById('dotsMenuBtn');
  const menu = document.getElementById('dotsMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('show');
    // Close theme menu if open
    const themeMenu = document.getElementById('themeMenu');
    if (themeMenu) themeMenu.classList.remove('show');
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.classList.remove('show');
    }
  });
}

function initAudioToggle() {
  const btn = document.getElementById('audioToggleBtn');
  const icon = document.getElementById('audioIcon');
  if (!btn || !icon) return;

  updateIcon();

  btn.addEventListener('click', () => {
    window.PortfolioState.audioEnabled = !window.PortfolioState.audioEnabled;
    localStorage.setItem('cse_audio_fx', window.PortfolioState.audioEnabled);
    updateIcon();
    if (window.PortfolioState.audioEnabled) vintageSound.playMechanicalClick();
  });

  function updateIcon() {
    icon.textContent = window.PortfolioState.audioEnabled ? '🔊' : '🔇';
  }
}

function initMobileNav() {
  const toggle = document.getElementById('mobileMenuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

function initClock() {
  const clockEl = document.getElementById('telemTime');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    clockEl.textContent = now.toTimeString().split(' ')[0];
  }
  update();
  setInterval(update, 1000);
}

async function updateUnreadBadgeCount() {
  const badge = document.getElementById('unreadBadge');
  if (!badge) return;
  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      const msgs = await res.json();
      const unread = msgs.filter(m => !m.read).length;
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'inline-block' : 'none';
      return;
    }
  } catch (e) {}

  const localMsgs = JSON.parse(localStorage.getItem('cse_local_messages') || '[]');
  const unread = localMsgs.filter(m => !m.read).length;
  badge.textContent = unread;
  badge.style.display = unread > 0 ? 'inline-block' : 'none';
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Global expose
window.renderPortfolio = renderPortfolio;
window.loadPortfolioData = loadPortfolioData;
window.applyTheme = applyTheme;
window.applyScanlines = applyScanlines;

/**
 * Expanded Genshin BGM Jukebox Modal Controller
 */
function initExpandedJukebox() {
  const modal = document.getElementById('expandedMusicModal');
  const closeBtn = document.getElementById('closeExpandedMusicModalBtn');
  const floatingBtn = document.getElementById('openMusicBoxFloatingBtn');
  const tileBtn = document.getElementById('openMusicTileBtn');
  const heroPlayBtn = document.getElementById('jukeboxPlayBtn');
  const heroPrevBtn = document.getElementById('jukeboxPrevBtn');
  const heroNextBtn = document.getElementById('jukeboxNextBtn');
  const heroVolumeSlider = document.getElementById('jukeboxVolumeSlider');
  const heroVolumeVal = document.getElementById('jukeboxVolumeVal');
  const tableBody = document.getElementById('jukeboxTrackTableBody');

  if (!modal) return;

  function openJukebox() {
    modal.classList.add('active');
    updateJukeboxView();
  }
  window.openExpandedMusicJukebox = openJukebox;

  function closeJukebox() {
    modal.classList.remove('active');
  }

  const dockMusicBtn = document.getElementById('dockMusicBtn');
  if (floatingBtn) floatingBtn.addEventListener('click', openJukebox);
  if (tileBtn) tileBtn.addEventListener('click', openJukebox);
  if (dockMusicBtn) dockMusicBtn.addEventListener('click', openJukebox);
  if (closeBtn) closeBtn.addEventListener('click', closeJukebox);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeJukebox();
  });

  if (window.location.hash === '#open-music') {
    setTimeout(openJukebox, 400);
  }

  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => {
      if (window.BgmPlayer) window.BgmPlayer.toggle();
    });
  }
  if (heroPrevBtn) {
    heroPrevBtn.addEventListener('click', () => {
      if (window.BgmPlayer) window.BgmPlayer.prevTrack();
    });
  }
  if (heroNextBtn) {
    heroNextBtn.addEventListener('click', () => {
      if (window.BgmPlayer) window.BgmPlayer.nextTrack();
    });
  }
  if (heroVolumeSlider) {
    heroVolumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (window.BgmPlayer) window.BgmPlayer.setVolume(val);
      if (heroVolumeVal) heroVolumeVal.textContent = `${Math.round(val * 100)}%`;
    });
  }

  function updateJukeboxView() {
    if (!window.BgmPlayer) return;
    const state = window.BgmPlayer.getState();
    const currentTrack = state.currentTrack || { title: 'Dawn Winery Tavern (Acoustic)', tag: '🍃 Mondstadt Winds' };

    const titleEl = document.getElementById('jukeboxCurrentTitle');
    const tagEl = document.getElementById('jukeboxLiveTag');
    const liveDot = document.getElementById('jukeboxLiveDot');
    const discSpin = document.getElementById('jukeboxDiscSpin');

    if (titleEl) titleEl.textContent = currentTrack.title;
    if (tagEl) tagEl.textContent = currentTrack.tag;
    if (heroPlayBtn) heroPlayBtn.textContent = state.isPlaying ? '❚❚ Pause' : '▶ Play';

    if (liveDot) {
      if (state.isPlaying) {
        liveDot.style.background = 'var(--accent-patina)';
        liveDot.style.boxShadow = '0 0 8px var(--accent-patina)';
      } else {
        liveDot.style.background = 'var(--ink-muted)';
        liveDot.style.boxShadow = 'none';
      }
    }

    if (discSpin) {
      discSpin.style.display = 'inline-block';
      discSpin.style.animation = state.isPlaying ? 'spinDisc 2.5s linear infinite' : 'none';
    }

    if (heroVolumeSlider) {
      heroVolumeSlider.value = state.volume;
      if (heroVolumeVal) heroVolumeVal.textContent = `${Math.round(state.volume * 100)}%`;
    }

    // Render Track Table
    if (tableBody) {
      tableBody.innerHTML = state.tracks.map((t, idx) => {
        const isCurrent = idx === state.currentTrackIdx;
        const isPlayingThis = isCurrent && state.isPlaying;
        return `
          <tr class="track-row ${isCurrent ? 'active-track' : ''}" data-idx="${idx}" style="cursor: pointer; ${isCurrent ? 'background: var(--bg-hover);' : ''}">
            <td style="text-align: center; font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: ${isCurrent ? 'var(--accent-rust)' : 'var(--ink-secondary)'};">
              ${isPlayingThis ? '▶' : (idx + 1).toString().padStart(2, '0')}
            </td>
            <td>
              <div style="font-weight: ${isCurrent ? '700' : '500'}; color: ${isCurrent ? 'var(--accent-rust)' : 'inherit'};">
                ${escapeHtml(t.title)}
                ${isCurrent ? ' <span style="font-size: 0.72rem; padding: 2px 6px; background: var(--accent-rust); color: #fff; border-radius: 3px; margin-left: 4px;">CURRENT</span>' : ''}
              </div>
            </td>
            <td>
              <span class="tech-tag" style="font-size: 0.75rem;">${escapeHtml(t.tag)}</span>
            </td>
            <td style="text-align: right;">
              <button type="button" class="vintage-btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-outline'} jukebox-play-row-btn" data-idx="${idx}">
                ${isPlayingThis ? '❚❚ Pause' : '▶ Play'}
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tableBody.querySelectorAll('.track-row').forEach(row => {
        row.addEventListener('click', () => {
          const idx = parseInt(row.getAttribute('data-idx'), 10);
          if (idx === state.currentTrackIdx) {
            window.BgmPlayer.toggle();
          } else {
            window.BgmPlayer.setTrack(idx);
          }
        });
      });

      tableBody.querySelectorAll('.jukebox-play-row-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (idx === state.currentTrackIdx) {
            window.BgmPlayer.toggle();
          } else {
            window.BgmPlayer.setTrack(idx);
          }
        });
      });
    }
  }

  // Subscribe to BGM player state broadcast
  if (window.BgmPlayer && typeof window.BgmPlayer.addListener === 'function') {
    window.BgmPlayer.addListener(updateJukeboxView);
  }
}

/**
 * Personal Directory Vault & Google Drive Filesystem Controller
 */
function initPersonalVault() {
  const pwdModal = document.getElementById('vaultPasswordModal');
  const dirModal = document.getElementById('personalDirectoryModal');
  const closePwdBtn = document.getElementById('closeVaultPasswordModalBtn');
  const closeDirBtn = document.getElementById('closePersonalDirectoryModalBtn');
  const floatingBtn = document.getElementById('openVaultFloatingBtn');
  const tileBtn = document.getElementById('openVaultTileBtn');
  const lockBtn = document.getElementById('lockVaultBtn');
  const pwdForm = document.getElementById('vaultPasswordForm');
  const pwdInput = document.getElementById('vaultPasswordInput');
  const pwdFeedback = document.getElementById('vaultPasswordFeedback');

  const addDrawer = document.getElementById('vaultAddFileDrawer');
  const toggleAddBtn = document.getElementById('toggleAddDriveFileBtn');
  const cancelAddBtn = document.getElementById('cancelAddDriveFileBtn');
  const addForm = document.getElementById('vaultAddFileForm');

  const searchInput = document.getElementById('vaultSearchInput');
  const folderChipsContainer = document.getElementById('vaultFolderFilterChips');
  const tableBody = document.getElementById('vaultFileTableBody');
  const statsDisplay = document.getElementById('vaultStatsDisplay');
  const folderDataList = document.getElementById('driveFolderList');

  let activeVaultFolder = 'ALL';
  let searchQuery = '';

  function isUnlocked() {
    return sessionStorage.getItem('cse_vault_unlocked') === 'true';
  }

  function openVault() {
    if (isUnlocked()) {
      openDirectory();
    } else {
      if (pwdModal) {
        pwdModal.classList.add('active');
        if (pwdFeedback) {
          pwdFeedback.textContent = '';
        }
        if (pwdInput) {
          pwdInput.value = '';
          pwdInput.focus();
        }
      }
    }
  }

  function openDirectory() {
    if (pwdModal) pwdModal.classList.remove('active');
    if (dirModal) {
      dirModal.classList.add('active');
      renderVault();
    }
  }

  function closeVault() {
    if (pwdModal) pwdModal.classList.remove('active');
    if (dirModal) dirModal.classList.remove('active');
  }

  function relockVault() {
    sessionStorage.removeItem('cse_vault_unlocked');
    closeVault();
    vintageSound.playMechanicalClick(900);
    alert('🔒 Personal Directory has been locked securely.');
  }

  const dockVaultBtn = document.getElementById('dockVaultBtn');
  if (floatingBtn) floatingBtn.addEventListener('click', openVault);
  if (tileBtn) tileBtn.addEventListener('click', openVault);
  if (dockVaultBtn) dockVaultBtn.addEventListener('click', openVault);
  if (closePwdBtn) closePwdBtn.addEventListener('click', closeVault);
  if (closeDirBtn) closeDirBtn.addEventListener('click', closeVault);
  if (lockBtn) lockBtn.addEventListener('click', relockVault);

  if (window.location.hash === '#open-vault') {
    setTimeout(openVault, 400);
  }

  if (pwdModal) {
    pwdModal.addEventListener('click', (e) => {
      if (e.target === pwdModal) closeVault();
    });
  }
  if (dirModal) {
    dirModal.addEventListener('click', (e) => {
      if (e.target === dirModal) closeVault();
    });
  }

  // Server-Verified Cryptographic Passcode Validation
  if (pwdForm) {
    pwdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const entered = pwdInput ? pwdInput.value.trim() : '';
      if (!entered) return;

      if (pwdFeedback) {
        pwdFeedback.textContent = '⚡ Verifying vault passcode against circuit cipher...';
        pwdFeedback.style.color = 'var(--ink-secondary)';
      }

      try {
        const res = await fetch('/api/vault/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: entered })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          sessionStorage.setItem('cse_vault_unlocked', 'true');
          vintageSound.playBell();
          if (pwdFeedback) {
            pwdFeedback.textContent = '✔ Access Authorized! Decrypting filesystem index...';
            pwdFeedback.style.color = 'var(--accent-patina)';
          }
          setTimeout(() => {
            openDirectory();
          }, 300);
        } else {
          vintageSound.playMechanicalClick(400, 0.05);
          if (pwdFeedback) {
            pwdFeedback.textContent = `❌ ${data.error || 'Access Denied: Incorrect passcode.'}`;
            pwdFeedback.style.color = 'var(--accent-rust)';
          }
          if (pwdInput) {
            pwdInput.classList.add('shake');
            setTimeout(() => pwdInput.classList.remove('shake'), 500);
            pwdInput.focus();
          }
        }
      } catch (err) {
        // Fallback for offline usage
        const localData = JSON.parse(localStorage.getItem('cse_portfolio_data') || '{}');
        const fallbackPwd = (localData.personalDirectory?.password || '1234').toString();
        if (entered === fallbackPwd) {
          sessionStorage.setItem('cse_vault_unlocked', 'true');
          vintageSound.playBell();
          openDirectory();
        } else {
          vintageSound.playMechanicalClick(400, 0.05);
          if (pwdFeedback) {
            pwdFeedback.textContent = '❌ Access Denied: Incorrect passcode.';
            pwdFeedback.style.color = 'var(--accent-rust)';
          }
        }
      }
    });
  }

  // Add file drawer toggle
  if (toggleAddBtn && addDrawer) {
    toggleAddBtn.addEventListener('click', () => {
      const isHidden = addDrawer.style.display === 'none' || !addDrawer.style.display;
      addDrawer.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        populateFolderDatalist();
        const nameInput = document.getElementById('newDriveFileName');
        if (nameInput) nameInput.focus();
      }
    });
  }

  if (cancelAddBtn && addDrawer) {
    cancelAddBtn.addEventListener('click', () => {
      addDrawer.style.display = 'none';
      if (addForm) addForm.reset();
    });
  }

  function populateFolderDatalist() {
    if (!folderDataList) return;
    const data = window.PortfolioState.data?.personalDirectory || {};
    const folders = data.folders || [];
    folderDataList.innerHTML = folders.map(f => `<option value="${escapeHtml(f.name)}"></option>`).join('');
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderFilesTable();
    });
  }

  // Add file submit
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newDriveFileName')?.value.trim();
      const driveUrl = document.getElementById('newDriveFileUrl')?.value.trim();
      const folder = document.getElementById('newDriveFileFolder')?.value.trim() || 'General Files';
      const type = document.getElementById('newDriveFileType')?.value || 'pdf';
      const size = document.getElementById('newDriveFileSize')?.value.trim() || 'Drive Link';
      const desc = document.getElementById('newDriveFileDesc')?.value.trim() || '';

      if (!name || !driveUrl) return;

      if (!window.PortfolioState.data.personalDirectory) {
        window.PortfolioState.data.personalDirectory = {
          password: '1234',
          folders: [],
          files: []
        };
      }

      const pDir = window.PortfolioState.data.personalDirectory;
      if (!pDir.files) pDir.files = [];
      if (!pDir.folders) pDir.folders = [];

      // Check if folder exists
      if (!pDir.folders.some(f => f.name.toLowerCase() === folder.toLowerCase())) {
        pDir.folders.push({
          id: 'f-' + Date.now(),
          name: folder,
          icon: '📁'
        });
      }

      const newFile = {
        id: 'file-' + Date.now(),
        name,
        folder,
        size,
        type,
        driveUrl,
        updated: new Date().toISOString().slice(0, 7),
        desc
      };

      pDir.files.unshift(newFile);

      // Persist to backend and localStorage
      const token = sessionStorage.getItem('cse_admin_token');
      try {
        await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(window.PortfolioState.data)
        });
      } catch (err) {
        console.warn('API save failed, cached in localStorage:', err);
      }
      localStorage.setItem('cse_portfolio_data', JSON.stringify(window.PortfolioState.data));

      vintageSound.playBell();
      addForm.reset();
      addDrawer.style.display = 'none';
      renderVault();
    });
  }

  function getFileIcon(type) {
    switch (type) {
      case 'pdf': return '📄';
      case 'zip': return '📦';
      case 'code': return '💻';
      case 'doc': return '📝';
      case 'sheet': return '📊';
      case 'img': return '🖼️';
      default: return '📁';
    }
  }

  function renderVault() {
    const isAdmin = Boolean(sessionStorage.getItem('cse_admin_token'));
    if (toggleAddBtn) {
      toggleAddBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
    renderFolderChips();
    renderFilesTable();
    populateFolderDatalist();
  }

  function renderFolderChips() {
    if (!folderChipsContainer) return;
    const pDir = window.PortfolioState.data?.personalDirectory || {};
    const files = pDir.files || [];
    const folders = pDir.folders || [];

    const totalCount = files.length;
    let html = `
      <button type="button" class="filter-chip ${activeVaultFolder === 'ALL' ? 'active' : ''}" data-folder="ALL">
        🗂️ All Files (${totalCount})
      </button>
    `;

    folders.forEach(f => {
      const count = files.filter(file => file.folder.toLowerCase() === f.name.toLowerCase()).length;
      html += `
        <button type="button" class="filter-chip ${activeVaultFolder === f.name ? 'active' : ''}" data-folder="${escapeHtml(f.name)}">
          ${f.icon || '📁'} ${escapeHtml(f.name)} (${count})
        </button>
      `;
    });

    folderChipsContainer.innerHTML = html;

    folderChipsContainer.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeVaultFolder = btn.getAttribute('data-folder');
        renderFolderChips();
        renderFilesTable();
      });
    });
  }

  function renderFilesTable() {
    if (!tableBody) return;
    const isAdmin = Boolean(sessionStorage.getItem('cse_admin_token'));
    const pDir = window.PortfolioState.data?.personalDirectory || {};
    const allFiles = pDir.files || [];

    let filtered = allFiles;

    if (activeVaultFolder !== 'ALL') {
      filtered = filtered.filter(f => f.folder.toLowerCase() === activeVaultFolder.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(f => 
        (f.name && f.name.toLowerCase().includes(searchQuery)) ||
        (f.folder && f.folder.toLowerCase().includes(searchQuery)) ||
        (f.desc && f.desc.toLowerCase().includes(searchQuery)) ||
        (f.type && f.type.toLowerCase().includes(searchQuery))
      );
    }

    if (statsDisplay) {
      statsDisplay.textContent = `${filtered.length} of ${allFiles.length} resources cataloged`;
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-secondary); font-family: var(--font-mono);">
            No matching files located in this directory.${isAdmin ? ' Click <strong>"➕ Add File Link"</strong> to register new Google Drive files.' : ''}
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(file => `
      <tr class="vault-file-row">
        <td style="text-align: center; font-size: 1.25rem;">${getFileIcon(file.type)}</td>
        <td>
          <div style="font-weight: 600; font-family: var(--font-mono); font-size: 0.88rem;">${escapeHtml(file.name)}</div>
          ${file.desc ? `<div style="font-size: 0.75rem; color: var(--ink-secondary); margin-top: 2px;">${escapeHtml(file.desc)}</div>` : ''}
        </td>
        <td>
          <span class="tech-tag" style="font-size: 0.75rem;">${escapeHtml(file.folder)}</span>
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.78rem; white-space: nowrap;">
          ${escapeHtml(file.size || 'Drive Link')}
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.78rem; white-space: nowrap;">
          ${escapeHtml(file.updated || '2026')}
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <a href="${escapeHtml(file.driveUrl)}" target="_blank" rel="noopener" class="vintage-btn btn-sm btn-primary" title="Open Google Drive File in new tab">
            🔗 Drive ↗
          </a>
          ${isAdmin ? `
            <button type="button" class="vintage-btn btn-sm btn-outline btn-danger delete-vault-file-btn" data-id="${escapeHtml(file.id)}" title="Remove file link" style="margin-left: 4px;">
              ✕
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');

    // Bind delete buttons (admin only)
    if (isAdmin) {
      tableBody.querySelectorAll('.delete-vault-file-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const fileId = btn.getAttribute('data-id');
          if (confirm('Are you sure you want to remove this Google Drive file reference?')) {
            pDir.files = pDir.files.filter(f => f.id !== fileId);
            const token = sessionStorage.getItem('cse_admin_token');
            try {
              await fetch('/api/portfolio', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(window.PortfolioState.data)
              });
            } catch(err){}
            localStorage.setItem('cse_portfolio_data', JSON.stringify(window.PortfolioState.data));
            renderVault();
          }
        });
      });
    }
  }

  window.renderPersonalVault = renderVault;
}

