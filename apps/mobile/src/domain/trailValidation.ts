import type { MemoryTrail } from './trails';

export function isMemoryTrail(value: unknown): value is MemoryTrail {
  if (!value || typeof value !== 'object') return false;
  const trail = value as Partial<MemoryTrail>;
  if (!isText(trail.id) || !isText(trail.topic) || !Array.isArray(trail.scenes) || trail.scenes.length !== 5) return false;
  if (!trail.scenes.every((scene) => isText(scene.place) && isText(scene.emoji) && isText(scene.title) && isText(scene.story) && isText(scene.anchor) && Array.isArray(scene.gradient) && scene.gradient.length === 2 && scene.gradient.every(isText))) return false;
  const quiz = trail.quiz;
  if (!quiz || !isText(quiz.prompt) || !Array.isArray(quiz.options) || quiz.options.length !== 4 || !quiz.options.every(isText) || !Number.isInteger(quiz.correct) || quiz.correct < 0 || quiz.correct > 3 || !isText(quiz.explanation)) return false;
  return true;
}

function isText(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
