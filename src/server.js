import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { hasAdminToken, hasRawDownloadToken, requireAdmin } from './auth.js';
import { ensureDir, exists } from './fs-utils.js';
import { getDisplayProfiles, getRuntimeSettings, getSettings, profileDownloadUrl, saveSettings } from './settings.js';
import { getState } from './state.js';
import { isUpdateRunning, updateSubscription } from './subscription.js';

await ensureDir(config.dataDir);
await ensureDir(config.paths.backups);
await ensureDir(config.paths.profiles);

const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('combined'));
app.use(express.json({ limit: '64kb' }));

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

app.get('/config.yaml', async (req, res, next) => {
  try {
    const profile = await profileByPublicPath('/config.yaml');
    if (!profile) {
      return res.status(404).type('text/plain').send('Subscription profile was not found.\n');
    }
    return sendPublishedProfile(req, res, profile);
  } catch (error) {
    return next(error);
  }
});

app.get('/configraw.yaml', async (req, res) => {
  if (!hasAdminToken(req) && !hasRawDownloadToken(req)) {
    return res.status(401).type('text/plain').send('Unauthorized\n');
  }

  const { profiles } = await getRuntimeSettings();
  const profile = profiles[0];
  if (!profile) {
    return res.status(404).type('text/plain').send('Raw subscription profile was not found.\n');
  }

  if (!(await exists(profile.paths.raw))) {
    return res.status(404).type('text/plain').send('Raw subscription has not been downloaded yet.\n');
  }
  res.setHeader('content-type', 'text/yaml; charset=utf-8');
  return res.sendFile(profile.paths.raw);
});

app.get('/raw/:profileId.yaml', async (req, res) => {
  if (!hasAdminToken(req) && !hasRawDownloadToken(req)) {
    return res.status(401).type('text/plain').send('Unauthorized\n');
  }

  const { profiles } = await getRuntimeSettings();
  const profile = profiles.find((item) => item.id === req.params.profileId);
  if (!profile) {
    return res.status(404).type('text/plain').send('Raw subscription profile was not found.\n');
  }

  if (!(await exists(profile.paths.raw))) {
    return res.status(404).type('text/plain').send('Raw subscription has not been downloaded yet.\n');
  }

  res.setHeader('content-type', 'text/yaml; charset=utf-8');
  return res.sendFile(profile.paths.raw);
});

app.get('/api/state', requireAdmin, async (_req, res) => {
  const state = await getState();
  res.json({ ...state, running: isUpdateRunning(), profiles: await buildProfiles(state, _req) });
});

app.get('/api/settings', requireAdmin, async (_req, res) => {
  res.json(await getSettings());
});

app.put('/api/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await saveSettings(req.body);
    res.json(settings);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

app.post('/api/update', requireAdmin, async (req, res) => {
  try {
    const profileId = typeof req.body?.profileId === 'string' ? req.body.profileId.trim() : '';
    const result = await updateSubscription(profileId || null);
    res.json({ ...result, profiles: await buildProfiles(result.state, req) });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.message,
      state: error.state || (await getState()),
    });
  }
});

const adminStatic = express.static(path.join(config.rootDir, 'public', 'admin'), { extensions: ['html'] });
app.use('/subadmin', adminStatic);
app.get('/admin', (_req, res) => {
  res.redirect('/subadmin/');
});
app.get('/admin/', (_req, res) => {
  res.redirect('/subadmin/');
});

app.get('/', (_req, res) => {
  res.redirect('/subadmin/');
});

app.get('/:profileFile', async (req, res, next) => {
  try {
    const profile = await profileByPublicPath(`/${req.params.profileFile}`);
    if (!profile) return next();
    return sendPublishedProfile(req, res, profile);
  } catch (error) {
    return next(error);
  }
});

app.use(async (err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(config.port, config.host, () => {
  console.log(`Subscription hub listening on http://${config.host}:${config.port}`);
});

async function sendPublishedProfile(req, res, profile) {
  const token = profile.downloadToken || config.downloadToken;
  if (token && req.query.token !== token) {
    return res.status(401).type('text/plain').send('Unauthorized\n');
  }

  if (!(await exists(profile.paths.published))) {
    return res.status(404).type('text/plain').send('Subscription has not been published yet.\n');
  }

  res.setHeader('content-type', contentTypeFor(profile.publicPath));
  res.setHeader('cache-control', 'no-store');
  return res.sendFile(profile.paths.published);
}

async function buildProfiles(state = {}, req = null) {
  const profileResults = state.profileResults || {};
  const profiles = await getDisplayProfiles();
  return profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    target: profile.converter.target,
    publicPath: profile.publicPath,
    downloadUrl: buildDownloadUrl(profile, req),
    rawUrl: buildRawUrl(profile, req),
    configured: Boolean(profile.subscriptionUrl),
    ...(profileResults[profile.id] || {}),
  }));
}

function buildDownloadUrl(profile, req) {
  const url = profileDownloadUrl(profile);
  if (url.startsWith('/')) return `${requestBaseUrl(req)}${url}`;
  return url;
}

function buildRawUrl(profile, req) {
  const base = config.publicBaseUrl ? config.publicBaseUrl.replace(/\/$/, '') : requestBaseUrl(req);
  const url = `${base}/raw/${profile.id}.yaml`;
  if (!config.rawDownloadToken) return '';
  return `${url}?rawToken=${encodeURIComponent(config.rawDownloadToken)}`;
}

function contentTypeFor(publicPath) {
  if (publicPath.endsWith('.conf')) return 'text/plain; charset=utf-8';
  return 'text/yaml; charset=utf-8';
}

async function profileByPublicPath(publicPath) {
  const { profiles } = await getRuntimeSettings();
  return profiles.find((item) => item.publicPath === publicPath);
}

function requestBaseUrl(req) {
  if (!req) return '';
  const proto = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('host');
  return host ? `${proto}://${host}` : '';
}
