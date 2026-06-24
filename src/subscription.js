import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import YAML from 'yaml';
import { config, requireConfig } from './config.js';
import { atomicWrite, backupFile, ensureDir, pruneBackups } from './fs-utils.js';
import { enableProviderSubscription } from './provider/index.js';
import { getRuntimeSettings, profileDownloadUrl } from './settings.js';
import { getState, updateState } from './state.js';

let runningUpdate = null;

export function updateSubscription(profileId = null) {
  if (runningUpdate) return runningUpdate;
  runningUpdate = runUpdate(profileId).finally(() => {
    runningUpdate = null;
  });
  return runningUpdate;
}

export function isUpdateRunning() {
  return Boolean(runningUpdate);
}

async function runUpdate(profileId = null) {
  const logs = [];
  const log = (message) => logs.push({ at: new Date().toISOString(), message });
  const startedAt = new Date().toISOString();

  await ensureDir(config.dataDir);
  await updateState({ status: 'running', lastStartedAt: startedAt, lastError: null, logs });

  try {
    const settings = await getRuntimeSettings();
    requireConfig(settings.profiles.length > 0, 'No subscription profiles are configured.');

    let targetProfiles = settings.profiles;
    if (profileId) {
      targetProfiles = settings.profiles.filter((profile) => profile.id === profileId);
      requireConfig(
        targetProfiles.length > 0,
        `Subscription profile ${profileId} was not found or has no subscription URL.`,
      );
    }

    log('Starting provider subscription refresh.');
    await withTimeout(enableProviderSubscription(log), config.updateTimeoutMs, 'Provider enable step timed out.');

    log(`Refreshing ${targetProfiles.length} subscription profile(s).`);
    const results = [];
    for (const profile of targetProfiles) {
      results.push(await updateProfile(profile, log));
    }

    await pruneBackups(config.paths.backups, config.keepBackups);

    // For a single-profile update, merge this run's result over the previous
    // ones so the other profiles keep their last-known status. A full update
    // replaces the map so results of removed profiles don't linger.
    const previousState = await getState();
    const profileResults = profileId ? { ...(previousState.profileResults || {}) } : {};
    for (const result of results) {
      profileResults[result.id] = result;
    }

    const failed = results.filter((result) => result.status === 'failed');
    const succeeded = results.filter((result) => result.status === 'idle');
    const firstSuccess = succeeded[0];
    const now = new Date().toISOString();
    const mergedFailedCount = Object.values(profileResults).filter((result) => result.status === 'failed').length;

    const patch = {
      status: mergedFailedCount > 0 ? 'failed' : 'idle',
      lastError: mergedFailedCount > 0 ? `${mergedFailedCount} subscription profile(s) failed.` : null,
      profileResults,
      logs,
    };
    if (succeeded.length > 0) patch.lastSucceededAt = now;
    if (failed.length > 0) patch.lastFailedAt = now;
    if (firstSuccess) {
      patch.lastRawBytes = firstSuccess.lastRawBytes;
      patch.lastPublishedBytes = firstSuccess.lastPublishedBytes;
      patch.lastPublishedSha256 = firstSuccess.lastPublishedSha256;
      patch.publishedUrl = firstSuccess.downloadUrl;
    }

    const state = await updateState(patch);

    if (failed.length > 0) {
      const error = new Error(`${failed.length} subscription profile(s) failed.`);
      error.state = state;
      throw error;
    }

    return { ok: true, state };
  } catch (error) {
    if (error.state) throw error;
    log(`Update failed: ${error.message}`);
    const state = await updateState({
      status: 'failed',
      lastFailedAt: new Date().toISOString(),
      lastError: error.message,
      logs,
    });
    error.state = state;
    throw error;
  }
}

async function updateProfile(profile, log) {
  const now = new Date().toISOString();

  try {
    requireConfig(profile.subscriptionUrl, `Subscription URL is required for profile ${profile.id}.`);

    log(`[${profile.name}] Downloading raw subscription.`);
    const raw = await fetchText(profile.subscriptionUrl, {
      headers: {
        'user-agent': profile.rawUserAgent,
        accept: 'text/yaml,text/plain,*/*',
      },
      timeoutMs: config.updateTimeoutMs,
    });
    validateNonEmpty(raw, `[${profile.name}] Provider returned an empty subscription.`);
    await atomicWrite(profile.paths.raw, raw);

    log(`[${profile.name}] Converting subscription.`);
    const converted = await convertSubscription(profile, buildConverterSourceUrl(profile));
    validateConverted(profile, converted);

    log(`[${profile.name}] Publishing converted subscription.`);
    await backupFile(profile.paths.published, config.paths.backups, profile.id);
    await atomicWrite(profile.paths.published, converted);

    const lastPublishedBytes = Buffer.byteLength(converted);
    const lastRawBytes = Buffer.byteLength(raw);
    const lastPublishedSha256 = crypto.createHash('sha256').update(converted).digest('hex');

    return {
      id: profile.id,
      name: profile.name,
      status: 'idle',
      target: profile.converter.target,
      publicPath: profile.publicPath,
      downloadUrl: profileDownloadUrl(profile),
      lastSucceededAt: now,
      lastFailedAt: null,
      lastError: null,
      lastRawBytes,
      lastPublishedBytes,
      lastPublishedSha256,
    };
  } catch (error) {
    log(`[${profile.name}] Update failed: ${error.message}`);
    return {
      id: profile.id,
      name: profile.name,
      status: 'failed',
      target: profile.converter.target,
      publicPath: profile.publicPath,
      downloadUrl: profileDownloadUrl(profile),
      lastSucceededAt: null,
      lastFailedAt: new Date().toISOString(),
      lastError: error.message,
    };
  }
}

async function convertSubscription(profile, sourceUrl) {
  if (profile.converter.mode === 'passthrough') {
    return fs.readFile(profile.paths.raw, 'utf8');
  }

  requireConfig(
    profile.converter.mode === 'remote-subconverter',
    `Unsupported converter mode for ${profile.id}: ${profile.converter.mode}`,
  );
  requireConfig(profile.converter.url, `Converter URL is required for profile ${profile.id}.`);

  const url = new URL(profile.converter.url);
  url.searchParams.set('target', profile.converter.target);
  url.searchParams.set('url', sourceUrl);
  if (profile.converter.templateUrl) {
    url.searchParams.set('config', profile.converter.templateUrl);
  }
  if (profile.converter.extraParams) {
    const params = new URLSearchParams(profile.converter.extraParams);
    for (const [key, value] of params.entries()) {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    }
  }

  return fetchText(url.toString(), {
    headers: { accept: 'text/yaml,text/plain,*/*' },
    timeoutMs: config.updateTimeoutMs,
  });
}

function buildConverterSourceUrl(profile) {
  if (profile.converter.input === 'provider-url') {
    return profile.subscriptionUrl;
  }

  requireConfig(
    profile.converter.input === 'hosted-raw',
    `Unsupported converter input for ${profile.id}: ${profile.converter.input}`,
  );
  requireConfig(config.publicBaseUrl, 'PUBLIC_BASE_URL is required when CONVERTER_INPUT=hosted-raw.');
  requireConfig(config.rawDownloadToken, 'RAW_DOWNLOAD_TOKEN is required when CONVERTER_INPUT=hosted-raw.');

  const url = new URL(`/raw/${profile.id}.yaml`, config.publicBaseUrl);
  url.searchParams.set('rawToken', config.rawDownloadToken);
  return url.toString();
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 60000);
  try {
    const response = await fetch(url, {
      headers: options.headers,
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with HTTP ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function validateNonEmpty(contents, message) {
  if (!contents || !contents.trim()) throw new Error(message);
}

function validateConverted(profile, contents) {
  validateNonEmpty(contents, `[${profile.name}] Converted subscription is empty.`);

  if (!requiresClashValidation(profile.converter.target)) return;
  validateClashYaml(contents);
}

function validateClashYaml(contents) {
  validateNonEmpty(contents, 'Converted subscription is empty.');
  let parsed;
  try {
    parsed = YAML.parse(contents);
  } catch (error) {
    throw new Error(`Converted subscription is not valid YAML: ${error.message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Converted subscription is not a YAML object.');
  }

  const hasInlineProxies = Array.isArray(parsed.proxies);
  const hasProxyProviders =
    parsed['proxy-providers'] &&
    typeof parsed['proxy-providers'] === 'object' &&
    !Array.isArray(parsed['proxy-providers']);

  if (!hasInlineProxies && !hasProxyProviders) {
    throw new Error('Converted subscription does not look like a Clash YAML file.');
  }
}

async function withTimeout(promise, timeoutMs, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

function requiresClashValidation(target) {
  return String(target || '').toLowerCase().includes('clash');
}
