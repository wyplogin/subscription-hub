import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { hasAdminToken, hasRawDownloadToken, requireAdmin } from './auth.js';
import { ensureDir, exists } from './fs-utils.js';
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
    const profile = config.profiles.find((item) => item.publicPath === '/config.yaml');
    if (!profile) {
      return res.status(404).type('text/plain').send('Subscription profile was not found.\n');
    }
    return sendPublishedProfile(req, res, profile);
  } catch (error) {
    return next(error);
  }
});

for (const profile of config.profiles) {
  if (profile.publicPath === '/config.yaml') continue;

  app.get(profile.publicPath, async (req, res, next) => {
    try {
      return sendPublishedProfile(req, res, profile);
    } catch (error) {
      return next(error);
    }
  });
}

app.get('/configraw.yaml', async (req, res) => {
  if (!hasAdminToken(req) && !hasRawDownloadToken(req)) {
    return res.status(401).type('text/plain').send('Unauthorized\n');
  }

  const profile = config.profiles[0];
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

  const profile = config.profiles.find((item) => item.id === req.params.profileId);
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
  res.json({ ...state, running: isUpdateRunning(), profiles: buildProfiles(state) });
});

app.post('/api/update', requireAdmin, async (_req, res) => {
  try {
    const result = await updateSubscription();
    res.json({ ...result, profiles: buildProfiles(result.state) });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.message,
      state: error.state || (await getState()),
    });
  }
});

app.use('/admin', express.static(path.join(config.rootDir, 'public', 'admin'), { extensions: ['html'] }));

app.get('/', (_req, res) => {
  res.redirect('/admin/');
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

function buildProfiles(state = {}) {
  const profileResults = state.profileResults || {};
  return config.profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    target: profile.converter.target,
    publicPath: profile.publicPath,
    downloadUrl: buildDownloadUrl(profile),
    rawUrl: buildRawUrl(profile),
    ...(profileResults[profile.id] || {}),
  }));
}

function buildDownloadUrl(profile) {
  const base = config.publicBaseUrl ? config.publicBaseUrl.replace(/\/$/, '') : '';
  const url = `${base}${profile.publicPath}`;
  const token = profile.downloadToken || config.downloadToken;
  if (!token) return url;
  return `${url}?token=${encodeURIComponent(token)}`;
}

function buildRawUrl(profile) {
  const base = config.publicBaseUrl ? config.publicBaseUrl.replace(/\/$/, '') : '';
  const url = `${base}/raw/${profile.id}.yaml`;
  if (!config.rawDownloadToken) return '';
  return `${url}?rawToken=${encodeURIComponent(config.rawDownloadToken)}`;
}

function contentTypeFor(publicPath) {
  if (publicPath.endsWith('.conf')) return 'text/plain; charset=utf-8';
  return 'text/yaml; charset=utf-8';
}
