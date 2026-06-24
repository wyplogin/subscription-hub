import path from 'node:path';
import { config } from './config.js';
import { exists, readJson, writeJson } from './fs-utils.js';

const primaryProviderParams = 'include=Premium&rename=%60Premium%40Pre%60';
const secondaryProviderParams =
  'exclude=%E6%98%9F%E9%93%BE%7C%E6%B8%B8%E6%88%8F%7C5G%7C%E5%AE%9E%E9%AA%8C&include=%E9%A6%99%E6%B8%AF%7C%E6%96%B0%E5%8A%A0%E5%9D%A1%7C%E6%97%A5%E6%9C%AC%7C%E7%BE%8E%E5%9B%BD&rename=%60%E9%A6%99%E6%B8%AF%E5%AE%B6%E5%AE%BD%5Cs*(%5Cd%2B).*%40Hong%20Kong%20%241%20%5BPre%5D%60%60%E9%A6%99%E6%B8%AF%5Cs*(%5Cd%2B).*%40Hong%20Kong%20%241%60%60%E6%96%B0%E5%8A%A0%E5%9D%A1%E5%AE%B6%E5%AE%BD.*%40Singapore%20%5BPre%5D%60%60%E6%96%B0%E5%8A%A0%E5%9D%A1%5Cs*(%5Cd%2B).*%40Singapore%20%241%60%60%E6%97%A5%E6%9C%AC%E5%AE%B6%E5%AE%BD%5Cs*(%5Cd%2B).*%40Japan%20%241%20%5BPre%5D%60%60%E6%97%A5%E6%9C%AC%5Cs*(%5Cd%2B).*%40Japan%20%241%60%60%E7%BE%8E%E5%9B%BD-%E5%AE%B6%E5%AE%BD%5Cs*(%5Cd%2B).*%40United%20States%20%241%20%5BPre%5D%60%60%E7%BE%8E%E5%9B%BD-%E8%B4%B9%E5%9F%8E.*%40United%20States%20Philadelphia%60%60%E7%BE%8E%E5%9B%BD-%E7%BA%BD%E7%BA%A6%5Cs*(%5Cd%2B).*%40United%20States%20New%20York%20%241%60%60%E7%BE%8E%E5%9B%BD-%E6%B4%9B%E6%9D%89%E7%9F%B6%5Cs*(%5Cd%2B).*%40United%20States%20Los%20Angeles%20%241%60%60%E7%BE%8E%E5%9B%BD-%E7%9B%90%E6%B9%96%E5%9F%8E.*%40United%20States%20Salt%20Lake%20City%60%60%E7%BE%8E%E5%9B%BD-%E5%9C%A3%E4%BD%95%E5%A1%9E.*%40United%20States%20San%20Jose%60%60%E7%BE%8E%E5%9B%BD-%E8%BF%88%E9%98%BF%E5%AF%86.*%40United%20States%20Miami%60%60%E7%BE%8E%E5%9B%BD-%E8%A5%BF%E9%9B%85%E5%9B%BE.*%40United%20States%20Seattle%60%60%E7%BE%8E%E5%9B%BD-%E6%AA%80%E9%A6%99%E5%B1%B1.*%40United%20States%20Honolulu%60%60%E7%BE%8E%E5%9B%BD-%E6%97%A7%E9%87%91%E5%B1%B1.*%40United%20States%20San%20Francisco%60%60%E7%BE%8E%E5%9B%BD-%E5%87%A4%E5%87%B0%E5%9F%8E.*%40United%20States%20Phoenix%60%60%E7%BE%8E%E5%9B%BD-%E8%BE%BE%E6%8B%89%E6%96%AF.*%40United%20States%20Dallas%60%60%E7%BE%8E%E5%9B%BD-%E4%BC%91%E6%96%AF%E9%A1%BF.*%40United%20States%20Houston%60%60%E7%BE%8E%E5%9B%BD-%E8%8A%9D%E5%8A%A0%E5%93%A5.*%40United%20States%20Chicago%60%60%E7%BE%8E%E5%9B%BD-%E5%A4%8F%E6%B4%9B%E7%89%B9.*%40United%20States%20Charlotte%60%60%E7%BE%8E%E5%9B%BD-%E6%96%AF%E6%B3%A2%E5%9D%8E.*%40United%20States%20Spokane%60%60%E7%BE%8E%E5%9B%BD-%E9%98%BF%E4%BB%80%E6%9C%AC.*%40United%20States%20Ashburn%60%60%E7%BE%8E%E5%9B%BD-%E6%8B%89%E6%96%AF%E7%BB%B4%E5%8A%A0%E6%96%AF.*%40United%20States%20Las%20Vegas%60%60%E7%BE%8E%E5%9B%BD-%E5%AE%9E%E9%AA%8C%E8%8A%82%E7%82%B9.*%40United%20States%20Experimental%60';

const defaultProfiles = [
  {
    id: 'clash-ss',
    name: 'Clash SS',
    subscriptionUrl: '',
    path: '/clash-ss.yaml',
    target: 'clash',
    templateUrl: '',
    extraParams: primaryProviderParams,
  },
  {
    id: 'clash-anytls',
    name: 'Clash AnyTLS',
    subscriptionUrl: '',
    path: '/clash-anytls.yaml',
    target: 'clash',
    templateUrl: '',
    extraParams: primaryProviderParams,
  },
  {
    id: 'clash-ss-secondary',
    name: 'Clash SS 2',
    subscriptionUrl: '',
    path: '/clash-ss-2.yaml',
    target: 'clash',
    templateUrl: '',
    extraParams: secondaryProviderParams,
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
  const profiles = mergeProfilesWithDefaults(Array.isArray(input.profiles) ? input.profiles : fallback.profiles);

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

function mergeProfilesWithDefaults(profiles) {
  const savedById = new Map(
    profiles
      .filter((profile) => profile && typeof profile === 'object')
      .map((profile) => [normalizeProfileId(profile.id || ''), profile]),
  );

  const mergedDefaults = defaultProfiles.map((fallback) => ({
    ...fallback,
    ...(savedById.get(fallback.id) || {}),
  }));
  const customClashProfiles = profiles.filter((profile) => {
    if (!profile || typeof profile !== 'object') return false;
    const id = normalizeProfileId(profile.id || '');
    const target = stringValue(profile.target, 'clash').toLowerCase();
    return !defaultProfiles.some((fallback) => fallback.id === id) && target === 'clash';
  });

  return [...mergedDefaults, ...customClashProfiles];
}

function sanitizeProfile(profile, index) {
  if (!profile || typeof profile !== 'object') return null;
  const indexedFallback = defaultProfiles[index] || {};
  const id = normalizeProfileId(profile.id || indexedFallback.id || `profile-${index + 1}`);
  const fallback = defaultProfiles.find((item) => item.id === id) || indexedFallback;
  const target = 'clash';

  return {
    id,
    name: stringValue(profile.name, fallback.name || id),
    subscriptionUrl: stringValue(profile.subscriptionUrl || profile.url, fallback.subscriptionUrl || ''),
    path: normalizePublicPath(profile.path || profile.publicPath || fallback.path || defaultPublicPath(id, target)),
    target,
    templateUrl: stringValue(profile.templateUrl, fallback.templateUrl || ''),
    extraParams: stringValue(profile.extraParams, '') || fallback.extraParams || '',
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
      extraParams: combineExtraParams(converter.extraParams, sanitized.extraParams),
    },
    paths: {
      raw: path.join(config.paths.profiles, `${sanitized.id}.raw.yaml`),
      published: path.join(config.paths.profiles, `${sanitized.id}${extension}`),
    },
  };
}

function combineExtraParams(globalParams, profileParams) {
  const params = new URLSearchParams(globalParams || '');
  const profile = new URLSearchParams(profileParams || '');
  for (const [key, value] of profile.entries()) {
    params.set(key, value);
  }
  return params.toString();
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
  return '.yaml';
}
