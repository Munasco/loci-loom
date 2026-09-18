import { applyRecallResult, buildRecallQuestions, reviewTimingLabel } from './recall';
import { starterTrail } from './trails';

describe('adaptive recall', () => {
  it('builds three deterministic spatial questions', () => {
    const questions = buildRecallQuestions(starterTrail);
    expect(questions).toHaveLength(3);
    expect(questions[0]).toEqual(starterTrail.quiz);
    for (const question of questions) {
      expect(question.options[question.correct]).toBeTruthy();
    }
  });

  it('schedules a perfect recall three days out', () => {
    const now = new Date('2026-09-17T12:00:00.000Z');
    const updated = applyRecallResult(starterTrail, 3, 3, now);
    expect(updated.review).toEqual(expect.objectContaining({ attempts: 1, strength: 100 }));
    expect(updated.review?.nextReviewAt).toBe('2026-09-20T12:00:00.000Z');
    expect(reviewTimingLabel(updated.review, now)).toBe('Review in 3 days');
  });

  it('brings weak recall back after ten minutes and increments attempts', () => {
    const now = new Date('2026-09-17T12:00:00.000Z');
    const first = applyRecallResult(starterTrail, 1, 3, now);
    const second = applyRecallResult(first, 2, 3, now);
    expect(first.review?.nextReviewAt).toBe('2026-09-17T12:10:00.000Z');
    expect(second.review).toEqual(expect.objectContaining({ attempts: 2, strength: 67 }));
  });
});
