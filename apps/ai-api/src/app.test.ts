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
