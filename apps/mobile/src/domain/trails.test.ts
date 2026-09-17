import { generateTrail } from './trails';
describe('generateTrail', () => {
  it('creates five distinct, ordered scenes', () => { const trail = generateTrail('  SQL   joins  '); expect(trail.topic).toBe('SQL joins'); expect(trail.scenes).toHaveLength(5); expect(new Set(trail.scenes.map(scene => scene.place)).size).toBe(5); expect(trail.quiz.options).toContain(trail.scenes[trail.quiz.correct].place); });
  it('rejects an empty topic', () => { expect(() => generateTrail('   ')).toThrow('A topic is required'); });
  it('builds an accurate immune-system trail for the judge-facing suggestion', () => { const trail = generateTrail('The immune system'); expect(trail.scenes.map(scene => scene.anchor).join(' ')).toContain('Adaptive immunity'); expect(trail.scenes.map(scene => scene.anchor).join(' ')).toContain('cytotoxic T cells'); expect(trail.quiz.correct).toBe(2); });
  it('maps SQL join types to distinct spatial rules', () => { const trail = generateTrail('SQL joins'); expect(trail.scenes.map(scene => scene.title)).toEqual(expect.arrayContaining(['INNER keeps mutual matches', 'LEFT keeps every left row', 'CROSS makes every pairing'])); });
});
