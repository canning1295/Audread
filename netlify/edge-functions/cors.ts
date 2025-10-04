type EdgeContext = { next: () => Promise<Response> };

export default async (request: Request, context: EdgeContext) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  const res: Response = await context.next();
  const merged = new Headers(res.headers);
  const extra = corsHeaders();
  for (const [k, v] of Object.entries(extra)) merged.set(k, v);
  return new Response(res.body, { status: res.status, headers: merged });
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}
