// Shared CORS headers for all Netlify functions
// This file provides consistent CORS configuration across the API

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export const corsPreflightResponse = {
  statusCode: 204,
  headers: corsHeaders,
  body: ''
};

/**
 * Adds CORS headers to a response object
 */
export function withCors(response: { statusCode: number; body: string; headers?: Record<string, string> }) {
  return {
    ...response,
    headers: {
      ...corsHeaders,
      ...response.headers
    }
  };
}
