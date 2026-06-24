import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { config, requireConfig } from '../config.js';
import { runGenericPlaywright } from './generic-playwright.js';

export async function enableProviderSubscription(log) {
  const adapter = config.provider.adapter;

  if (adapter === 'manual') {
    log('Provider adapter is manual; assuming the subscription is already enabled.');
    return;
  }

  if (adapter === 'generic-playwright') {
    await runGenericPlaywright(config.provider, log);
    return;
  }

  const moduleUrl = adapter.startsWith('.')
    ? pathToFileURL(path.resolve(config.rootDir, adapter)).href
    : adapter;
  const module = await import(moduleUrl);
  requireConfig(
    typeof module.enableProviderSubscription === 'function',
    `Custom provider adapter ${adapter} must export enableProviderSubscription(context).`,
  );

  await module.enableProviderSubscription({ config: config.provider, log });
}
