import { config } from './config.js';
import { readJson, writeJson } from './fs-utils.js';

const initialState = {
  status: 'idle',
  lastStartedAt: null,
  lastSucceededAt: null,
  lastFailedAt: null,
  lastError: null,
  lastRawBytes: null,
  lastPublishedBytes: null,
  lastPublishedSha256: null,
  publishedUrl: null,
  profileResults: {},
};

export async function getState() {
  return { ...initialState, ...(await readJson(config.paths.state, initialState)) };
}

export async function updateState(patch) {
  const next = { ...(await getState()), ...patch };
  await writeJson(config.paths.state, next);
  return next;
}
