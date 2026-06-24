import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = await readEnv(path.join(rootDir, '.env'));

const adminToken = env.ADMIN_TOKEN;
if (!adminToken) {
  console.error('ADMIN_TOKEN is missing in .env.');
  process.exit(1);
}

const apiBaseUrl = process.env.HUB_INTERNAL_URL || env.HUB_INTERNAL_URL || `http://127.0.0.1:${env.PORT || 3000}`;
const updateUrl = new URL('/api/update', apiBaseUrl);

const response = await fetch(updateUrl, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${adminToken}`,
    'content-type': 'application/json',
  },
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(body.error || `Update failed with HTTP ${response.status}.`);
  process.exit(1);
}

console.log('Update finished.');
console.log(`Subscription URL: ${body.downloadUrl || body.state?.publishedUrl || '(not available)'}`);

async function readEnv(filePath) {
  const contents = await fs.readFile(filePath, 'utf8').catch(() => '');
  const result = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = stripQuotes(line.slice(index + 1).trim());
    result[key] = value;
  }

  return result;
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}
