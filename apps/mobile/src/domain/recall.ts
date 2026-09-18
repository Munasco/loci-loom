import type { MemoryTrail } from './trails';

export type RecallQuestion = {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type ReviewState = {
  attempts: number;
  lastScore: number;
  totalQuestions: number;
  strength: number;
  nextReviewAt: string;
};

export function buildRecallQuestions(trail: MemoryTrail): RecallQuestion[] {
  const conceptIndex = stableIndex(trail.id, trail.scenes.length);
  const orderIndex = stableIndex(`${trail.id}-order`, trail.scenes.length - 1);
  const conceptScene = trail.scenes[conceptIndex];
  const nextScene = trail.scenes[orderIndex + 1];

  return [
    trail.quiz,
    {
      prompt: `What idea belongs at ${conceptScene.place}?`,
      options: trail.scenes.map((scene) => scene.title),
      correct: conceptIndex,
      explanation: `${conceptScene.place} holds “${conceptScene.title}”: ${conceptScene.anchor}`,
    },
    {
      prompt: `Which stop comes directly after ${trail.scenes[orderIndex].place}?`,
      options: trail.scenes.map((scene) => scene.place),
      correct: orderIndex + 1,
      explanation: `${nextScene.place} is the next landmark in this trail. Recalling the route strengthens the ideas attached to it.`,
    },
  ];
}

export function applyRecallResult(
  trail: MemoryTrail,
  correct: number,
  totalQuestions: number,
  now = new Date(),
): MemoryTrail {
  const intervalMinutes = correct === totalQuestions ? 3 * 24 * 60 : correct >= 2 ? 24 * 60 : 10;
  const nextReviewAt = new Date(now.getTime() + intervalMinutes * 60_000).toISOString();
  return {
    ...trail,
    review: {
      attempts: (trail.review?.attempts ?? 0) + 1,
      lastScore: correct,
      totalQuestions,
      strength: Math.round((correct / totalQuestions) * 100),
      nextReviewAt,
    },
  };
}

export function reviewTimingLabel(review: ReviewState | undefined, now = new Date()): string {
  if (!review) return 'Ready for a first recall';
  const minutes = Math.max(0, Math.round((new Date(review.nextReviewAt).getTime() - now.getTime()) / 60_000));
  if (minutes <= 0) return 'Ready to review now';
  if (minutes < 60) return `Review in ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `Review in ${hours} hr`;
  return `Review in ${Math.round(hours / 24)} days`;
}

function stableIndex(value: string, length: number): number {
  const hash = [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
  return hash % length;
}
