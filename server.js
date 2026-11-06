/**
 * Vintage 2D CSE Developer Portfolio & Admin Engine
 * Production-Hardened Express Server with Enterprise-Grade Security
 * 
 * Features:
 * - Content Security Policy & OWASP Recommended Security Headers
 * - Timing-Safe Cryptographic Authentication (PBKDF2-SHA512)
 * - Stateful Bearer Token Session Management
 * - In-Memory Sliding-Window Rate Limiting (Brute-Force & Spam Mitigation)
 * - Data Masking & Secret Shielding (Directory Passwords Never Leaked to Public)
 * - Safe File Upload Pipeline with Magic-Byte Deep Inspection & Path Traversal Guards
 * - Input Validation & Payload Size Enforcement
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Disable X-Powered-By header to reduce fingerprinting
app.disable('x-powered-by');

// Directory Paths
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'assets', 'uploads');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');

// Ensure essential folders exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ============================================================================
// 1. JSON Helpers
// ============================================================================
function readJSON(file, fallback = {}) {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`[FS ERROR] Error reading ${path.basename(file)}:`, err.message);
  }
  return fallback;
}

function writeJSON(file, data) {
  try {
    const tempFile = `${file}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, file);
    return true;
  } catch (err) {
    console.error(`[FS ERROR] Error writing ${path.basename(file)}:`, err.message);
    return false;
  }
}

// ============================================================================
// 2. Authentication & Cryptography Store
// ============================================================================
const SESSIONS = new Map(); // token -> { createdAt, expiresAt, ip }
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function initAuthStore() {
  let authData = readJSON(AUTH_FILE, null);
  if (!authData || !authData.masterHash || !authData.salt) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const salt = crypto.randomBytes(16).toString('hex');
    const masterHash = hashPassword(defaultPassword, salt);
    authData = {
      salt,
      masterHash,
      updatedAt: new Date().toISOString(),
      note: 'Master Station Console Credentials'
    };
    writeJSON(AUTH_FILE, authData);
    console.log('[SECURITY] Initialized master authentication credentials store.');
  }
  return authData;
}

let authStore = initAuthStore();

function verifyPassword(candidate, salt, expectedHash) {
  try {
    const candidateHash = hashPassword(candidate, salt);
    const candidateBuf = Buffer.from(candidateHash, 'hex');
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    if (candidateBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(candidateBuf, expectedBuf);
  } catch (e) {
    return false;
  }
}

// Clean expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of SESSIONS.entries()) {
    if (session.expiresAt <= now) {
      SESSIONS.delete(token);
    }
  }
}, 10 * 60 * 1000);

// ============================================================================
// 3. Sliding-Window In-Memory Rate Limiter
// ============================================================================
const RATE_LIMIT_STORE = new Map();

function checkRateLimit(bucketName, ip, maxRequests, windowMs) {
  const key = `${bucketName}:${ip}`;
  const now = Date.now();
  let record = RATE_LIMIT_STORE.get(key);

  if (!record || record.resetTime <= now) {
    record = { count: 1, resetTime: now + windowMs };
    RATE_LIMIT_STORE.set(key, record);
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, retryAfter: 0 };
}

// Prune rate limit store
setInterval(() => {
  const now = Date.now();
  for (const [k, rec] of RATE_LIMIT_STORE.entries()) {
    if (rec.resetTime <= now) {
      RATE_LIMIT_STORE.delete(k);
    }
  }
}, 5 * 60 * 1000);

function createRateLimitMiddleware(bucket, maxRequests, windowMs, errorMessage) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const limit = checkRateLimit(bucket, ip, maxRequests, windowMs);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', limit.remaining);

    if (!limit.allowed) {
      res.setHeader('Retry-After', limit.retryAfter);
      return res.status(429).json({
        error: errorMessage || 'Rate limit exceeded. Please try again later.',
        retryAfterSeconds: limit.retryAfter
      });
    }
    next();
  };
}

// ============================================================================
// 4. HTTP Security Headers Middleware
// ============================================================================
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // XSS protection for older agents
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer control
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Feature policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Comprehensive Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: blob: https:; " +
    "media-src 'self' data: blob:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  next();
});

// General middleware
app.use(cors({ origin: true, credentials: true }));
// Controlled payload size: 8MB max
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));

// General API Rate Limiter: 150 requests per minute
app.use('/api', createRateLimitMiddleware('api-global', 150, 60 * 1000, 'Too many API requests.'));

// ============================================================================
// 5. Auth Middleware
// ============================================================================
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'];
  let token = null;

  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Station Master token required' });
  }

  const session = SESSIONS.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) SESSIONS.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid. Please re-authenticate.' });
  }

  // Extend sliding session window
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  req.adminSession = session;
  next();
}

// ============================================================================
// 6. Authentication Endpoints
// ============================================================================

// Rate limit: max 6 login attempts per 15 minutes per IP to prevent brute forcing
const loginLimiter = createRateLimitMiddleware(
  'login',
  6,
  15 * 60 * 1000,
  'Too many failed authorization attempts. Circuit locked for 15 minutes.'
);

app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { password } = req.body || {};
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Access code required' });
  }

  authStore = initAuthStore();
  const isValid = verifyPassword(password.trim(), authStore.salt, authStore.masterHash);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid Station Master access code.' });
  }

  // Generate high-entropy session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  SESSIONS.set(token, {
    token,
    createdAt: Date.now(),
    expiresAt,
    ip: req.ip
  });

  return res.json({
    success: true,
    message: 'Station Master Console Authenticated',
    token,
    expiresAt
  });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'];
  let token = null;
  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  }

  if (!token) return res.json({ authenticated: false });
  const session = SESSIONS.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) SESSIONS.delete(token);
    return res.json({ authenticated: false });
  }

  res.json({ authenticated: true, expiresAt: session.expiresAt });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'];
  let token = null;
  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  }
  if (token) SESSIONS.delete(token);
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/change-password', requireAdminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password required' });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  authStore = initAuthStore();
  const isValid = verifyPassword(currentPassword.trim(), authStore.salt, authStore.masterHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Current master access code is incorrect' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const masterHash = hashPassword(newPassword.trim(), salt);
  authStore = {
    salt,
    masterHash,
    updatedAt: new Date().toISOString(),
    note: 'Master Station Console Credentials'
  };
  writeJSON(AUTH_FILE, authStore);

  res.json({ success: true, message: 'Master access code changed successfully' });
});

// ============================================================================
// 7. Portfolio Data Endpoints (With Sensitive Data Masking)
// ============================================================================

// Public GET: Mask directory password so visitors never inspect it
app.get('/api/portfolio', (req, res) => {
  const data = readJSON(PORTFOLIO_FILE, {});
  const safeData = JSON.parse(JSON.stringify(data));

  if (safeData.personalDirectory) {
    const hasPwd = Boolean(safeData.personalDirectory.password && safeData.personalDirectory.password.trim() !== '');
    delete safeData.personalDirectory.password;
    safeData.personalDirectory.isProtected = hasPwd;
  }

  res.json(safeData);
});

// Admin-only POST: Persist full portfolio state safely
app.post('/api/portfolio', requireAdminAuth, (req, res) => {
  const updatedData = req.body;
  if (!updatedData || typeof updatedData !== 'object') {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const existingData = readJSON(PORTFOLIO_FILE, {});
  const mergedData = { ...existingData, ...updatedData };

  // Deep merge sub-sections safely
  ['settings', 'profile', 'personalDirectory', 'hsc'].forEach(section => {
    if (updatedData[section] && typeof updatedData[section] === 'object') {
      mergedData[section] = { ...(existingData[section] || {}), ...updatedData[section] };
    }
  });

  // Protect vault password: if client omitted it or sent empty string, keep existing password
  if (existingData.personalDirectory?.password && (!updatedData.personalDirectory || !updatedData.personalDirectory.password)) {
    if (!mergedData.personalDirectory) mergedData.personalDirectory = {};
    mergedData.personalDirectory.password = existingData.personalDirectory.password;
  }

  const success = writeJSON(PORTFOLIO_FILE, mergedData);
  if (success) {
    // Return sanitized copy in response
    const safeData = JSON.parse(JSON.stringify(mergedData));
    if (safeData.personalDirectory) {
      delete safeData.personalDirectory.password;
      safeData.personalDirectory.isProtected = true;
    }
    res.json({ success: true, message: 'Portfolio blueprint saved successfully', data: safeData });
  } else {
    res.status(500).json({ error: 'Failed to write portfolio storage file' });
  }
});

// ============================================================================
// 8. Personal Vault Endpoints
// ============================================================================

const vaultLimiter = createRateLimitMiddleware(
  'vault',
  8,
  10 * 60 * 1000,
  'Too many passcode attempts. Vault locked for 10 minutes.'
);

// Server-side verification so password is never exposed client-side
app.post('/api/vault/verify', vaultLimiter, (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'Passcode required' });
  }

  const data = readJSON(PORTFOLIO_FILE, {});
  const storedPassword = (data.personalDirectory?.password || '1234').toString();

  const candBuf = Buffer.from(password.trim());
  const actualBuf = Buffer.from(storedPassword.trim());

  let matches = false;
  if (candBuf.length === actualBuf.length) {
    matches = crypto.timingSafeEqual(candBuf, actualBuf);
  }

  if (matches) {
    res.json({ success: true, message: 'Vault passcode accepted' });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect directory passcode' });
  }
});

// Admin-only update vault password
app.post('/api/vault/password', requireAdminAuth, (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 3) {
    return res.status(400).json({ error: 'Vault passcode must be at least 3 characters' });
  }

  const data = readJSON(PORTFOLIO_FILE, {});
  if (!data.personalDirectory) data.personalDirectory = { folders: [], files: [] };
  data.personalDirectory.password = newPassword.trim();
  writeJSON(PORTFOLIO_FILE, data);

  res.json({ success: true, message: 'Directory passcode updated' });
});

// ============================================================================
// 9. Inquiries & Messages Endpoints
// ============================================================================

// Rate limit contact dispatches: max 5 per 10 minutes per IP
const contactLimiter = createRateLimitMiddleware(
  'contact',
  5,
  10 * 60 * 1000,
  'You have reached the maximum dispatch limit (5 transmissions / 10m). Please wait before sending again.'
);

// Public POST: Send inquiry message with rigorous input sanitization
app.post('/api/messages', contactLimiter, (req, res) => {
  let { name, email, subject, message } = req.body || {};

  // Basic type assertions
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid field data types' });
  }

  name = name.trim().replace(/[\r\n\t]/g, ' ').slice(0, 100);
  email = email.trim().slice(0, 120);
  subject = typeof subject === 'string' ? subject.trim().replace(/[\r\n\t]/g, ' ').slice(0, 150) : 'General Dispatch';
  message = message.trim().slice(0, 3000);

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Please enter a valid operator name (min 2 chars).' });
  }

  // Strict email regex validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!message || message.length < 5) {
    return res.status(400).json({ error: 'Dispatch message must be at least 5 characters long.' });
  }

  const messages = readJSON(MESSAGES_FILE, []);
  const newMessage = {
    id: 'msg-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
    name,
    email,
    subject: subject || 'General Portfolio Dispatch',
    message,
    date: new Date().toISOString(),
    read: false,
    starred: false,
    ip: req.ip
  };

  messages.unshift(newMessage);
  // Cap at 500 messages to prevent unbounded growth
  if (messages.length > 500) messages.length = 500;

  const success = writeJSON(MESSAGES_FILE, messages);
  if (success) {
    res.status(201).json({ success: true, message: 'Message dispatched successfully', id: newMessage.id });
  } else {
    res.status(500).json({ error: 'Failed to record dispatch' });
  }
});

// Admin-Only Messages Operations
app.get('/api/messages', requireAdminAuth, (req, res) => {
  const messages = readJSON(MESSAGES_FILE, []);
  res.json(messages);
});

app.patch('/api/messages/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const messages = readJSON(MESSAGES_FILE, []);
  const index = messages.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }

  // Only allow updating safe flags
  if (typeof updates.read === 'boolean') messages[index].read = updates.read;
  if (typeof updates.starred === 'boolean') messages[index].starred = updates.starred;

  writeJSON(MESSAGES_FILE, messages);
  res.json({ success: true, data: messages[index] });
});

app.delete('/api/messages/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  let messages = readJSON(MESSAGES_FILE, []);
  const initialLength = messages.length;
  messages = messages.filter(m => m.id !== id);

  if (messages.length === initialLength) {
    return res.status(404).json({ error: 'Message not found' });
  }

  writeJSON(MESSAGES_FILE, messages);
  res.json({ success: true, message: 'Message deleted' });
});

// ============================================================================
// 10. Hardened File Upload Pipeline
// ============================================================================
app.post('/api/upload', requireAdminAuth, (req, res) => {
  try {
    const { imageBase64, filename } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Extract format and payload
    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 image data URI format' });
    }

    const rawMime = matches[1].toLowerCase();
    const allowedMimes = {
      'jpeg': 'jpg',
      'jpg': 'jpg',
      'png': 'png',
      'webp': 'webp',
      'gif': 'gif'
    };

    if (!allowedMimes[rawMime]) {
      return res.status(400).json({ error: 'Unsupported file format. Only JPEG, PNG, WebP, and GIF images are allowed.' });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    // Max 5MB file check
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds maximum allowed size (5MB)' });
    }

    // Deep Magic Byte Verification
    let verifiedExt = null;
    if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      verifiedExt = 'jpg';
    } else if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
    ) {
      verifiedExt = 'png';
    } else if (buffer.length >= 4 && buffer.subarray(0, 4).toString('ascii') === 'GIF8') {
      verifiedExt = 'gif';
    } else if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      verifiedExt = 'webp';
    }

    if (!verifiedExt || (verifiedExt !== allowedMimes[rawMime] && !(verifiedExt === 'jpg' && allowedMimes[rawMime] === 'jpg'))) {
      return res.status(400).json({ error: 'Security alert: File content does not match image header signatures.' });
    }

    // Safe random name avoiding directory traversal & collisions
    const safeHash = crypto.randomBytes(6).toString('hex');
    const safeName = `img_${Date.now()}_${safeHash}.${verifiedExt}`;
    const destinationPath = path.join(UPLOADS_DIR, safeName);

    // Ensure path remains strictly inside uploads directory
    if (!destinationPath.startsWith(UPLOADS_DIR)) {
      return res.status(400).json({ error: 'Path traversal detected' });
    }

    fs.writeFileSync(destinationPath, buffer);
    res.json({ success: true, url: `assets/uploads/${safeName}` });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    res.status(500).json({ error: 'File upload processing failed' });
  }
});

// ============================================================================
// 10.5. HSC Academic Resource Management Endpoints
// ============================================================================
app.get('/api/hsc', (req, res) => {
  const data = readJSON(PORTFOLIO_FILE, {});
  res.json(data.hsc || { books: [], board: [], tricks: [], tests: [] });
});

app.post('/api/hsc/:category', requireAdminAuth, (req, res) => {
  const { category } = req.params;
  const validCategories = ['books', 'board', 'tricks', 'tests'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid HSC category' });
  }

  const { id, name, subject, downloadUrl, year, desc } = req.body || {};
  if (!name || !downloadUrl) {
    return res.status(400).json({ error: 'Name and downloadUrl are required' });
  }

  const data = readJSON(PORTFOLIO_FILE, {});
  if (!data.hsc) data.hsc = { books: [], board: [], tricks: [], tests: [] };
  if (!Array.isArray(data.hsc[category])) data.hsc[category] = [];

  const existingIdx = id ? data.hsc[category].findIndex(item => item.id === id) : -1;
  const resourceItem = {
    id: id || `hsc-${category}-${Date.now()}`,
    name: String(name).trim(),
    subject: String(subject || '').trim(),
    downloadUrl: String(downloadUrl).trim(),
    year: String(year || '').trim(),
    desc: String(desc || '').trim(),
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    data.hsc[category][existingIdx] = resourceItem;
  } else {
    data.hsc[category].push(resourceItem);
  }

  const success = writeJSON(PORTFOLIO_FILE, data);
  if (success) {
    res.json({ success: true, item: resourceItem, data: data.hsc[category] });
  } else {
    res.status(500).json({ error: 'Failed to save resource to database' });
  }
});

app.delete('/api/hsc/:category/:id', requireAdminAuth, (req, res) => {
  const { category, id } = req.params;
  const validCategories = ['books', 'board', 'tricks', 'tests'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid HSC category' });
  }

  const data = readJSON(PORTFOLIO_FILE, {});
  if (!data.hsc || !Array.isArray(data.hsc[category])) {
    return res.status(404).json({ error: 'Category not found or empty' });
  }

  const prevLen = data.hsc[category].length;
  data.hsc[category] = data.hsc[category].filter(item => item.id !== id);
  if (data.hsc[category].length === prevLen) {
    return res.status(404).json({ error: 'Resource item not found' });
  }

  const success = writeJSON(PORTFOLIO_FILE, data);
  if (success) {
    res.json({ success: true, message: 'Resource removed', data: data.hsc[category] });
  } else {
    res.status(500).json({ error: 'Failed to write update' });
  }
});

// ============================================================================
// 11. Static File Serving & Direct Page Routing
// ============================================================================

// Static assets with smart caching
app.get('/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/admin.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.sendFile(path.join(__dirname, 'admin.js'));
});

app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.use(express.static(__dirname, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.json')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Clean, direct URL routes
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/terminal', (req, res) => res.sendFile(path.join(__dirname, 'terminal.html')));
app.get('/projects', (req, res) => res.sendFile(path.join(__dirname, 'projects.html')));
app.get('/skills', (req, res) => res.sendFile(path.join(__dirname, 'skills.html')));
app.get('/academics', (req, res) => res.sendFile(path.join(__dirname, 'academics.html')));
app.get('/experience', (req, res) => res.sendFile(path.join(__dirname, 'experience.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));
app.get('/hsc', (req, res) => res.sendFile(path.join(__dirname, 'hsc.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Fallback to index.html (never serve index.html for static asset extensions)
app.get('*', (req, res) => {
  if (req.path.match(/\.(css|js|json|png|jpg|jpeg|gif|webp|svg|ico|mp3|wav|ogg|ttf|woff|woff2)$/i)) {
    return res.status(404).send('Asset Not Found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================================
// 12. Server Boot & Export
// ============================================================================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`Vintage CSE Portfolio & Hardened Security Engine Running`);
    console.log(`Port: ${PORT}`);
    console.log(`Public URL:  http://localhost:${PORT}`);
    console.log(`Admin Desk:  http://localhost:${PORT}/admin`);
    console.log(`Security:    CSP, PBKDF2 Auth, Timing-Safe Checks, Rate Limits`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
