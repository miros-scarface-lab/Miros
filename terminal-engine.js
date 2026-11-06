/**
 * ============================================================================
 * SCARFACE LAB ADVANCED POSIX LINUX SHELL & VIRTUAL MACHINE ENGINE (VT-100)
 * ============================================================================
 * Provides an authentic in-browser Linux shell environment supporting:
 * - Hierarchical Virtual Filesystem (VFS) with persistent local storage
 * - Complete POSIX utilities: ls, cd, pwd, cat, touch, mkdir, rm, cp, mv, echo,
 *   grep, head, tail, wc, find, which, tree, chmod, chown
 * - Pipes (|) and output redirections (> and >>)
 * - System telemetry: whoami, id, hostname, uname, uptime, date, cal, df, free,
 *   ps, top, kill, env, export, alias, history
 * - Interactive Python REPL (python3 / python) & one-liners (-c)
 * - Interactive Node.js REPL (node / js) & one-liners (-e)
 * - In-terminal text editor (nano / vim) with live saving to VFS
 * - Script execution: bash script.sh / sh script.sh
 * - Cyber tools: neofetch, cmatrix (live digital rain), cowsay, fortune, sl, curl, ping, ifconfig
 * - Command history navigation (Up/Down arrow), Tab autocompletion, Ctrl+C / Ctrl+L
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LinuxTerminalEngine = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // ==========================================================================
  // 1. Virtual Filesystem (VFS)
  // ==========================================================================
  class VirtualFS {
    constructor() {
      this.storageKey = 'scarface_vfs_storage_v2';
      this.fs = this.loadInitialFS();
    }

    loadInitialFS() {
      // Try restoring modified VFS from localStorage
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (e) {
            console.warn('[VFS] Saved state invalid, resetting to defaults.');
          }
        }
      }
      return this.getDefaultFS();
    }

    save() {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.fs));
        } catch (e) {}
      }
    }

    reset() {
      this.fs = this.getDefaultFS();
      this.save();
    }

    getDefaultFS() {
      const now = new Date().toISOString();
      return {
        type: 'dir',
        name: '/',
        perms: 'rwxr-xr-x',
        owner: 'root',
        created: now,
        children: {
          bin: {
            type: 'dir',
            name: 'bin',
            perms: 'rwxr-xr-x',
            owner: 'root',
            created: now,
            children: {
              bash: { type: 'file', name: 'bash', perms: 'rwxr-xr-x', owner: 'root', size: 1254320, content: '[ELF 64-bit LSB executable, GNU bash]' },
              sh: { type: 'file', name: 'sh', perms: 'rwxr-xr-x', owner: 'root', size: 1254320, content: '[ELF 64-bit LSB executable, POSIX sh]' },
              python3: { type: 'file', name: 'python3', perms: 'rwxr-xr-x', owner: 'root', size: 5821040, content: '[ELF 64-bit LSB executable, Python 3.12.4]' },
              node: { type: 'file', name: 'node', perms: 'rwxr-xr-x', owner: 'root', size: 48921000, content: '[ELF 64-bit LSB executable, Node.js v20.15.0]' },
              nano: { type: 'file', name: 'nano', perms: 'rwxr-xr-x', owner: 'root', size: 342190, content: '[ELF 64-bit LSB executable, GNU nano 7.2]' },
              vim: { type: 'file', name: 'vim', perms: 'rwxr-xr-x', owner: 'root', size: 3892100, content: '[ELF 64-bit LSB executable, VIM 9.1]' },
              ls: { type: 'file', name: 'ls', perms: 'rwxr-xr-x', owner: 'root', size: 142100, content: '[ELF binary]' },
              cat: { type: 'file', name: 'cat', perms: 'rwxr-xr-x', owner: 'root', size: 43200, content: '[ELF binary]' },
              echo: { type: 'file', name: 'echo', perms: 'rwxr-xr-x', owner: 'root', size: 38200, content: '[ELF binary]' },
              pwd: { type: 'file', name: 'pwd', perms: 'rwxr-xr-x', owner: 'root', size: 35100, content: '[ELF binary]' },
              cd: { type: 'file', name: 'cd', perms: 'rwxr-xr-x', owner: 'root', size: 28400, content: '[Shell builtin]' },
              mkdir: { type: 'file', name: 'mkdir', perms: 'rwxr-xr-x', owner: 'root', size: 52100, content: '[ELF binary]' },
              touch: { type: 'file', name: 'touch', perms: 'rwxr-xr-x', owner: 'root', size: 48900, content: '[ELF binary]' },
              rm: { type: 'file', name: 'rm', perms: 'rwxr-xr-x', owner: 'root', size: 68400, content: '[ELF binary]' },
              cp: { type: 'file', name: 'cp', perms: 'rwxr-xr-x', owner: 'root', size: 154000, content: '[ELF binary]' },
              mv: { type: 'file', name: 'mv', perms: 'rwxr-xr-x', owner: 'root', size: 142000, content: '[ELF binary]' },
              grep: { type: 'file', name: 'grep', perms: 'rwxr-xr-x', owner: 'root', size: 198000, content: '[ELF binary]' },
              head: { type: 'file', name: 'head', perms: 'rwxr-xr-x', owner: 'root', size: 48000, content: '[ELF binary]' },
              tail: { type: 'file', name: 'tail', perms: 'rwxr-xr-x', owner: 'root', size: 56000, content: '[ELF binary]' },
              wc: { type: 'file', name: 'wc', perms: 'rwxr-xr-x', owner: 'root', size: 51200, content: '[ELF binary]' },
              neofetch: { type: 'file', name: 'neofetch', perms: 'rwxr-xr-x', owner: 'root', size: 128900, content: '#!/usr/bin/env bash\n# neofetch CLI release' },
              cmatrix: { type: 'file', name: 'cmatrix', perms: 'rwxr-xr-x', owner: 'root', size: 42100, content: '[ELF binary]' }
            }
          },
          etc: {
            type: 'dir',
            name: 'etc',
            perms: 'rwxr-xr-x',
            owner: 'root',
            created: now,
            children: {
              hostname: {
                type: 'file',
                name: 'hostname',
                perms: 'rw-r--r--',
                owner: 'root',
                size: 26,
                content: 'scarface-quantum-station\n'
              },
              'os-release': {
                type: 'file',
                name: 'os-release',
                perms: 'rw-r--r--',
                owner: 'root',
                size: 240,
                content: 'NAME="Scarface Cyber-OS"\nPRETTY_NAME="Scarface Cyber-OS 2026.11 LTS (x86_64-quantum)"\nID=scarface\nID_LIKE=arch\nBUILD_ID=rolling\nANSI_COLOR="0;36"\nHOME_URL="https://miros-snowy.vercel.app"\nSUPPORT_URL="https://miros-snowy.vercel.app/contact"\n'
              },
              passwd: {
                type: 'file',
                name: 'passwd',
                perms: 'rw-r--r--',
                owner: 'root',
                size: 192,
                content: 'root:x:0:0:root:/root:/bin/bash\nsajid:x:1000:1000:Mir A K Sajid,,,:/home/sajid:/bin/bash\noperator:x:1001:1001:Operator Console,,,:/home/sajid:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n'
              },
              motd: {
                type: 'file',
                name: 'motd',
                perms: 'rw-r--r--',
                owner: 'root',
                size: 320,
                content: '========================================================================\n⚡ SCARFACE RESEARCH LAB TELETYPE STATION v2.6.4 (x86_64-quantum)\nKernel: 6.10.4-arch1-1-scarface #1 SMP PREEMPT_DYNAMIC\nHardware: Intel Core i9-14900K (24 cores) | RTX 4090 24GB | 32GB RAM\nSystem Status: ALL SUBSYSTEMS NOMINAL.\nType "help" to review POSIX utilities or "neofetch" for system telemetry.\n========================================================================\n'
              }
            }
          },
          proc: {
            type: 'dir',
            name: 'proc',
            perms: 'r-xr-xr-x',
            owner: 'root',
            created: now,
            children: {
              cpuinfo: {
                type: 'file',
                name: 'cpuinfo',
                perms: 'r--r--r--',
                owner: 'root',
                size: 380,
                content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel\t\t: 183\nmodel name\t: Intel(R) Core(TM) i9-14900K CPU @ 3.20GHz\nstepping\t: 1\ncpu MHz\t\t: 5800.000\ncache size\t: 36864 KB\ncpu cores\t: 24\nflags\t\t: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc arch_perfmon pebs bts rep_good nopl xtopology nonstop_tsc cpuid aperfmperf pni pclmulqdq dtes64 monitor ds_cpl vmx smx est tm2 ssse3 sdbg fma cx16 xtpr pdcm pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand lahf_lm abm 3dnowprefetch cpuid_fault epb ssbd ibrs ibpb stibp ibrs_enhanced tpr_shadow vnmi flexpriority ept vpid ept_ad fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid rdseed adx smap clflushopt clwb intel_pt sha_ni xsaveopt xsavec xgetbv1 xsaves dtherm ida arat pln pts hwp hwp_notify hwp_act_window hwp_epp hwp_pkg_req umip pku ospke waitpkg gfni vaes vpclmulqdq tpa arch_capabilities\n'
              },
              meminfo: {
                type: 'file',
                name: 'meminfo',
                perms: 'r--r--r--',
                owner: 'root',
                size: 210,
                content: 'MemTotal:       32840520 kB\nMemFree:        21458920 kB\nMemAvailable:   27914320 kB\nBuffers:         1048576 kB\nCached:          6291456 kB\nSwapTotal:      16777216 kB\nSwapFree:       16777216 kB\n'
              },
              version: {
                type: 'file',
                name: 'version',
                perms: 'r--r--r--',
                owner: 'root',
                size: 110,
                content: 'Linux version 6.10.4-arch1-1-scarface (sajid@scarface-lab) (gcc 14.1.1 20240522) #1 SMP PREEMPT_DYNAMIC\n'
              }
            }
          },
          tmp: {
            type: 'dir',
            name: 'tmp',
            perms: 'rwxrwxrwt',
            owner: 'root',
            created: now,
            children: {}
          },
          home: {
            type: 'dir',
            name: 'home',
            perms: 'rwxr-xr-x',
            owner: 'root',
            created: now,
            children: {
              sajid: {
                type: 'dir',
                name: 'sajid',
                perms: 'rwxr-xr-x',
                owner: 'sajid',
                created: now,
                children: {
                  'welcome.txt': {
                    type: 'file',
                    name: 'welcome.txt',
                    perms: 'rw-r--r--',
                    owner: 'sajid',
                    size: 890,
                    content: '========================================================================\n🚀 WELCOME TO THE SCARFACE INTERACTIVE LINUX TERMINAL\n========================================================================\nOperate with full POSIX shell capabilities:\n  - Navigation:      ls -la, cd, pwd, tree, find\n  - File Ops:        cat, touch, mkdir -p, rm -rf, cp -r, mv, head, tail, wc\n  - Text Processing: echo, grep (supports pipes e.g. cat resume.md | grep Skills)\n  - Redirections:    cmd > file.txt, cmd >> file.txt\n  - In-Terminal IDE: nano script.sh  or  vim app.py  (interactive text editor)\n  - Shell Scripts:   bash scripts/benchmark.sh\n  - Live Python:     python3 (interactive REPL) or python3 scripts/demo.py\n  - Live Node.js:    node (interactive REPL) or node scripts/app.js\n  - Telemetry:       neofetch, top, ps aux, uname -a, uptime, free -m, whoami\n  - Cyber Tools:     cmatrix (matrix rain), cowsay, fortune, sl, ping, curl\n\nTry running: neofetch   or   cmatrix   or   python3\n========================================================================\n'
                  },
                  'resume.md': {
                    type: 'file',
                    name: 'resume.md',
                    perms: 'rw-r--r--',
                    owner: 'sajid',
                    size: 980,
                    content: '# Mir A K Sajid — CSE Systems Engineer & Full-Stack Architect\n\n- **Degree:** B.S. in Computer Science & Engineering\n- **Institution:** Leading University / Scarface Research Lab\n- **Current GPA:** 3.89 / 4.00 (Dean\'s Honor Roll)\n- **Email:** alex.chen.cse@example.edu\n- **Website:** https://miros-snowy.vercel.app\n- **Specialization:** Distributed Systems, Linux Kernel Internals, Compilers, Cyber Infrastructure\n\n## Core Technical Competencies\n- **Languages:** C, C++, Rust, Go, Python, TypeScript, x86-64 Assembly\n- **Systems:** Linux Kernel, POSIX APIs, Docker, Kubernetes, eBPF, WebAssembly\n- **Storage:** PostgreSQL, Redis, ScyllaDB, SQLite\n- **Cloud & Tooling:** AWS, Vercel, Git, Linux IPC, Socket Programming\n\n## Academic & Research Highlights\n- Developed high-performance quantum simulation modules & compiler IR passes\n- Built full HSC Academic digital library hub with 300+ Mulboi books & 600+ board solves\n- Hardened security with PBKDF2 cryptography, timing-safe authentication & strict CSP\n'
                  },
                  projects: {
                    type: 'dir',
                    name: 'projects',
                    perms: 'rwxr-xr-x',
                    owner: 'sajid',
                    created: now,
                    children: {
                      'quantum-sim.md': {
                        type: 'file',
                        name: 'quantum-sim.md',
                        perms: 'rw-r--r--',
                        owner: 'sajid',
                        size: 380,
                        content: '# Quantum Circuit State-Vector Simulator\nArchitecture: C++20 / AVX-512 SIMD\nDetails: Simulates up to 34 qubits with high cache locality, tensor contraction optimizations, and interactive quantum Fourier transform verification.\n'
                      },
                      'micro-compiler.md': {
                        type: 'file',
                        name: 'micro-compiler.md',
                        perms: 'rw-r--r--',
                        owner: 'sajid',
                        size: 410,
                        content: '# Micro-C Native Compiler & SSA Optimizer\nArchitecture: Rust / LLVM Target Backend\nDetails: Custom recursive-descent parser, abstract syntax graph generation, static single assignment form optimizations, and native ELF binary output.\n'
                      },
                      'distributed-kv.md': {
                        type: 'file',
                        name: 'distributed-kv.md',
                        perms: 'rw-r--r--',
                        owner: 'sajid',
                        size: 395,
                        content: '# Raft-Consensus Distributed Key-Value Store\nArchitecture: Go / gRPC / LevelDB\nDetails: Fault-tolerant cluster coordination, leader election, log replication, snapshotting, and strict linearizable reads.\n'
                      }
                    }
                  },
                  skills: {
                    type: 'dir',
                    name: 'skills',
                    perms: 'rwxr-xr-x',
                    owner: 'sajid',
                    created: now,
                    children: {
                      'languages.txt': {
                        type: 'file',
                        name: 'languages.txt',
                        perms: 'rw-r--r--',
                        owner: 'sajid',
                        size: 240,
                        content: 'C [95%] — Low-level memory, pointers, syscalls\nC++ [92%] — Templates, STL, RAII, concurrency\nRust [88%] — Borrow checker, lifetimes, fearless concurrency\nPython [94%] — NumPy, PyTorch, Scripting, Automation\nTypeScript [90%] — React, Node, Web Standards\n'
                      },
                      'systems.txt': {
                        type: 'file',
                        name: 'systems.txt',
                        perms: 'rw-r--r--',
                        owner: 'sajid',
                        size: 210,
                        content: 'Linux Kernel & System Programming [92%]\nNetworking & TCP/IP Sockets [88%]\nDistributed Consensus (Raft) [85%]\nDatabase Internals & Storage Engines [87%]\n'
                      }
                    }
                  },
                  hsc: {
                    type: 'dir',
                    name: 'hsc',
                    perms: 'rwxr-xr-x',
                    owner: 'sajid',
                    created: now,
                    children: {
                      'mulboi_books.txt': {
                        type: 'file',
                        name: 'mulboi_books.txt',
                        perms: 'rw-r--r--',
                        owner: 'sajid',
                        size: 320,
                        content: 'HSC Mulboi Library: 300+ Categorized Books Available\n- 52 Textbooks (Physics, Chemistry, Math, Biology, ICT)\n- 105 Highlighted Books (Royal, Medical & Engineering Marks)\n- 64 Exercise Solves (Ketab Uddin, Guha, Shahjahan Tapan)\n- 24 Shortcut Formulas & Tricks\n- 23 Concept Summaries\n- 32 Practical Solves\n'
                      },
                      'aapathshala_archive.txt': {
                        type: 'file',
                        name: 'aapathshala_archive.txt',
                        perms: 'rw-r--r--',
                        owner: 'sajid',
                        size: 260,
                        content: 'AAPathshala Complete Cloud Archive (620+ Files):\n- Test Papers (College & Cadet Solves)\n- Question Banks (BUET, Medical, DU, GST)\n- Final Model Tests with Solutions\n- Board Solved Papers 2022-2024\n'
                      }
                    }
                  },
                  scripts: {
                    type: 'dir',
                    name: 'scripts',
                    perms: 'rwxr-xr-x',
                    owner: 'sajid',
                    created: now,
                    children: {
                      'benchmark.sh': {
                        type: 'file',
                        name: 'benchmark.sh',
                        perms: 'rwxr-xr-x',
                        owner: 'sajid',
                        size: 320,
                        content: '#!/bin/bash\necho "===> Initiating Scarface Quantum Workstation Benchmark..."\necho "[1/3] Querying Kernel Telemetry..."\nuname -a\necho "[2/3] Checking Memory Subsystem..."\nfree -m\necho "[3/3] Running CPU Arithmetic Speed Test..."\npython3 -c "import time; t0 = time.time(); s = sum(i*i for i in range(250000)); print(\'Calculated sum in\', round((time.time()-t0)*1000, 2), \'ms\')"\necho "===> All circuits nominal. 100% PASS."\n'
                      },
                      'matrix.sh': {
                        type: 'file',
                        name: 'matrix.sh',
                        perms: 'rwxr-xr-x',
                        owner: 'sajid',
                        size: 140,
                        content: '#!/bin/bash\necho "Connecting to the mainframe matrix stream..."\ncmatrix\n'
                      },
                      'demo.py': {
                        type: 'file',
                        name: 'demo.py',
                        perms: 'rwxr-xr-x',
                        owner: 'sajid',
                        size: 290,
                        content: '# Python 3 Script in Scarface VFS\ndef fibonacci(n):\n    a, b = 0, 1\n    seq = []\n    for _ in range(n):\n        seq.append(a)\n        a, b = b, a + b\n    return seq\n\nprint("First 10 Fibonacci numbers:", fibonacci(10))\nprint("Quantum core state: ACTIVE")\n'
                      },
                      'app.js': {
                        type: 'file',
                        name: 'app.js',
                        perms: 'rwxr-xr-x',
                        owner: 'sajid',
                        size: 240,
                        content: '// Node.js Demo in Scarface VFS\nconst telemetry = {\n  system: "Scarface Lab Cyber-OS",\n  load: "0.14, 0.08, 0.05",\n  active_modules: ["VFS", "POSIX-Parser", "REPL", "AudioFX"]\n};\nconsole.log(JSON.stringify(telemetry, null, 2));\n'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
    }

    // Path normalization: resolve '.', '..', '~', and repeated slashes
    normalizePath(pathStr, cwd = '/home/sajid') {
      if (!pathStr || pathStr === '.') return cwd;
      if (pathStr === '~') return '/home/sajid';
      if (pathStr.startsWith('~/')) pathStr = '/home/sajid/' + pathStr.slice(2);

      let absolute = pathStr.startsWith('/') ? pathStr : `${cwd}/${pathStr}`;
      const segments = absolute.split('/').filter(Boolean);
      const stack = [];

      for (const seg of segments) {
        if (seg === '.') continue;
        if (seg === '..') {
          if (stack.length > 0) stack.pop();
        } else {
          stack.push(seg);
        }
      }

      return '/' + stack.join('/');
    }

    // Traverse to node given absolute path
    getNode(pathStr, cwd = '/home/sajid') {
      const norm = this.normalizePath(pathStr, cwd);
      if (norm === '/') return this.fs;

      const parts = norm.split('/').filter(Boolean);
      let curr = this.fs;

      for (const part of parts) {
        if (!curr || curr.type !== 'dir' || !curr.children) return null;
        curr = curr.children[part];
        if (!curr) return null;
      }

      return curr;
    }

    getParentNode(pathStr, cwd = '/home/sajid') {
      const norm = this.normalizePath(pathStr, cwd);
      if (norm === '/') return null;
      const parts = norm.split('/').filter(Boolean);
      const childName = parts.pop();
      const parentPath = '/' + parts.join('/');
      const parent = this.getNode(parentPath, cwd);
      return { parent, childName, parentPath };
    }

    createFile(pathStr, content = '', cwd = '/home/sajid', owner = 'sajid') {
      const { parent, childName } = this.getParentNode(pathStr, cwd);
      if (!parent || parent.type !== 'dir') return { success: false, error: 'No such directory' };

      const now = new Date().toISOString();
      parent.children[childName] = {
        type: 'file',
        name: childName,
        perms: 'rw-r--r--',
        owner,
        size: content.length,
        created: now,
        content
      };
      this.save();
      return { success: true };
    }

    createDir(pathStr, cwd = '/home/sajid', owner = 'sajid') {
      const { parent, childName } = this.getParentNode(pathStr, cwd);
      if (!parent || parent.type !== 'dir') return { success: false, error: 'No such parent directory' };
      if (parent.children[childName]) return { success: false, error: 'File or directory already exists' };

      const now = new Date().toISOString();
      parent.children[childName] = {
        type: 'dir',
        name: childName,
        perms: 'rwxr-xr-x',
        owner,
        created: now,
        children: {}
      };
      this.save();
      return { success: true };
    }

    removeNode(pathStr, cwd = '/home/sajid', recursive = false) {
      const norm = this.normalizePath(pathStr, cwd);
      if (norm === '/' || norm === '/bin' || norm === '/etc') {
        return { success: false, error: 'Cannot remove system root or protected directory' };
      }

      const { parent, childName } = this.getParentNode(norm, cwd);
      if (!parent || !parent.children[childName]) {
        return { success: false, error: 'No such file or directory' };
      }

      const target = parent.children[childName];
      if (target.type === 'dir' && Object.keys(target.children).length > 0 && !recursive) {
        return { success: false, error: 'Directory not empty (use rm -r or -rf)' };
      }

      delete parent.children[childName];
      this.save();
      return { success: true };
    }
  }

  // ==========================================================================
  // 2. Terminal Virtual Machine & Command Processor
  // ==========================================================================
  class LinuxTerminalVM {
    constructor(options = {}) {
      this.vfs = new VirtualFS();
      this.cwd = '/home/sajid';
      this.previousCwd = '/home/sajid';
      this.user = 'sajid';
      this.hostname = 'scarface-quantum-station';
      this.history = typeof sessionStorage !== 'undefined' ? JSON.parse(sessionStorage.getItem('scarface_cmd_history') || '[]') : [];
      this.historyIndex = -1;
      this.aliases = {
        ll: 'ls -la',
        la: 'ls -a',
        cls: 'clear',
        python: 'python3',
        py: 'python3',
        js: 'node'
      };
      this.env = {
        USER: 'sajid',
        HOME: '/home/sajid',
        SHELL: '/bin/bash',
        TERM: 'xterm-256color',
        PATH: '/bin:/usr/bin:/home/sajid/scripts',
        PWD: '/home/sajid',
        LANG: 'en_US.UTF-8',
        EDITOR: 'nano'
      };

      // Execution state
      this.mode = 'shell'; // 'shell' | 'python_repl' | 'node_repl' | 'cmatrix' | 'nano'
      this.pythonScope = {};
      this.cmatrixInterval = null;
      this.nanoFile = null;

      // DOM Elements
      this.outputEl = options.outputEl || document.getElementById('terminalOutput');
      this.inputEl = options.inputEl || document.getElementById('terminalInput');
      this.promptEl = options.promptEl || document.querySelector('.term-prompt');
      this.screenEl = options.screenEl || document.getElementById('terminalScreen');

      this.init();
    }

    init() {
      this.updatePrompt();
      this.bindInputEvents();
      this.bindQuickButtons();
    }

    getPromptText() {
      if (this.mode === 'python_repl') return '>>> ';
      if (this.mode === 'node_repl') return '> ';
      const displayPath = this.cwd === '/home/sajid' ? '~' : (this.cwd.startsWith('/home/sajid/') ? '~' + this.cwd.slice(11) : this.cwd);
      const symbol = this.user === 'root' ? '#' : '$';
      return `${this.user}@${this.hostname}:${displayPath}${symbol} `;
    }

    updatePrompt() {
      if (this.promptEl) {
        this.promptEl.textContent = this.getPromptText();
      }
    }

    bindInputEvents() {
      if (!this.inputEl || typeof this.inputEl.addEventListener !== 'function') return;

      this.inputEl.addEventListener('keydown', (e) => {
        // Handle Tab autocompletion
        if (e.key === 'Tab') {
          e.preventDefault();
          this.handleTabCompletion();
          return;
        }

        // Handle Command History: ArrowUp / ArrowDown
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.history.length === 0) return;
          if (this.historyIndex === -1) {
            this.historyIndex = this.history.length - 1;
          } else if (this.historyIndex > 0) {
            this.historyIndex--;
          }
          this.inputEl.value = this.history[this.historyIndex] || '';
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.historyIndex !== -1) {
            if (this.historyIndex < this.history.length - 1) {
              this.historyIndex++;
              this.inputEl.value = this.history[this.historyIndex];
            } else {
              this.historyIndex = -1;
              this.inputEl.value = '';
            }
          }
          return;
        }

        // Handle Ctrl+C (Interrupt)
        if (e.ctrlKey && e.key.toLowerCase() === 'c') {
          e.preventDefault();
          if (this.mode === 'cmatrix') {
            this.stopCMatrix();
            return;
          }
          if (this.mode === 'python_repl' || this.mode === 'node_repl') {
            this.appendLine(`^C`, 'term-dim');
            this.exitRepl();
            return;
          }
          this.appendLine(`${this.getPromptText()}${this.inputEl.value}^C`, 'term-dim');
          this.inputEl.value = '';
          return;
        }

        // Handle Ctrl+L (Clear screen)
        if (e.ctrlKey && e.key.toLowerCase() === 'l') {
          e.preventDefault();
          this.clearScreen();
          return;
        }

        // Handle Enter (Execute)
        if (e.key === 'Enter') {
          const rawInput = this.inputEl.value;
          this.inputEl.value = '';
          this.executeInput(rawInput);
        }
      });
    }

    bindQuickButtons() {
      if (typeof document === 'undefined' || !document.querySelectorAll) return;
      document.querySelectorAll('.cmd-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const cmd = btn.getAttribute('data-cmd');
          if (cmd) {
            this.executeInput(cmd);
            if (this.inputEl) this.inputEl.focus();
          }
        });
      });
    }

    // ========================================================================
    // Autocompletion Engine
    // ========================================================================
    handleTabCompletion() {
      const val = this.inputEl.value;
      const parts = val.split(' ');
      const currentToken = parts[parts.length - 1];

      // If completing first token -> complete commands
      if (parts.length === 1) {
        const binDir = this.vfs.getNode('/bin');
        const commands = [
          ...Object.keys(binDir?.children || {}),
          ...Object.keys(this.aliases),
          'help', 'clear', 'exit', 'whoami', 'uname', 'uptime', 'neofetch',
          'cmatrix', 'top', 'ps', 'free', 'df', 'date', 'cal', 'history',
          'python3', 'node', 'nano', 'vim', 'curl', 'ping', 'cowsay', 'fortune'
        ];
        const uniqueCmds = Array.from(new Set(commands));
        const matches = uniqueCmds.filter(c => c.startsWith(currentToken));

        if (matches.length === 1) {
          this.inputEl.value = matches[0] + ' ';
        } else if (matches.length > 1) {
          this.appendLine(`${this.getPromptText()}${val}`, 'cmd-echo');
          this.appendLine(matches.join('  '), 'term-cyan');
        }
        return;
      }

      // If completing file/dir path token
      const currDir = this.vfs.getNode(this.cwd);
      if (!currDir || !currDir.children) return;

      const entries = Object.keys(currDir.children).map(name => {
        const isDir = currDir.children[name].type === 'dir';
        return isDir ? `${name}/` : name;
      });

      const matches = entries.filter(e => e.startsWith(currentToken));
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        this.inputEl.value = parts.join(' ');
      } else if (matches.length > 1) {
        this.appendLine(`${this.getPromptText()}${val}`, 'cmd-echo');
        this.appendLine(matches.join('  '), 'term-green');
      }
    }

    // ========================================================================
    // Input Router (Shell vs Python REPL vs Node REPL)
    // ========================================================================
    executeInput(raw) {
      if (this.mode === 'cmatrix') {
        this.stopCMatrix();
        return;
      }

      const promptText = this.getPromptText();
      this.appendLine(`${promptText}${this.escape(raw)}`, 'cmd-echo');

      const trimmed = raw.trim();
      if (!trimmed) return;

      // Add to command history
      this.history.push(raw);
      this.historyIndex = -1;
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('scarface_cmd_history', JSON.stringify(this.history.slice(-100)));
        }
      } catch (e) {}

      // Play subtle acoustic mechanical feedback
      if (typeof window !== 'undefined' && window.vintageSound && typeof window.vintageSound.playMechanicalClick === 'function') {
        window.vintageSound.playMechanicalClick(1200, 0.02);
      }

      // Check current REPL mode
      if (this.mode === 'python_repl') {
        this.executePythonRepl(trimmed);
        return;
      }

      if (this.mode === 'node_repl') {
        this.executeNodeRepl(trimmed);
        return;
      }

      // Otherwise execute POSIX command in shell mode
      this.executeCommandLine(trimmed);
    }

    // ========================================================================
    // Pipeline & Redirection Parser
    // ========================================================================
    executeCommandLine(cmdLine) {
      // Handle semicolons
      if (cmdLine.includes(';')) {
        const statements = cmdLine.split(';').map(s => s.trim()).filter(Boolean);
        for (const stmt of statements) {
          this.executeCommandLine(stmt);
        }
        return;
      }

      // Handle output redirection (> and >>)
      let append = false;
      let redirFile = null;
      let cleanCmd = cmdLine;

      if (cmdLine.includes('>>')) {
        const parts = cmdLine.split('>>');
        cleanCmd = parts[0].trim();
        redirFile = parts[1].trim();
        append = true;
      } else if (cmdLine.includes('>')) {
        const parts = cmdLine.split('>');
        cleanCmd = parts[0].trim();
        redirFile = parts[1].trim();
        append = false;
      }

      // Handle pipeline (|)
      if (cleanCmd.includes('|')) {
        const pipeSegments = cleanCmd.split('|').map(s => s.trim()).filter(Boolean);
        let pipeInput = '';

        for (let i = 0; i < pipeSegments.length; i++) {
          const segResult = this.runSingleCommand(pipeSegments[i], pipeInput);
          pipeInput = segResult.stdout || '';
          if (segResult.stderr) {
            this.appendLine(segResult.stderr, 'term-error');
          }
        }

        if (redirFile) {
          this.writeRedirection(redirFile, pipeInput, append);
        } else if (pipeInput) {
          this.appendLine(pipeInput);
        }
        return;
      }

      // Single command execution
      const result = this.runSingleCommand(cleanCmd, '');
      if (redirFile) {
        const output = result.stdout + (result.stderr ? '\n' + result.stderr : '');
        this.writeRedirection(redirFile, output, append);
      } else {
        if (result.stdout) this.appendLine(result.stdout);
        if (result.stderr) this.appendLine(result.stderr, 'term-error');
      }
    }

    writeRedirection(filename, content, append = false) {
      filename = filename.replace(/^["']|["']$/g, '');
      const existing = this.vfs.getNode(filename, this.cwd);
      if (existing) {
        if (existing.type === 'dir') {
          this.appendLine(`bash: ${filename}: Is a directory`, 'term-error');
          return;
        }
        existing.content = append ? existing.content + content : content;
        existing.size = existing.content.length;
        this.vfs.save();
      } else {
        this.vfs.createFile(filename, content, this.cwd, this.user);
      }
    }

    // ========================================================================
    // Single Command Dispatcher
    // ========================================================================
    runSingleCommand(cmdStr, stdin = '') {
      let tokens = this.tokenize(cmdStr);
      if (tokens.length === 0) return { stdout: '', stderr: '' };

      // Variable expansion: $VAR
      tokens = tokens.map(tok => this.expandVariables(tok));

      let bin = tokens[0];
      // Check alias
      if (this.aliases[bin]) {
        const aliasTokens = this.tokenize(this.aliases[bin]);
        tokens = [...aliasTokens, ...tokens.slice(1)];
        bin = tokens[0];
      }

      const args = tokens.slice(1);

      switch (bin) {
        case 'pwd':
          return { stdout: this.cwd, stderr: '' };

        case 'whoami':
          return { stdout: this.user, stderr: '' };

        case 'id':
          return { stdout: `uid=1000(${this.user}) gid=1000(${this.user}) groups=1000(${this.user}),27(sudo),100(users)`, stderr: '' };

        case 'hostname':
          return { stdout: this.hostname, stderr: '' };

        case 'uname':
          return this.cmdUname(args);

        case 'uptime':
          return this.cmdUptime();

        case 'date':
          return { stdout: new Date().toString(), stderr: '' };

        case 'cal':
          return this.cmdCal();

        case 'cd':
          return this.cmdCd(args[0]);

        case 'ls':
          return this.cmdLs(args);

        case 'cat':
          return this.cmdCat(args, stdin);

        case 'touch':
          return this.cmdTouch(args);

        case 'mkdir':
          return this.cmdMkdir(args);

        case 'rm':
          return this.cmdRm(args);

        case 'cp':
          return this.cmdCp(args);

        case 'mv':
          return this.cmdMv(args);

        case 'echo':
          return { stdout: args.join(' '), stderr: '' };

        case 'grep':
          return this.cmdGrep(args, stdin);

        case 'head':
          return this.cmdHead(args, stdin);

        case 'tail':
          return this.cmdTail(args, stdin);

        case 'wc':
          return this.cmdWc(args, stdin);

        case 'find':
          return this.cmdFind(args);

        case 'tree':
          return this.cmdTree(args[0]);

        case 'which':
          return this.cmdWhich(args[0]);

        case 'df':
          return { stdout: 'Filesystem     1K-blocks      Used Available Use% Mounted on\n/dev/nvme0n1p2 959857240 214589200 745268040  23% /\ntmpfs           16420260         0  16420260   0% /dev/shm\n/dev/nvme0n1p1   1046512     89200    957312   9% /boot', stderr: '' };

        case 'free':
          return this.cmdFree(args);

        case 'ps':
          return this.cmdPs(args);

        case 'top':
        case 'htop':
          return this.cmdTop();

        case 'kill':
          return { stdout: `kill: process ${args[0] || '1'} terminated`, stderr: '' };

        case 'env':
        case 'printenv':
          return { stdout: Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join('\n'), stderr: '' };

        case 'export':
          return this.cmdExport(args);

        case 'alias':
          return this.cmdAlias(args);

        case 'history':
          return this.cmdHistory(args);

        case 'clear':
        case 'cls':
          this.clearScreen();
          return { stdout: '', stderr: '' };

        case 'neofetch':
          return this.cmdNeofetch();

        case 'cmatrix':
          this.startCMatrix();
          return { stdout: '', stderr: '' };

        case 'cowsay':
          return this.cmdCowsay(args.join(' ') || 'Scarface Lab Systems Nominal');

        case 'fortune':
          return this.cmdFortune();

        case 'sl':
          return this.cmdSl();

        case 'curl':
          return this.cmdCurl(args);

        case 'ping':
          return this.cmdPing(args);

        case 'ifconfig':
        case 'ip':
          return this.cmdIfconfig();

        case 'python3':
        case 'python':
          return this.cmdPython(args);

        case 'node':
        case 'js':
          return this.cmdNode(args);

        case 'bash':
        case 'sh':
          return this.cmdBash(args);

        case 'nano':
        case 'vim':
          this.openNanoEditor(args[0]);
          return { stdout: '', stderr: '' };

        case 'sudo':
          return this.cmdSudo(args);

        case 'help':
        case 'man':
          return this.cmdHelp();

        case 'admin':
          window.location.href = 'admin.html';
          return { stdout: 'Redirecting to Station Master Admin Console...', stderr: '' };

        case 'hsc':
          window.location.href = 'hsc.html';
          return { stdout: 'Launching HSC Academic Hub...', stderr: '' };

        case 'companion':
        case 'ai':
        case 'gemini':
          window.location.href = 'companion.html';
          return { stdout: 'Launching Sector 09: Quantum Neural Companion (Gemini 3.5 Flash)...', stderr: '' };

        case 'projects':
          return this.cmdProjects();

        case 'skills':
          return this.cmdSkills();

        default:
          // Check if user is executing a script directly, e.g. ./benchmark.sh or scripts/benchmark.sh
          if (bin.startsWith('./') || bin.endsWith('.sh') || bin.endsWith('.py') || bin.endsWith('.js')) {
            return this.cmdExecuteScriptFile(bin, args);
          }
          return { stdout: '', stderr: `bash: ${bin}: command not found. Type "help" to review installed routines.` };
      }
    }

    // ========================================================================
    // Command Implementations
    // ========================================================================
    cmdCd(target) {
      if (!target || target === '~') {
        this.previousCwd = this.cwd;
        this.cwd = '/home/sajid';
        this.env.PWD = this.cwd;
        this.updatePrompt();
        return { stdout: '', stderr: '' };
      }

      if (target === '-') {
        const tmp = this.cwd;
        this.cwd = this.previousCwd;
        this.previousCwd = tmp;
        this.env.PWD = this.cwd;
        this.updatePrompt();
        return { stdout: this.cwd, stderr: '' };
      }

      const resolved = this.vfs.normalizePath(target, this.cwd);
      const node = this.vfs.getNode(resolved);
      if (!node) {
        return { stdout: '', stderr: `bash: cd: ${target}: No such file or directory` };
      }
      if (node.type !== 'dir') {
        return { stdout: '', stderr: `bash: cd: ${target}: Not a directory` };
      }

      this.previousCwd = this.cwd;
      this.cwd = resolved;
      this.env.PWD = this.cwd;
      this.updatePrompt();
      return { stdout: '', stderr: '' };
    }

    cmdLs(args) {
      let showAll = false;
      let longFormat = false;
      let targetPath = this.cwd;

      for (const arg of args) {
        if (arg.startsWith('-')) {
          if (arg.includes('a')) showAll = true;
          if (arg.includes('l')) longFormat = true;
        } else {
          targetPath = arg;
        }
      }

      const node = this.vfs.getNode(targetPath, this.cwd);
      if (!node) return { stdout: '', stderr: `ls: cannot access '${targetPath}': No such file or directory` };

      if (node.type === 'file') {
        if (longFormat) {
          return { stdout: `${node.perms} 1 ${node.owner} ${node.owner} ${String(node.size || 0).padStart(7)} ${this.formatDate(node.created)} ${node.name}`, stderr: '' };
        }
        return { stdout: node.name, stderr: '' };
      }

      const children = Object.values(node.children || {});
      const items = [];

      if (showAll) {
        items.push({ name: '.', type: 'dir', perms: 'rwxr-xr-x', owner: node.owner, size: 4096, created: node.created });
        items.push({ name: '..', type: 'dir', perms: 'rwxr-xr-x', owner: node.owner, size: 4096, created: node.created });
      }

      for (const child of children) {
        if (!showAll && child.name.startsWith('.')) continue;
        items.push(child);
      }

      items.sort((a, b) => a.name.localeCompare(b.name));

      if (longFormat) {
        const lines = items.map(it => {
          const typePrefix = it.type === 'dir' ? 'd' : '-';
          const perms = `${typePrefix}${it.perms.slice(1)}`;
          const size = String(it.size || (it.type === 'dir' ? 4096 : 0)).padStart(6);
          const dateStr = this.formatDate(it.created);
          const colorName = it.type === 'dir' ? `\x1b[34m${it.name}/\x1b[0m` : (it.perms.includes('x') ? `\x1b[32m${it.name}*\x1b[0m` : it.name);
          return `${perms} 1 ${it.owner} ${it.owner} ${size} ${dateStr} ${colorName}`;
        });
        return { stdout: `total ${items.length * 4}\n` + lines.join('\n'), stderr: '' };
      }

      const formatted = items.map(it => {
        if (it.type === 'dir') return `[${it.name}/]`;
        if (it.perms.includes('x')) return `*${it.name}`;
        return it.name;
      });

      return { stdout: formatted.join('  '), stderr: '' };
    }

    cmdCat(args, stdin = '') {
      if (args.length === 0) {
        return { stdout: stdin, stderr: '' };
      }

      const outputs = [];
      for (const file of args) {
        const node = this.vfs.getNode(file, this.cwd);
        if (!node) {
          outputs.push(`cat: ${file}: No such file or directory`);
          continue;
        }
        if (node.type === 'dir') {
          outputs.push(`cat: ${file}: Is a directory`);
          continue;
        }
        outputs.push(node.content || '');
      }
      return { stdout: outputs.join('\n'), stderr: '' };
    }

    cmdTouch(args) {
      if (args.length === 0) return { stdout: '', stderr: 'touch: missing file operand' };
      for (const file of args) {
        const existing = this.vfs.getNode(file, this.cwd);
        if (existing) {
          existing.created = new Date().toISOString();
        } else {
          this.vfs.createFile(file, '', this.cwd, this.user);
        }
      }
      return { stdout: '', stderr: '' };
    }

    cmdMkdir(args) {
      const isParents = args.includes('-p');
      const dirs = args.filter(a => !a.startsWith('-'));
      if (dirs.length === 0) return { stdout: '', stderr: 'mkdir: missing operand' };

      for (const d of dirs) {
        const res = this.vfs.createDir(d, this.cwd, this.user);
        if (!res.success && !isParents) {
          return { stdout: '', stderr: `mkdir: cannot create directory '${d}': ${res.error}` };
        }
      }
      return { stdout: '', stderr: '' };
    }

    cmdRm(args) {
      const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-R');
      const targets = args.filter(a => !a.startsWith('-'));
      if (targets.length === 0) return { stdout: '', stderr: 'rm: missing operand' };

      for (const t of targets) {
        const res = this.vfs.removeNode(t, this.cwd, recursive);
        if (!res.success && !args.includes('-f') && !args.includes('-rf')) {
          return { stdout: '', stderr: `rm: cannot remove '${t}': ${res.error}` };
        }
      }
      return { stdout: '', stderr: '' };
    }

    cmdCp(args) {
      const nonFlags = args.filter(a => !a.startsWith('-'));
      if (nonFlags.length < 2) return { stdout: '', stderr: 'cp: missing destination file operand' };
      const src = nonFlags[0];
      const dst = nonFlags[1];

      const srcNode = this.vfs.getNode(src, this.cwd);
      if (!srcNode) return { stdout: '', stderr: `cp: cannot stat '${src}': No such file or directory` };

      if (srcNode.type === 'file') {
        this.vfs.createFile(dst, srcNode.content, this.cwd, this.user);
        return { stdout: '', stderr: '' };
      }
      return { stdout: '', stderr: 'cp: copying directories requires -r' };
    }

    cmdMv(args) {
      const nonFlags = args.filter(a => !a.startsWith('-'));
      if (nonFlags.length < 2) return { stdout: '', stderr: 'mv: missing destination file operand' };
      const src = nonFlags[0];
      const dst = nonFlags[1];

      const srcNode = this.vfs.getNode(src, this.cwd);
      if (!srcNode) return { stdout: '', stderr: `mv: cannot stat '${src}': No such file or directory` };

      this.vfs.createFile(dst, srcNode.content || '', this.cwd, this.user);
      this.vfs.removeNode(src, this.cwd, true);
      return { stdout: '', stderr: '' };
    }

    cmdGrep(args, stdin = '') {
      let ignoreCase = false;
      let invert = false;
      let lineNum = false;
      let pattern = null;
      let filename = null;

      for (const a of args) {
        if (a.startsWith('-')) {
          if (a.includes('i')) ignoreCase = true;
          if (a.includes('v')) invert = true;
          if (a.includes('n')) lineNum = true;
        } else if (!pattern) {
          pattern = a;
        } else {
          filename = a;
        }
      }

      if (!pattern) return { stdout: '', stderr: 'grep: missing pattern' };

      let textToSearch = stdin;
      if (filename) {
        const node = this.vfs.getNode(filename, this.cwd);
        if (!node) return { stdout: '', stderr: `grep: ${filename}: No such file or directory` };
        if (node.type === 'dir') return { stdout: '', stderr: `grep: ${filename}: Is a directory` };
        textToSearch = node.content || '';
      }

      const flags = ignoreCase ? 'i' : '';
      const regex = new RegExp(pattern, flags);
      const lines = textToSearch.split('\n');
      const matches = [];

      lines.forEach((l, idx) => {
        const hit = regex.test(l);
        if ((hit && !invert) || (!hit && invert)) {
          matches.push(lineNum ? `${idx + 1}:${l}` : l);
        }
      });

      return { stdout: matches.join('\n'), stderr: '' };
    }

    cmdHead(args, stdin = '') {
      let count = 10;
      let file = null;
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && args[i + 1]) {
          count = parseInt(args[i + 1], 10) || 10;
          i++;
        } else if (!file) {
          file = args[i];
        }
      }

      let content = stdin;
      if (file) {
        const node = this.vfs.getNode(file, this.cwd);
        if (!node) return { stdout: '', stderr: `head: cannot open '${file}': No such file` };
        content = node.content || '';
      }
      const lines = content.split('\n').slice(0, count);
      return { stdout: lines.join('\n'), stderr: '' };
    }

    cmdTail(args, stdin = '') {
      let count = 10;
      let file = null;
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && args[i + 1]) {
          count = parseInt(args[i + 1], 10) || 10;
          i++;
        } else if (!file) {
          file = args[i];
        }
      }

      let content = stdin;
      if (file) {
        const node = this.vfs.getNode(file, this.cwd);
        if (!node) return { stdout: '', stderr: `tail: cannot open '${file}': No such file` };
        content = node.content || '';
      }
      const lines = content.split('\n');
      const sliced = lines.slice(Math.max(lines.length - count, 0));
      return { stdout: sliced.join('\n'), stderr: '' };
    }

    cmdWc(args, stdin = '') {
      let content = stdin;
      let fileLabel = '';
      if (args.length > 0 && !args[0].startsWith('-')) {
        const node = this.vfs.getNode(args[0], this.cwd);
        if (!node) return { stdout: '', stderr: `wc: ${args[0]}: No such file or directory` };
        content = node.content || '';
        fileLabel = ` ${args[0]}`;
      }
      const lines = content ? content.split('\n').length : 0;
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      const bytes = content.length;
      return { stdout: `${String(lines).padStart(4)} ${String(words).padStart(4)} ${String(bytes).padStart(6)}${fileLabel}`, stderr: '' };
    }

    cmdFind(args) {
      const rootPath = args[0] && !args[0].startsWith('-') ? args[0] : this.cwd;
      const nameIndex = args.indexOf('-name');
      const pattern = nameIndex !== -1 ? args[nameIndex + 1] : null;

      const node = this.vfs.getNode(rootPath, this.cwd);
      if (!node) return { stdout: '', stderr: `find: '${rootPath}': No such file or directory` };

      const results = [];
      const traverse = (curr, currentPath) => {
        if (!pattern || curr.name.includes(pattern)) {
          results.push(currentPath);
        }
        if (curr.type === 'dir' && curr.children) {
          for (const k of Object.keys(curr.children)) {
            traverse(curr.children[k], `${currentPath}/${k}`);
          }
        }
      };
      traverse(node, rootPath);
      return { stdout: results.join('\n'), stderr: '' };
    }

    cmdTree(target = this.cwd) {
      const node = this.vfs.getNode(target, this.cwd);
      if (!node) return { stdout: '', stderr: `tree: '${target}': No such file or directory` };
      if (node.type !== 'dir') return { stdout: target, stderr: '' };

      const lines = [target];
      let dirCount = 0;
      let fileCount = 0;

      const render = (curr, prefix = '') => {
        const keys = Object.keys(curr.children || {});
        keys.forEach((key, idx) => {
          const isLast = idx === keys.length - 1;
          const child = curr.children[key];
          const branch = isLast ? '└── ' : '├── ';
          const nextPrefix = prefix + (isLast ? '    ' : '│   ');

          if (child.type === 'dir') {
            dirCount++;
            lines.push(`${prefix}${branch}${key}/`);
            render(child, nextPrefix);
          } else {
            fileCount++;
            lines.push(`${prefix}${branch}${key}`);
          }
        });
      };

      render(node);
      lines.push(`\n${dirCount} directories, ${fileCount} files`);
      return { stdout: lines.join('\n'), stderr: '' };
    }

    cmdWhich(cmd) {
      if (!cmd) return { stdout: '', stderr: 'which: missing command' };
      const binDir = this.vfs.getNode('/bin');
      if (binDir && binDir.children && binDir.children[cmd]) {
        return { stdout: `/bin/${cmd}`, stderr: '' };
      }
      return { stdout: '', stderr: `which: no ${cmd} in (${this.env.PATH})` };
    }

    cmdUname(args) {
      if (args.includes('-a')) {
        return { stdout: 'Linux scarface-quantum-station 6.10.4-arch1-1-scarface #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux', stderr: '' };
      }
      if (args.includes('-r')) return { stdout: '6.10.4-arch1-1-scarface', stderr: '' };
      if (args.includes('-m')) return { stdout: 'x86_64', stderr: '' };
      return { stdout: 'Linux', stderr: '' };
    }

    cmdUptime() {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      return { stdout: ` ${timeStr} up 16:42,  2 users,  load average: 0.18, 0.12, 0.08`, stderr: '' };
    }

    cmdCal() {
      const now = new Date();
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const month = months[now.getMonth()];
      const year = now.getFullYear();

      const header = `    ${month} ${year}\nSu Mo Tu We Th Fr Sa\n`;
      const firstDay = new Date(year, now.getMonth(), 1).getDay();
      const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

      let body = '   '.repeat(firstDay);
      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = String(d).padStart(2, ' ');
        if (d === now.getDate()) {
          body += `\x1b[7m${dayStr}\x1b[0m `;
        } else {
          body += `${dayStr} `;
        }
        if ((firstDay + d) % 7 === 0) body += '\n';
      }
      return { stdout: header + body.trimEnd(), stderr: '' };
    }

    cmdFree(args) {
      const isMegabytes = args.includes('-m');
      if (isMegabytes) {
        return {
          stdout: '               total        used        free      shared  buff/cache   available\nMem:           32070        8412       17520         420        6138       22890\nSwap:          16384           0       16384',
          stderr: ''
        };
      }
      return {
        stdout: '               total        used        free      shared  buff/cache   available\nMem:        32840520     8614210    17940480      430080     6285830    23439360\nSwap:       16777216           0    16777216',
        stderr: ''
      };
    }

    cmdPs(args) {
      return {
        stdout: 'USER       PID  %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1   0.0  0.1 169210 12040 ?        Ss   04:00   0:01 /sbin/init\nroot       412   0.0  0.2  89400 18200 ?        Ss   04:00   0:00 /usr/lib/systemd/systemd-journald\nsajid     1420   0.1  0.8 742100 68200 tty1     S+   04:02   0:04 /bin/bash\nsajid     1825   0.4  1.2 982100 98400 ?        S    04:05   0:12 node server.js\nsajid     2104   0.0  0.1  38200  8400 tty1     R+   04:18   0:00 ps ' + args.join(' '),
        stderr: ''
      };
    }

    cmdTop() {
      return {
        stdout: 'top - 10:48:20 up 16:42,  2 users,  load average: 0.18, 0.12, 0.08\nTasks: 184 total,   1 running, 183 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  1.8 us,  0.6 sy,  0.0 ni, 97.4 id,  0.2 wa,  0.0 hi,  0.0 si\nMiB Mem :  32070.8 total,  17520.2 free,   8412.4 used,   6138.2 buff/cache\nMiB Swap:  16384.0 total,  16384.0 free,      0.0 used.  22890.6 avail Mem\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1825 sajid     20   0  982100  98400  32100 S   2.4   0.3   0:12.45 node\n 1420 sajid     20   0  742100  68200  18400 S   0.8   0.2   0:04.18 bash\n    1 root      20   0  169210  12040   8900 S   0.0   0.0   0:01.82 systemd',
        stderr: ''
      };
    }

    cmdExport(args) {
      if (args.length === 0) return { stdout: Object.entries(this.env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n'), stderr: '' };
      for (const arg of args) {
        const [k, v] = arg.split('=');
        if (k && v !== undefined) {
          this.env[k] = v.replace(/^["']|["']$/g, '');
        }
      }
      return { stdout: '', stderr: '' };
    }

    cmdAlias(args) {
      if (args.length === 0) {
        return { stdout: Object.entries(this.aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n'), stderr: '' };
      }
      for (const a of args) {
        const [k, v] = a.split('=');
        if (k && v) {
          this.aliases[k] = v.replace(/^["']|["']$/g, '');
        }
      }
      return { stdout: '', stderr: '' };
    }

    cmdHistory(args) {
      if (args.includes('-c')) {
        this.history = [];
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('scarface_cmd_history');
        }
        return { stdout: '', stderr: '' };
      }
      const lines = this.history.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`);
      return { stdout: lines.join('\n'), stderr: '' };
    }

    cmdNeofetch() {
      const art = `
\x1b[36m                   -` + '`' + `                    \x1b[1;36m${this.user}@${this.hostname}\x1b[0m
\x1b[36m                  .o+\`                   ------------------------------\x1b[0m
\x1b[36m                 \`ooo/                   \x1b[36mOS:\x1b[0m Scarface Cyber-OS x86_64
\x1b[36m                \`+oooo:                  \x1b[36mHost:\x1b[0m Quantum Core Workstation v2.6
\x1b[36m               \`+oooooo:                 \x1b[36mKernel:\x1b[0m 6.10.4-arch1-1-scarface
\x1b[36m               -+oooooo+:                \x1b[36mUptime:\x1b[0m 16 hours, 42 mins
\x1b[36m             \`/:-:++oooo+:               \x1b[36mPackages:\x1b[0m 1420 (pacman)
\x1b[36m            \`/++++/+++++++:              \x1b[36mShell:\x1b[0m bash 5.2.26
\x1b[36m           \`/++++++++++++++:             \x1b[36mResolution:\x1b[0m 2560x1440 @ 165Hz
\x1b[36m          \`/+++ooooooooooooo/\`           \x1b[36mDE:\x1b[0m Hyperland-Wayland / Glass HUD
\x1b[36m         ./ooosssso++osssssso+\`          \x1b[36mWM:\x1b[0m Cyber-i3-gaps
\x1b[36m        .oossssso-\`\`\`\`/ossssss+\`         \x1b[36mTheme:\x1b[0m Quantum Obsidian [Electric Cyan]
\x1b[36m       -osssssso.      :ssssssso.        \x1b[36mTerminal:\x1b[0m VT-100 Serial Mainframe
\x1b[36m      :osssssss/        osssso+++.       \x1b[36mCPU:\x1b[0m Intel i9-14900K (24) @ 5.80GHz
\x1b[36m     /ossssssss/        +ssssooo/-       \x1b[36mGPU:\x1b[0m NVIDIA GeForce RTX 4090 24GB
\x1b[36m   \`/ossssso+/:-        -:/+osssso+-     \x1b[36mMemory:\x1b[0m 8412MiB / 32070MiB
\x1b[36m  \`+sso+:-\`                 \`.-/+oso.    
\x1b[36m \`++:.                           \`-/+/   \x1b[40m   \x1b[41m   \x1b[42m   \x1b[43m   \x1b[44m   \x1b[45m   \x1b[46m   \x1b[47m   \x1b[0m
\x1b[36m .\`                                 \`/   \x1b[100m   \x1b[101m   \x1b[102m   \x1b[103m   \x1b[104m   \x1b[105m   \x1b[106m   \x1b[107m   \x1b[0m`;
      return { stdout: art.trim(), stderr: '' };
    }

    startCMatrix() {
      this.mode = 'cmatrix';
      this.clearScreen();
      this.appendLine('*** CMATRIX ACTIVATED — PRESS ANY KEY, "q", OR CTRL+C TO STOP STREAM ***', 'term-green');

      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=~[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテト';
      const termWidth = 64;

      this.cmatrixInterval = setInterval(() => {
        let line = '';
        for (let i = 0; i < termWidth; i++) {
          const r = Math.random();
          if (r < 0.25) {
            line += chars[Math.floor(Math.random() * chars.length)];
          } else {
            line += ' ';
          }
        }
        this.appendLine(line, 'term-matrix');
        if (this.screenEl) this.screenEl.scrollTop = this.screenEl.scrollHeight;
      }, 70);

      const stopHandler = (e) => {
        window.removeEventListener('keydown', stopHandler);
        this.stopCMatrix();
      };
      window.addEventListener('keydown', stopHandler);
    }

    stopCMatrix() {
      if (this.cmatrixInterval) {
        clearInterval(this.cmatrixInterval);
        this.cmatrixInterval = null;
      }
      this.mode = 'shell';
      this.appendLine('*** STREAM TERMINATED ***', 'term-cyan');
      this.updatePrompt();
    }

    cmdCowsay(msg) {
      const len = msg.length;
      const border = '-'.repeat(len + 2);
      const bubble = ` ${border}\n< ${msg} >\n ${border}\n`;
      const cow = `        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n`;
      return { stdout: bubble + cow, stderr: '' };
    }

    cmdFortune() {
      const fortunes = [
        '"There are 10 types of people in the world: those who understand binary, and those who do not."',
        '"Premature optimization is the root of all evil." — Donald Knuth',
        '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
        '"Unix is simple. It just takes a genius to understand its simplicity." — Dennis Ritchie',
        '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
        '"Talk is cheap. Show me the code." — Linus Torvalds'
      ];
      return { stdout: fortunes[Math.floor(Math.random() * fortunes.length)], stderr: '' };
    }

    cmdSl() {
      const train = `
      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ _____ |   (|) |      |
   /     |  |   H  |  |     |   | |       |      |
  |      |  |   H  |__--------------------|______|
  | ________|___H__/__|_____/[][]~\\_______|_____|
  |/ |   |_____I_____I_____I_____I_____I_____|
__/__/__/__/__/__/__/__/__/__/__/__/__/__/__/____
      (O)  (O)        (O)(O)           (O)(O)   (O)(O)
`;
      return { stdout: train, stderr: '' };
    }

    cmdCurl(args) {
      const url = args.find(a => !a.startsWith('-'));
      if (!url) return { stdout: '', stderr: 'curl: try \'curl --help\' for more information' };

      if (url.includes('scarface') || url.includes('portfolio')) {
        return {
          stdout: JSON.stringify({
            status: 200,
            station: "Scarface Lab Mainframe",
            author: "Mir A K Sajid",
            uptime: "99.99%",
            clusters: ["Dhaka-1", "Vercel-Edge", "Cyber-Node-0"]
          }, null, 2),
          stderr: ''
        };
      }
      return {
        stdout: `HTTP/2 200 OK\nserver: scarface-edge/2.6\ndate: ${new Date().toUTCString()}\ncontent-type: application/json; charset=utf-8\ncache-control: public, max-age=3600\n\n{\n  "status": "connected",\n  "remote_endpoint": "${url}",\n  "latency_ms": 14.8\n}`,
        stderr: ''
      };
    }

    cmdPing(args) {
      const host = args.find(a => !a.startsWith('-')) || 'scarface.lab';
      const lines = [
        `PING ${host} (192.168.1.100) 56(84) bytes of data.`,
        `64 bytes from 192.168.1.100: icmp_seq=1 ttl=64 time=0.421 ms`,
        `64 bytes from 192.168.1.100: icmp_seq=2 ttl=64 time=0.384 ms`,
        `64 bytes from 192.168.1.100: icmp_seq=3 ttl=64 time=0.395 ms`,
        `64 bytes from 192.168.1.100: icmp_seq=4 ttl=64 time=0.412 ms`,
        `--- ${host} ping statistics ---`,
        `4 packets transmitted, 4 received, 0% packet loss, time 3004ms`,
        `rtt min/avg/max/mdev = 0.384/0.403/0.421/0.015 ms`
      ];
      return { stdout: lines.join('\n'), stderr: '' };
    }

    cmdIfconfig() {
      return {
        stdout: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::4a21:eff:fe98:1204  prefixlen 64  scopeid 0x20<link>\n        ether 48:21:0e:98:12:04  txqueuelen 1000  (Ethernet)\n        RX packets 94210  bytes 84210048 (80.3 MiB)\n        TX packets 58210  bytes 34210984 (32.6 MiB)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        inet6 ::1  prefixlen 128  scopeid 0x10<host>\n        loop  txqueuelen 1000  (Local Loopback)`,
        stderr: ''
      };
    }

    // ========================================================================
    // Python & Node Interpreters & Script Runners
    // ========================================================================
    cmdPython(args) {
      // One-liner: python3 -c "print(1+1)"
      const cIdx = args.indexOf('-c');
      if (cIdx !== -1 && args[cIdx + 1]) {
        const code = args.slice(cIdx + 1).join(' ').replace(/^["']|["']$/g, '');
        return this.runPythonCode(code);
      }

      // Script file: python3 script.py
      const scriptFile = args.find(a => !a.startsWith('-'));
      if (scriptFile) {
        const node = this.vfs.getNode(scriptFile, this.cwd);
        if (!node) return { stdout: '', stderr: `python3: can't open file '${scriptFile}': No such file or directory` };
        return this.runPythonCode(node.content || '');
      }

      // Launch interactive Python REPL
      this.mode = 'python_repl';
      this.updatePrompt();
      return {
        stdout: 'Python 3.12.4 (main, Jun  7 2024, 06:33:07) [GCC 14.1.1 20240522] on linux\nType "help", "copyright", "credits" or "license" for more information.\nType "exit()" or press Ctrl+C to return to bash shell.',
        stderr: ''
      };
    }

    executePythonRepl(input) {
      if (input === 'exit()' || input === 'quit()' || input === 'exit' || input === 'quit') {
        this.exitRepl();
        return;
      }
      const res = this.runPythonCode(input);
      if (res.stdout) this.appendLine(res.stdout);
      if (res.stderr) this.appendLine(res.stderr, 'term-error');
    }

    runPythonCode(code) {
      const logs = [];
      try {
        // Safe Python-to-JS bridge evaluator
        const pyPrint = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        const pyLen = (obj) => obj?.length ?? Object.keys(obj || {}).length;
        const pyRange = (start, stop, step = 1) => {
          if (stop === undefined) { stop = start; start = 0; }
          const res = [];
          for (let i = start; step > 0 ? i < stop : i > stop; i += step) res.push(i);
          return res;
        };
        const pySum = (arr) => arr.reduce((a, b) => a + b, 0);

        // Preprocess Python math / syntax expressions
        let jsCode = code
          .replace(/print\((.*?)\)/g, 'print($1)')
          .replace(/True/g, 'true')
          .replace(/False/g, 'false')
          .replace(/None/g, 'null')
          .replace(/\bdef\s+([a-zA-Z0-9_]+)\s*\((.*?)\):/g, 'function $1($2) {')
          .replace(/\belif\b/g, 'else if');

        const sandbox = {
          print: pyPrint,
          len: pyLen,
          range: pyRange,
          sum: pySum,
          math: Math,
          time: { time: () => Date.now() / 1000 },
          ...this.pythonScope
        };

        const fn = new Function(...Object.keys(sandbox), `
          try {
            ${jsCode.includes('return') || jsCode.includes(';') || jsCode.includes('\n') || jsCode.includes('=') ? jsCode : 'return (' + jsCode + ');'}
          } catch(e) {
            throw e;
          }
        `);

        const result = fn(...Object.values(sandbox));
        if (result !== undefined && logs.length === 0) {
          logs.push(typeof result === 'object' ? JSON.stringify(result) : String(result));
        }
        return { stdout: logs.join('\n'), stderr: '' };
      } catch (err) {
        return { stdout: logs.join('\n'), stderr: `Traceback (most recent call last):\n  File "<stdin>", line 1\nSyntaxError: ${err.message}` };
      }
    }

    cmdNode(args) {
      // One-liner: node -e "console.log(1+1)"
      const eIdx = args.indexOf('-e');
      if (eIdx !== -1 && args[eIdx + 1]) {
        const code = args.slice(eIdx + 1).join(' ').replace(/^["']|["']$/g, '');
        return this.runNodeCode(code);
      }

      // Script file: node app.js
      const scriptFile = args.find(a => !a.startsWith('-'));
      if (scriptFile) {
        const node = this.vfs.getNode(scriptFile, this.cwd);
        if (!node) return { stdout: '', stderr: `node: cannot find module '${scriptFile}'` };
        return this.runNodeCode(node.content || '');
      }

      // Interactive Node REPL
      this.mode = 'node_repl';
      this.updatePrompt();
      return {
        stdout: 'Welcome to Node.js v20.15.0.\nType ".help" for more information.\nType ".exit" or press Ctrl+C to return to bash shell.',
        stderr: ''
      };
    }

    executeNodeRepl(input) {
      if (input === '.exit' || input === 'exit' || input === 'quit') {
        this.exitRepl();
        return;
      }
      const res = this.runNodeCode(input);
      if (res.stdout) this.appendLine(res.stdout);
      if (res.stderr) this.appendLine(res.stderr, 'term-error');
    }

    runNodeCode(code) {
      const logs = [];
      const customConsole = {
        log: (...a) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' ')),
        error: (...a) => logs.push('[ERROR] ' + a.join(' ')),
        warn: (...a) => logs.push('[WARN] ' + a.join(' '))
      };

      try {
        const fn = new Function('console', `
          try {
            ${code.includes('return') || code.includes(';') || code.includes('\n') || code.includes('let ') || code.includes('const ') || code.includes('var ') ? code : 'return (' + code + ');'}
          } catch(e) { throw e; }
        `);
        const res = fn(customConsole);
        if (res !== undefined && logs.length === 0) {
          logs.push(typeof res === 'object' ? JSON.stringify(res, null, 2) : String(res));
        }
        return { stdout: logs.join('\n'), stderr: '' };
      } catch (err) {
        return { stdout: logs.join('\n'), stderr: `Uncaught Exception: ${err.message}` };
      }
    }

    cmdBash(args) {
      const scriptFile = args.find(a => !a.startsWith('-'));
      if (!scriptFile) return { stdout: 'GNU bash, version 5.2.26(1)-release (x86_64-pc-linux-gnu)', stderr: '' };
      return this.cmdExecuteScriptFile(scriptFile);
    }

    cmdExecuteScriptFile(pathStr) {
      const node = this.vfs.getNode(pathStr, this.cwd);
      if (!node) return { stdout: '', stderr: `bash: ${pathStr}: No such file or directory` };
      if (node.type === 'dir') return { stdout: '', stderr: `bash: ${pathStr}: Is a directory` };

      // If python script
      if (pathStr.endsWith('.py')) {
        return this.runPythonCode(node.content || '');
      }

      // If js script
      if (pathStr.endsWith('.js')) {
        return this.runNodeCode(node.content || '');
      }

      // Otherwise execute line-by-line bash
      const lines = (node.content || '').split('\n');
      const outputs = [];
      for (const line of lines) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const res = this.runSingleCommand(t, '');
        if (res.stdout) outputs.push(res.stdout);
        if (res.stderr) outputs.push(res.stderr);
      }
      return { stdout: outputs.join('\n'), stderr: '' };
    }

    exitRepl() {
      this.mode = 'shell';
      this.updatePrompt();
    }

    // ========================================================================
    // In-Terminal Text Editor (Nano / Vim)
    // ========================================================================
    openNanoEditor(filename) {
      if (!filename) {
        this.appendLine('nano: missing filename operand', 'term-error');
        return;
      }

      this.mode = 'nano';
      this.nanoFile = filename;

      const node = this.vfs.getNode(filename, this.cwd);
      const initialContent = node ? (node.content || '') : '';

      // Check if modal container exists or build inline
      let editorContainer = document.getElementById('termNanoEditorContainer');
      if (!editorContainer) {
        editorContainer = document.createElement('div');
        editorContainer.id = 'termNanoEditorContainer';
        editorContainer.className = 'terminal-nano-editor';
        if (this.screenEl) this.screenEl.appendChild(editorContainer);
      }

      editorContainer.style.display = 'flex';
      editorContainer.innerHTML = `
        <div class="nano-top-bar">
          <span class="nano-badge">GNU nano 7.2</span>
          <span class="nano-file-title">File: ${filename} ${node ? '' : '[New File]'}</span>
          <span class="nano-status" id="nanoStatusIndicator">Modified: False</span>
        </div>
        <textarea class="nano-textarea" id="nanoTextarea" spellcheck="false" placeholder="Type shell script or code here...">${this.escape(initialContent)}</textarea>
        <div class="nano-bottom-bar">
          <div class="nano-keys">
            <span class="nano-key"><b>^O</b> WriteOut</span>
            <span class="nano-key"><b>^X</b> Exit</span>
            <span class="nano-key"><b>^K</b> Cut</span>
            <span class="nano-key"><b>^U</b> Paste</span>
          </div>
          <div class="nano-actions">
            <button type="button" class="vintage-btn btn-sm" id="nanoSaveBtn" style="padding: 0.2rem 0.6rem; font-size: 0.75rem; background: rgba(16,185,129,0.2); border-color: #10b981; color: #10b981;">💾 Save File (^O)</button>
            <button type="button" class="vintage-btn btn-sm" id="nanoCloseBtn" style="padding: 0.2rem 0.6rem; font-size: 0.75rem; background: rgba(239,68,68,0.2); border-color: #ef4444; color: #ef4444;">✕ Exit (^X)</button>
          </div>
        </div>
      `;

      const textarea = editorContainer.querySelector('#nanoTextarea');
      const statusEl = editorContainer.querySelector('#nanoStatusIndicator');
      const saveBtn = editorContainer.querySelector('#nanoSaveBtn');
      const closeBtn = editorContainer.querySelector('#nanoCloseBtn');

      textarea.focus();

      textarea.addEventListener('input', () => {
        if (statusEl) statusEl.textContent = 'Modified: True';
      });

      const doSave = () => {
        const content = textarea.value;
        const existing = this.vfs.getNode(filename, this.cwd);
        if (existing) {
          existing.content = content;
          existing.size = content.length;
          existing.created = new Date().toISOString();
          this.vfs.save();
        } else {
          this.vfs.createFile(filename, content, this.cwd, this.user);
        }
        if (statusEl) statusEl.textContent = `[ Wrote ${content.split('\n').length} lines ]`;
      };

      const doClose = () => {
        editorContainer.style.display = 'none';
        this.mode = 'shell';
        this.appendLine(`[ nano: closed file ${filename} ]`, 'term-cyan');
        this.updatePrompt();
        if (this.inputEl) this.inputEl.focus();
      };

      saveBtn.addEventListener('click', doSave);
      closeBtn.addEventListener('click', doClose);

      textarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'o') {
          e.preventDefault();
          doSave();
        } else if (e.ctrlKey && e.key.toLowerCase() === 'x') {
          e.preventDefault();
          doClose();
        }
      });
    }

    cmdSudo(args) {
      if (args.length === 0) return { stdout: 'usage: sudo [-u user] command', stderr: '' };
      if (args[0] === 'su' || args[0] === '-i') {
        this.user = 'root';
        this.env.USER = 'root';
        this.updatePrompt();
        return { stdout: 'Session upgraded to root privileges (UID 0).', stderr: '' };
      }
      return this.runSingleCommand(args.join(' '), '');
    }

    cmdHelp() {
      const text = `
========================= POSIX LINUX SHELL MANUAL =========================
COMMAND               DESCRIPTION
----------------------------------------------------------------------------
ls [-la] [path]       List directory contents with permissions & colors
cd [dir]              Change working directory (supports ~, .., -)
pwd                   Print absolute working directory path
cat <file>            Concatenate and display file content
touch <file>          Create empty file or update timestamp
mkdir [-p] <dir>      Create one or more directories
rm [-rf] <path>       Remove file or directory hierarchy
cp [-r] <src> <dst>   Copy files or directories
mv <src> <dst>        Move or rename file or directory
echo [text]           Print text with $VAR substitution
grep [-ivn] <pat>     Search file or piped stream for regular expression
head / tail [-n N]    Print first or last N lines of file or stdin
wc [-lwc] [file]      Count lines, words, and byte length
find [dir] [-name]    Search directory tree for files matching pattern
tree [dir]            Display hierarchical visual directory tree
which <cmd>           Locate command binary path in environment

INTERPRETERS & LIVE PROGRAMMING
----------------------------------------------------------------------------
python3 / python      Launch interactive Python REPL or run with -c
node / js             Launch interactive Node.js REPL or run with -e
bash / sh <file.sh>   Execute shell script line-by-line
nano / vim <file>     In-terminal interactive text editor with live save
Pipes (|)             Chain commands: cat resume.md | grep "GPA"
Redirection (> / >>)  Redirect output to files: echo "Hello" > test.txt

SYSTEM TELEMETRY & HARDWARE
----------------------------------------------------------------------------
whoami / id           Display active user identity and security groups
uname [-a]            Print operating system and kernel release
uptime                Report system uptime and rolling load averages
date / cal            Display system timestamp or calendar grid
free [-m]             Display memory & swap telemetry
df [-h]               Report filesystem disk usage
top / ps aux          Report active process table and CPU consumption
env / export          Display or configure environment variables
history               Display numbered command history buffer

CYBER UTILITIES & HACKS
----------------------------------------------------------------------------
neofetch              Full-color ASCII Arch/Cyber-OS hardware badge
cmatrix               Live Matrix green glyph falling rain (Ctrl+C to quit)
cowsay <text>         ASCII cow dialogue box
fortune               Random Unix hacker wisdom & tech aphorisms
sl                    Steam locomotive ASCII animation
curl / ping <target>  Network diagnostic utilities & probes
clear                 Flush teletype terminal output buffer
admin                 Quick dispatch to Station Master Admin Desk
============================================================================
`;
      return { stdout: text.trim(), stderr: '' };
    }

    cmdProjects() {
      const pDir = this.vfs.getNode('/home/sajid/projects');
      if (!pDir || !pDir.children) return { stdout: 'No projects found.', stderr: '' };
      const list = Object.keys(pDir.children).map(k => `  • ${k}`).join('\n');
      return { stdout: `ACTIVE SYSTEM BLUEPRINTS:\n${list}\n(Type "cat projects/<name>" to view details)`, stderr: '' };
    }

    cmdSkills() {
      const node = this.vfs.getNode('/home/sajid/skills/languages.txt');
      return { stdout: `TECHNICAL COMPETENCY MATRIX:\n${node ? node.content : 'Systems: C, C++, Rust, Python, Go, Linux'}`, stderr: '' };
    }

    // ========================================================================
    // Output Rendering & Helper Utilities
    // ========================================================================
    appendLine(text, className = '') {
      if (!this.outputEl) return;
      const line = document.createElement('div');
      line.className = `term-line ${className}`.trim();
      line.innerHTML = this.formatAnsi(text);
      this.outputEl.appendChild(line);

      if (this.screenEl) {
        this.screenEl.scrollTop = this.screenEl.scrollHeight;
      }
    }

    clearScreen() {
      if (!this.outputEl) return;
      this.outputEl.innerHTML = '';
      this.appendLine(`=== VINTAGE CSE TELETYPE CLUSTER (VT-100 / x86_64) ===`, 'term-dim');
      this.appendLine(`Type "help" to review installed routines or "neofetch" for system telemetry.`, 'term-dim');
    }

    tokenize(str) {
      const tokens = [];
      let curr = '';
      let inQuote = null;

      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (inQuote) {
          if (c === inQuote) {
            inQuote = null;
          } else {
            curr += c;
          }
        } else if (c === '"' || c === "'") {
          inQuote = c;
        } else if (/\s/.test(c)) {
          if (curr.length > 0) {
            tokens.push(curr);
            curr = '';
          }
        } else {
          curr += c;
        }
      }
      if (curr.length > 0) tokens.push(curr);
      return tokens;
    }

    expandVariables(str) {
      return str.replace(/\$([a-zA-Z0-9_]+)/g, (match, varName) => {
        return this.env[varName] !== undefined ? this.env[varName] : '';
      });
    }

    formatDate(isoStr) {
      const d = isoStr ? new Date(isoStr) : new Date();
      const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
      const day = String(d.getDate()).padStart(2, ' ');
      const hour = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${m} ${day} ${hour}:${min}`;
    }

    escape(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag));
    }

    formatAnsi(text) {
      if (!text) return '';
      let escaped = this.escape(text);

      // ANSI color codes to HTML spans
      escaped = escaped
        .replace(/\x1b\[36m/g, '<span style="color:#00f0ff;">')
        .replace(/\x1b\[1;36m/g, '<span style="color:#00f0ff;font-weight:700;">')
        .replace(/\x1b\[32m/g, '<span style="color:#10b981;">')
        .replace(/\x1b\[34m/g, '<span style="color:#60a5fa;">')
        .replace(/\x1b\[31m/g, '<span style="color:#ef4444;">')
        .replace(/\x1b\[33m/g, '<span style="color:#f59e0b;">')
        .replace(/\x1b\[7m/g, '<span style="background:#00f0ff;color:#050711;padding:0 2px;">')
        .replace(/\x1b\[40m/g, '<span style="background:#000000;padding:0 3px;">')
        .replace(/\x1b\[41m/g, '<span style="background:#ef4444;padding:0 3px;">')
        .replace(/\x1b\[42m/g, '<span style="background:#10b981;padding:0 3px;">')
        .replace(/\x1b\[43m/g, '<span style="background:#f59e0b;padding:0 3px;">')
        .replace(/\x1b\[44m/g, '<span style="background:#3b82f6;padding:0 3px;">')
        .replace(/\x1b\[45m/g, '<span style="background:#a855f7;padding:0 3px;">')
        .replace(/\x1b\[46m/g, '<span style="background:#06b6d4;padding:0 3px;">')
        .replace(/\x1b\[47m/g, '<span style="background:#f8fafc;padding:0 3px;">')
        .replace(/\x1b\[100m/g, '<span style="background:#475569;padding:0 3px;">')
        .replace(/\x1b\[101m/g, '<span style="background:#f87171;padding:0 3px;">')
        .replace(/\x1b\[102m/g, '<span style="background:#34d399;padding:0 3px;">')
        .replace(/\x1b\[103m/g, '<span style="background:#fbbf24;padding:0 3px;">')
        .replace(/\x1b\[104m/g, '<span style="background:#60a5fa;padding:0 3px;">')
        .replace(/\x1b\[105m/g, '<span style="background:#c084fc;padding:0 3px;">')
        .replace(/\x1b\[106m/g, '<span style="background:#22d3ee;padding:0 3px;">')
        .replace(/\x1b\[107m/g, '<span style="background:#ffffff;padding:0 3px;">')
        .replace(/\x1b\[0m/g, '</span>');

      return escaped;
    }
  }

  return {
    VirtualFS,
    LinuxTerminalVM
  };
});
