import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(rootDir, '.env');
const examplePath = path.join(rootDir, '.env.example');
const force = process.argv.includes('--force');

if (!force && await exists(envPath)) {
  console.log('.env already exists. Use npm run init -- --force to recreate it.');
  process.exit(0);
}

let contents = await fs.readFile(examplePath, 'utf8');
const replacements = {
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || '',
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || randomToken(),
  DOWNLOAD_TOKEN: process.env.DOWNLOAD_TOKEN || '',
  RAW_DOWNLOAD_TOKEN: process.env.RAW_DOWNLOAD_TOKEN || randomToken(),
  CONVERTER_INPUT: process.env.CONVERTER_INPUT || 'provider-url',
};

for (const [key, value] of Object.entries(replacements)) {
  contents = setEnv(contents, key, value);
}

await fs.writeFile(envPath, contents, { mode: 0o600 });

console.log('Created .env with fresh local tokens.');
console.log('Next: run npm run dev, open /admin/, and fill subscription settings.');

function randomToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function setEnv(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${escapeRegExp(key)}=.*$`, 'm');
  if (pattern.test(contents)) return contents.replace(pattern, line);
  return `${contents.replace(/\s*$/, '')}\n${line}\n`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
