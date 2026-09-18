import { describe, expect, it, vi } from 'vitest';
import { OpenAiTrailGenerator, openAiConfig } from './openai.js';

const modelTrail = { scenes: Array.from({ length: 5 }, (_, index) => ({ place: `Place ${index}`, emoji: '🧠', title: `Concept ${index}`, story: 'A sufficiently detailed and accurate visual story for this concept.', anchor: 'A strong and memorable conceptual anchor.' })), quiz: { prompt: 'Which location represented the core principle?', options: ['A', 'B', 'C', 'D'], correct: 1, explanation: 'The second location represented the core principle.' } };

describe('OpenAI fallback trail generator', () => {
  it('requests JSON and validates the returned trail', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(modelTrail) } }] }), { status: 200 }));
    const result = await new OpenAiTrailGenerator('test-key', request).generate('Cell biology', 'Cells divide through mitosis.');
    const payload = JSON.parse(String(request.mock.calls[0]?.[1]?.body));
    expect(request).toHaveBeenCalledWith(openAiConfig.endpoint, expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-key' }) }));
    expect(payload.model).toBe(openAiConfig.model);
    expect(payload.response_format).toEqual({ type: 'json_object' });
    expect(result.scenes).toHaveLength(5);
    expect(result.sourceProvided).toBe(true);
  });

  it('rejects invalid model output', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '{"scenes":[]}' } }] }), { status: 200 }));
    await expect(new OpenAiTrailGenerator('test-key', request).generate('Biology')).rejects.toThrow('invalid trail');
  });
});
