// ============================================================
// Arcade Tracker — Admin Authentication Routes
// Uses process.env.ADMIN_USERNAME and process.env.ADMIN_PASSWORD.
// Zero hardcoded credentials in source code.
// ============================================================
import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

/**
 * Sanitizes input string or environment variable by trimming whitespace
 * (including \r, \n, spaces) and stripping accidental quotes around values.
 */
function cleanValue(val: unknown): string {
  if (typeof val !== 'string') return '';
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function getSecretSalt(): string {
  return cleanValue(process.env.ADMIN_PASSWORD) || 'arcade-tracker-secret-salt';
}

function generateToken(username: string): string {
  const timestamp = Date.now();
  const payload = `${username}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', getSecretSalt()).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, hmac })).toString('base64');
}

function verifyToken(token: string): boolean {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const { payload, hmac } = JSON.parse(raw);
    const expectedHmac = crypto.createHmac('sha256', getSecretSalt()).update(payload).digest('hex');
    if (hmac !== expectedHmac) return false;

    // Optional: check token age (e.g. 24 hours = 86400000 ms)
    const [, timestampStr] = payload.split(':');
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > 86400000) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * POST /api/admin/login
 * Validates username and password against process.env.ADMIN_USERNAME and process.env.ADMIN_PASSWORD
 */
router.post('/login', (req: Request, res: Response): void => {
  const { username, password } = req.body || {};

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  const cleanExpectedUsername = cleanValue(expectedUsername);
  const cleanExpectedPassword = cleanValue(expectedPassword);

  const cleanInputUsername = cleanValue(username);
  const cleanInputPassword = cleanValue(password);

  if (!expectedUsername || !expectedPassword) {
    res.status(500).json({
      success: false,
      error: 'Admin authentication environment variables (ADMIN_USERNAME / ADMIN_PASSWORD) are not configured on the server.',
    });
    return;
  }

  const isUsernameMatch = (username === expectedUsername) || (cleanInputUsername === cleanExpectedUsername);
  const isPasswordMatch = (password === expectedPassword) || (cleanInputPassword === cleanExpectedPassword);

  if (isUsernameMatch && isPasswordMatch) {
    const token = generateToken(cleanInputUsername || username);
    res.json({
      success: true,
      token,
      data: { token },
      message: 'Authentication successful',
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid username or password',
    });
  }
});

/**
 * POST /api/admin/verify
 * Validates whether the provided token is valid
 */
router.post('/verify', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7)
    : req.body?.token;

  if (!token) {
    res.status(401).json({ success: false, valid: false, error: 'Token missing' });
    return;
  }

  const isValid = verifyToken(token);
  if (isValid) {
    res.json({ success: true, valid: true });
  } else {
    res.status(401).json({ success: false, valid: false, error: 'Token invalid or expired' });
  }
});

export default router;
