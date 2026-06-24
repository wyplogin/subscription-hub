// Copy this file and set PROVIDER_ADAPTER=./src/provider/your-provider.js
// when the provider website needs custom navigation or a second factor.
export async function enableProviderSubscription({ config, log }) {
  log(`Custom adapter placeholder for ${config.loginUrl || 'provider website'}.`);
  throw new Error('Implement provider-specific login and enable-click logic here.');
}
