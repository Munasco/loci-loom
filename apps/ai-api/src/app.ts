import type { NebiusTrailGenerator } from './nebius.js';

export async function handleRequest(request: Request, generator: Pick<NebiusTrailGenerator, 'generate'>): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  const provider = 'provider' in generator && typeof generator.provider === 'string' ? generator.provider : 'nebius-token-factory';
  if (request.method === 'GET' && url.pathname === '/health') return json({ status: 'ok', provider });
  if (request.method !== 'POST' || url.pathname !== '/v1/trails') return json({ error: 'Not found' }, 404);
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: 'A JSON body is required' }, 400); }
  const topic = typeof body === 'object' && body !== null && 'topic' in body && typeof body.topic === 'string' ? body.topic.trim() : '';
  if (topic.length < 2 || topic.length > 160) return json({ error: 'Topic must contain 2–160 characters' }, 400);
  const sourceText = typeof body === 'object' && body !== null && 'sourceText' in body && typeof body.sourceText === 'string' ? body.sourceText.trim() : '';
  if (sourceText.length > 6000) return json({ error: 'Source notes must contain at most 6,000 characters' }, 400);
  try { return json(await generator.generate(topic, sourceText)); }
  catch (error) { return json({ error: error instanceof Error ? error.message : 'Generation failed' }, 502); }
}

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
function json(value: unknown, status = 200) { return Response.json(value, { status, headers: corsHeaders }); }
