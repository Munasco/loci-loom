import { HttpTrailGenerator } from './httpTrailGenerator';
import { generateTrail } from '../domain/trails';

it('requests and validates a hosted trail', async () => {
  const request = jest.fn().mockResolvedValue(new Response(JSON.stringify(generateTrail('SQL joins')), { status: 200 }));
  const trail = await new HttpTrailGenerator('https://trails.example/', request).generate('SQL joins');
  expect(request).toHaveBeenCalledWith('https://trails.example/v1/trails', expect.objectContaining({ method: 'POST' }));
  expect(trail.scenes).toHaveLength(5);
});

it('surfaces a provider failure', async () => {
  const request = jest.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'No credits remain' }), { status: 502 }));
  await expect(new HttpTrailGenerator('https://trails.example', request).generate('Biology')).rejects.toThrow('No credits remain');
});
