import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(rootDir, 'data');
const profilesFile = resolvePath(process.env.PROFILES_FILE || path.join(dataDir, 'profiles.json'));

function intEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

export const config = {
  rootDir,
  dataDir,
  profilesFile,
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
    state: path.join(dataDir, 'state.json'),
    lock: path.join(dataDir, 'update.lock'),
    backups: path.join(dataDir, 'backups'),
    profiles: path.join(dataDir, 'profiles'),
  },
};

config.profiles = loadProfiles();

export function requireConfig(condition, message) {
  if (!condition) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

function loadProfiles() {
  const profileDefinitions = readProfileDefinitions();

  if (profileDefinitions.length > 0) {
    return profileDefinitions.map((profile, index) => normalizeProfile(profile, index));
  }

  if (process.env.PROVIDER_SUBSCRIPTION_URL) {
    return [
      normalizeProfile(
        {
          id: 'config',
          name: 'Default',
          subscriptionUrl: process.env.PROVIDER_SUBSCRIPTION_URL,
          path: '/config.yaml',
        },
        0,
      ),
    ];
  }

  return [];
}

function readProfileDefinitions() {
  if (process.env.PROFILES_JSON) {
    return parseProfiles(process.env.PROFILES_JSON, 'PROFILES_JSON');
  }

  if (fs.existsSync(profilesFile)) {
    return parseProfiles(fs.readFileSync(profilesFile, 'utf8'), profilesFile);
  }

  return [];
}

function parseProfiles(contents, source) {
  try {
    const parsed = JSON.parse(contents);
    if (!Array.isArray(parsed)) {
      throw new Error('profile config must be a JSON array');
    }
    return parsed;
  } catch (error) {
    throw new Error(`Failed to read subscription profiles from ${source}: ${error.message}`);
  }
}

function normalizeProfile(profile, index) {
  const id = normalizeProfileId(profile.id || profile.name || `profile-${index + 1}`);
  const target = profile.target || config.converter.target;
  const publicPath = normalizePublicPath(profile.path || profile.outputPath || defaultPublicPath(id, target));
  const extension = path.extname(publicPath) || defaultExtension(target);

  return {
    id,
    name: profile.name || id,
    subscriptionUrl: profile.subscriptionUrl || profile.url || profile.providerSubscriptionUrl || '',
    publicPath,
    downloadToken: profile.downloadToken || '',
    rawUserAgent: profile.rawUserAgent || config.rawUserAgent,
    converter: {
      mode: profile.converterMode || profile.mode || config.converter.mode,
      input: profile.converterInput || profile.input || config.converter.input,
      url: profile.subconverterUrl || profile.converterUrl || config.converter.url,
      target,
      templateUrl: profile.templateUrl || profile.configTemplateUrl || config.converter.templateUrl,
      extraParams: profile.extraParams || profile.subconverterExtraParams || config.converter.extraParams,
    },
    paths: {
      raw: path.join(config.paths.profiles, `${id}.raw.yaml`),
      published: path.join(config.paths.profiles, `${id}${extension}`),
    },
  };
}

function normalizeProfileId(value) {
  const id = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!id) return 'profile';
  return id;
}

function normalizePublicPath(value) {
  const publicPath = String(value || '').trim();
  if (!publicPath) return '/config.yaml';
  return publicPath.startsWith('/') ? publicPath : `/${publicPath}`;
}

function defaultPublicPath(id, target) {
  return `/${id}${defaultExtension(target)}`;
}

function defaultExtension(target) {
  return String(target).toLowerCase().includes('surge') ? '.conf' : '.yaml';
}

function resolvePath(value) {
  return path.isAbsolute(value) ? value : path.resolve(rootDir, value);
}
