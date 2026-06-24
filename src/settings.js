import path from 'node:path';
import { config } from './config.js';
import { exists, readJson, writeJson } from './fs-utils.js';

const defaultProfiles = [
  {
    id: 'clash-ss',
    name: 'Clash SS',
    subscriptionUrl: '',
    path: '/clash-ss.yaml',
    target: 'clash',
    templateUrl: '',
    extraParams: '',
  },
  {
    id: 'clash-anytls',
    name: 'Clash AnyTLS',
    subscriptionUrl: '',
    path: '/clash-anytls.yaml',
    target: 'clash',
    templateUrl: '',
    extraParams: '',
  },
  {
    id: 'surge-anytls',
    name: 'Surge AnyTLS',
    subscriptionUrl: '',
    path: '/surge-anytls.conf',
    target: 'surge',
    templateUrl: '',
    extraParams: 'ver=4&insert=false&emoji=true&list=false&xudp=false&udp=false&tfo=false&expand=true&scv=false&fdn=false&diyua=ShadowRocket',
  },
];

export function defaultSettings() {
  return {
    converter: {
      url: config.converter.url || 'https://sub.dler.io/sub',
      input: config.converter.input || 'provider-url',
      templateUrl: config.converter.templateUrl || '',
      extraParams: config.converter.extraParams || 'emoji=true&udp=true&list=false',
    },
    profiles: defaultProfiles,
  };
}

export async function getSettings() {
  const fallback = await legacySettings();
  const saved = await readJson(config.paths.settings, fallback);
  return sanitizeSettings(saved);
}

export async function getRuntimeSettings() {
  const settings = await getSettings();
  return {
    ...settings,
    profiles: settings.profiles
      .filter((profile) => profile.subscriptionUrl)
      .map((profile, index) => normalizeRuntimeProfile(profile, settings.converter, index)),
  };
}

export async function getDisplayProfiles() {
  const settings = await getSettings();
  return settings.profiles.map((profile, index) => normalizeRuntimeProfile(profile, settings.converter, index));
}

export function profileDownloadUrl(profile) {
  const base = config.publicBaseUrl ? config.publicBaseUrl.replace(/\/$/, '') : '';
  const url = `${base}${profile.publicPath}`;
  const token = profile.downloadToken || config.downloadToken;
  if (!token) return url;
  return `${url}?token=${encodeURIComponent(token)}`;
}

export async function saveSettings(input) {
  const settings = sanitizeSettings(input);
  validateSettings(settings);
  await writeJson(config.paths.settings, settings);
  return settings;
}

function sanitizeSettings(input = {}) {
  const fallback = defaultSettings();
  const converter = input.converter && typeof input.converter === 'object' ? input.converter : {};
  const profiles = Array.isArray(input.profiles) ? input.profiles : fallback.profiles;

  return {
    converter: {
      url: stringValue(converter.url, fallback.converter.url),
      input: stringValue(converter.input, fallback.converter.input),
      templateUrl: stringValue(converter.templateUrl, fallback.converter.templateUrl),
      extraParams: stringValue(converter.extraParams, fallback.converter.extraParams),
    },
    profiles: profiles.map((profile, index) => sanitizeProfile(profile, index)).filter(Boolean),
  };
}

function sanitizeProfile(profile, index) {
  if (!profile || typeof profile !== 'object') return null;
  const indexedFallback = defaultProfiles[index] || {};
  const id = normalizeProfileId(profile.id || indexedFallback.id || `profile-${index + 1}`);
  const fallback = defaultProfiles.find((item) => item.id === id) || indexedFallback;
  const target = stringValue(profile.target, fallback.target || 'clash');

  return {
    id,
    name: stringValue(profile.name, fallback.name || id),
    subscriptionUrl: stringValue(profile.subscriptionUrl || profile.url, fallback.subscriptionUrl || ''),
    path: normalizePublicPath(profile.path || profile.publicPath || fallback.path || defaultPublicPath(id, target)),
    target,
    templateUrl: stringValue(profile.templateUrl, fallback.templateUrl || ''),
    extraParams: stringValue(profile.extraParams, fallback.extraParams || '') || fallback.extraParams || '',
  };
}

function validateSettings(settings) {
  if (!settings.converter.url) {
    throw validationError('订阅转换地址不能为空。');
  }

  for (const profile of settings.profiles) {
    if (!profile.path.startsWith('/')) {
      throw validationError(`${profile.name} 的公开路径必须以 / 开头。`);
    }
  }
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeRuntimeProfile(profile, converter, index) {
  const sanitized = sanitizeProfile(profile, index);
  const extension = path.extname(sanitized.path) || defaultExtension(sanitized.target);

  return {
    id: sanitized.id,
    name: sanitized.name,
    subscriptionUrl: sanitized.subscriptionUrl,
    publicPath: sanitized.path,
    downloadToken: '',
    rawUserAgent: config.rawUserAgent,
    converter: {
      mode: 'remote-subconverter',
      input: converter.input || 'provider-url',
      url: converter.url,
      target: sanitized.target,
      templateUrl: sanitized.templateUrl || converter.templateUrl,
      extraParams: sanitized.extraParams || converter.extraParams,
    },
    paths: {
      raw: path.join(config.paths.profiles, `${sanitized.id}.raw.yaml`),
      published: path.join(config.paths.profiles, `${sanitized.id}${extension}`),
    },
  };
}

async function legacySettings() {
  const fallback = defaultSettings();
  const legacyProfilesFile = path.join(config.dataDir, 'profiles.json');

  if (await exists(config.paths.settings)) return fallback;

  if (await exists(legacyProfilesFile)) {
    const profiles = await readJson(legacyProfilesFile, []);
    if (Array.isArray(profiles) && profiles.length > 0) {
      return sanitizeSettings({ ...fallback, profiles });
    }
  }

  if (config.provider.subscriptionUrl) {
    return sanitizeSettings({
      ...fallback,
      profiles: [
        {
          id: 'config',
          name: 'Default',
          subscriptionUrl: config.provider.subscriptionUrl,
          path: '/config.yaml',
          target: config.converter.target,
        },
      ],
    });
  }

  return fallback;
}

function stringValue(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function normalizeProfileId(value) {
  const id = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return id || 'profile';
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
