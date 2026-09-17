import { MemoryTrailRepository } from './trailRepository';
import { generateTrail } from './trails';

it('stores newest trails first without duplicates', async () => {
  const repository = new MemoryTrailRepository();
  const biology = generateTrail('Cell biology');
  const algebra = generateTrail('Linear algebra');
  await repository.save(biology);
  await repository.save(algebra);
  await repository.save(biology);
  expect((await repository.list()).map(trail => trail.topic)).toEqual(['Cell biology', 'Linear algebra']);
});
