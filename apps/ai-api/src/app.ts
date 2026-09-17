import type { NebiusTrailGenerator } from './nebius.js';

export async function handleRequest(request: Request, generator: Pick<NebiusTrailGenerator, 'generate'>): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname === '/health') return json({ status: 'ok', provider: 'nebius-token-factory' });
  if (request.method !== 'POST' || url.pathname !== '/v1/trails') return json({ error: 'Not found' }, 404);
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: 'A JSON body is required' }, 400); }
  const topic = typeof body === 'object' && body !== null && 'topic' in body && typeof body.topic === 'string' ? body.topic.trim() : '';
  if (topic.length < 2 || topic.length > 160) return json({ error: 'Topic must contain 2–160 characters' }, 400);
  try { return json(await generator.generate(topic)); }
  catch (error) { return json({ error: error instanceof Error ? error.message : 'Generation failed' }, 502); }
}

function json(value: unknown, status = 200) { return Response.json(value, { status, headers: { 'Access-Control-Allow-Origin': '*' } }); }
