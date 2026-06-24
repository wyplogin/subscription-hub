import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(rootDir, 'data');

function intEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

export const config = {
  rootDir,
  dataDir,
  host: process.env.HOST || '0.0.0.0',
  port: intEnv('PORT', 3000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || '',
  adminToken: process.env.ADMIN_TOKEN || '',
  downloadToken: process.env.DOWNLOAD_TOKEN || '',
  rawDownloadToken: process.env.RAW_DOWNLOAD_TOKEN || '',
  provider: {
    adapter: process.env.PROVIDER_ADAPTER || 'manual',
    subscriptionUrl: process.env.PROVIDER_SUBSCRIPTION_URL || '',
    loginUrl: process.env.PROVIDER_LOGIN_URL || '',
    username: process.env.PROVIDER_USERNAME || '',
    password: process.env.PROVIDER_PASSWORD || '',
    usernameSelector: process.env.PROVIDER_USERNAME_SELECTOR || 'input[name="email"]',
    passwordSelector: process.env.PROVIDER_PASSWORD_SELECTOR || 'input[name="password"]',
    submitSelector: process.env.PROVIDER_SUBMIT_SELECTOR || 'button[type="submit"]',
    enableUrl: process.env.PROVIDER_ENABLE_URL || '',
    enableSelector: process.env.PROVIDER_ENABLE_SELECTOR || '',
    enableText: process.env.PROVIDER_ENABLE_TEXT || '',
    afterLoginWaitMs: intEnv('PROVIDER_AFTER_LOGIN_WAIT_MS', 1500),
    afterEnableWaitMs: intEnv('PROVIDER_AFTER_ENABLE_WAIT_MS', 1500),
  },
  converter: {
    mode: process.env.CONVERTER_MODE || 'remote-subconverter',
    input: process.env.CONVERTER_INPUT || 'hosted-raw',
    url: process.env.SUBCONVERTER_URL || '',
    target: process.env.TARGET || 'clash',
    templateUrl: process.env.CONFIG_TEMPLATE_URL || '',
    extraParams: process.env.SUBCONVERTER_EXTRA_PARAMS || '',
  },
  updateTimeoutMs: intEnv('UPDATE_TIMEOUT_MS', 120000),
  rawUserAgent: process.env.RAW_USER_AGENT || 'ClashforWindows/0.20.39',
  keepBackups: intEnv('KEEP_BACKUPS', 20),
  paths: {
    raw: path.join(dataDir, 'configraw.yaml'),
    published: path.join(dataDir, 'config.yaml'),
    settings: path.join(dataDir, 'settings.json'),
    state: path.join(dataDir, 'state.json'),
    lock: path.join(dataDir, 'update.lock'),
    backups: path.join(dataDir, 'backups'),
    profiles: path.join(dataDir, 'profiles'),
  },
};

export function requireConfig(condition, message) {
  if (!condition) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}
