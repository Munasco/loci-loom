import { generateTrail } from './trails';
describe('generateTrail', () => {
  it('creates five distinct, ordered scenes', () => { const trail = generateTrail('  SQL   joins  '); expect(trail.topic).toBe('SQL joins'); expect(trail.scenes).toHaveLength(5); expect(new Set(trail.scenes.map(scene => scene.place)).size).toBe(5); expect(trail.quiz.options).toContain(trail.scenes[trail.quiz.correct].place); });
  it('rejects an empty topic', () => { expect(() => generateTrail('   ')).toThrow('A topic is required'); });
});
