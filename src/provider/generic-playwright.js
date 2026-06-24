import { chromium } from 'playwright';
import { requireConfig } from '../config.js';

export async function runGenericPlaywright(providerConfig, log) {
  requireConfig(providerConfig.loginUrl, 'PROVIDER_LOGIN_URL is required for generic-playwright.');
  requireConfig(providerConfig.username, 'PROVIDER_USERNAME is required for generic-playwright.');
  requireConfig(providerConfig.password, 'PROVIDER_PASSWORD is required for generic-playwright.');
  requireConfig(
    providerConfig.enableSelector || providerConfig.enableText,
    'PROVIDER_ENABLE_SELECTOR or PROVIDER_ENABLE_TEXT is required for generic-playwright.',
  );

  log('Opening provider login page.');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(providerConfig.loginUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.fill(providerConfig.usernameSelector, providerConfig.username);
    await page.fill(providerConfig.passwordSelector, providerConfig.password);
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {}),
      page.click(providerConfig.submitSelector),
    ]);

    if (providerConfig.afterLoginWaitMs > 0) {
      await page.waitForTimeout(providerConfig.afterLoginWaitMs);
    }

    if (providerConfig.enableUrl) {
      log('Opening provider subscription page.');
      await page.goto(providerConfig.enableUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    }

    log('Clicking provider subscription-enable control.');
    if (providerConfig.enableSelector) {
      await page.waitForSelector(providerConfig.enableSelector, { timeout: 45000 });
      await page.click(providerConfig.enableSelector);
    } else {
      await page.getByText(providerConfig.enableText, { exact: false }).first().click({ timeout: 45000 });
    }

    if (providerConfig.afterEnableWaitMs > 0) {
      await page.waitForTimeout(providerConfig.afterEnableWaitMs);
    }
  } finally {
    await browser.close();
  }
}
