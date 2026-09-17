import { describe, expect, it, vi } from 'vitest';
import { NebiusTrailGenerator, tokenFactoryConfig } from './nebius.js';

const modelTrail = { scenes: Array.from({ length: 5 }, (_, index) => ({ place: `Place ${index}`, emoji: '🧠', title: `Concept ${index}`, story: 'A sufficiently detailed and accurate visual story for this concept.', anchor: 'A strong and memorable conceptual anchor.' })), quiz: { prompt: 'Which location represented the core principle?', options: ['A', 'B', 'C', 'D'], correct: 1, explanation: 'The second location represented the core principle.' } };

it('calls the official Token Factory endpoint and Nemotron model', async () => {
  const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(modelTrail) } }] }), { status: 200 }));
  const result = await new NebiusTrailGenerator('credit-key', request).generate('Cell biology');
  expect(request).toHaveBeenCalledWith(tokenFactoryConfig.endpoint, expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer credit-key' }) }));
  const payload = JSON.parse(String(request.mock.calls[0]?.[1]?.body));
  expect(payload.model).toBe(tokenFactoryConfig.model);
  expect(result.scenes).toHaveLength(5);
  expect(result.scenes[0]?.gradient).toHaveLength(2);
});

it('rejects malformed model output instead of returning unsafe content', async () => {
  const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '{"scenes":[]}' } }] }), { status: 200 }));
  await expect(new NebiusTrailGenerator('credit-key', request).generate('Biology')).rejects.toThrow('invalid trail');
});
