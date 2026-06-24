import crypto from 'node:crypto';
import { config } from './config.js';

export function requireAdmin(req, res, next) {
  if (!config.adminToken) {
    return res.status(500).json({ error: 'ADMIN_TOKEN is not configured.' });
  }

  if (hasAdminToken(req)) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

export function hasAdminToken(req) {
  return Boolean(config.adminToken) && safeEqual(tokenFromRequest(req), config.adminToken);
}

export function hasRawDownloadToken(req) {
  return Boolean(config.rawDownloadToken) && safeEqual(req.query.rawToken || req.query.token || '', config.rawDownloadToken);
}

function tokenFromRequest(req) {
  const authorization = req.get('authorization') || '';
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }
  return req.query.token || req.get('x-admin-token') || '';
}

export function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}
