import { expect, it, vi } from 'vitest';
import { handleRequest } from './app.js';

it('reports health without using paid inference', async () => {
  const generate = vi.fn();
  const response = await handleRequest(new Request('http://local/health'), { generate });
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', provider: 'nebius-token-factory' });
  expect(generate).not.toHaveBeenCalled();
});

it('validates a topic before generation', async () => {
  const response = await handleRequest(new Request('http://local/v1/trails', { method: 'POST', body: JSON.stringify({ topic: '' }) }), { generate: vi.fn() });
  expect(response.status).toBe(400);
});

it('answers browser CORS preflight without invoking generation', async () => {
  const generate = vi.fn();
  const response = await handleRequest(new Request('http://local/v1/trails', { method: 'OPTIONS' }), { generate });
  expect(response.status).toBe(204);
  expect(response.headers.get('access-control-allow-methods')).toContain('POST');
  expect(generate).not.toHaveBeenCalled();
});

it('forwards bounded source notes to generation', async () => {
  const generate = vi.fn().mockResolvedValue({ ok: true });
  const response = await handleRequest(new Request('http://local/v1/trails', { method: 'POST', body: JSON.stringify({ topic: 'Biology', sourceText: 'Mitosis creates two genetically identical daughter cells.' }) }), { generate });
  expect(response.status).toBe(200);
  expect(generate).toHaveBeenCalledWith('Biology', 'Mitosis creates two genetically identical daughter cells.');
});

it('rejects oversized source notes before paid inference', async () => {
  const generate = vi.fn();
  const response = await handleRequest(new Request('http://local/v1/trails', { method: 'POST', body: JSON.stringify({ topic: 'Biology', sourceText: 'x'.repeat(6001) }) }), { generate });
  expect(response.status).toBe(400);
  expect(generate).not.toHaveBeenCalled();
});
