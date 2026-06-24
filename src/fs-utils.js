import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export async function writeJson(file, value) {
  await atomicWrite(file, `${JSON.stringify(value, null, 2)}\n`);
}

export async function atomicWrite(file, contents) {
  await ensureDir(path.dirname(file));
  const tempFile = `${file}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  await fs.writeFile(tempFile, contents);
  await fs.rename(tempFile, file);
}

export async function backupFile(file, backupDir, prefix) {
  if (!(await exists(file))) return null;
  await ensureDir(backupDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `${prefix}-${timestamp}.yaml`);
  await fs.copyFile(file, backupPath);
  return backupPath;
}

export async function pruneBackups(backupDir, keep) {
  if (keep <= 0) return;
  let entries;
  try {
    entries = await fs.readdir(backupDir, { withFileTypes: true });
  } catch {
    return;
  }

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.yaml'))
      .map(async (entry) => {
        const filePath = path.join(backupDir, entry.name);
        const stat = await fs.stat(filePath);
        return { filePath, mtimeMs: stat.mtimeMs };
      }),
  );

  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  await Promise.all(files.slice(keep).map((file) => fs.rm(file.filePath, { force: true })));
}
