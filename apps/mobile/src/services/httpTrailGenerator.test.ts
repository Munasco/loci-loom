import { HttpTrailGenerator } from './httpTrailGenerator';
import { generateTrail } from '../domain/trails';

it('requests and validates a hosted trail', async () => {
  const request = jest.fn().mockResolvedValue(new Response(JSON.stringify(generateTrail('SQL joins')), { status: 200 }));
  const trail = await new HttpTrailGenerator('https://trails.example/', request).generate('SQL joins', 'LEFT JOIN preserves every row on the left.');
  expect(request).toHaveBeenCalledWith('https://trails.example/v1/trails', expect.objectContaining({ method: 'POST' }));
  expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ topic: 'SQL joins', sourceText: 'LEFT JOIN preserves every row on the left.' });
  expect(trail.scenes).toHaveLength(5);
});

it('rejects a superficially shaped but unsafe response', async () => {
  const request = jest.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'bad', topic: 'Bad', scenes: Array(5).fill({}), quiz: {} }), { status: 200 }));
  await expect(new HttpTrailGenerator('https://trails.example', request).generate('Biology')).rejects.toThrow('invalid response');
});

it('surfaces a provider failure', async () => {
  const request = jest.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'No credits remain' }), { status: 502 }));
  await expect(new HttpTrailGenerator('https://trails.example', request).generate('Biology')).rejects.toThrow('No credits remain');
});
