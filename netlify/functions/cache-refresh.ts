import type { Handler } from '@netlify/functions';

// Scheduled function to update caches (dictionary shards, etc.)
export const handler: Handler = async () => {
  // TODO: pull latest Wiktextract dumps or refresh hot terms cache
  return { statusCode: 200, body: 'ok' };
};
