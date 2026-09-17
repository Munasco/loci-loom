import { z } from 'zod';

export const ModelTrailSchema = z.object({
  scenes: z.array(z.object({
    place: z.string().min(3).max(80),
    emoji: z.string().min(1).max(12),
    title: z.string().min(3).max(90),
    story: z.string().min(20).max(320),
    anchor: z.string().min(10).max(180),
  })).length(5),
  quiz: z.object({
    prompt: z.string().min(10).max(180),
    options: z.array(z.string().min(1).max(100)).length(4),
    correct: z.number().int().min(0).max(3),
    explanation: z.string().min(10).max(240),
  }),
});

export type ModelTrail = z.infer<typeof ModelTrailSchema>;

const gradients = [['#5B326F', '#A14F78'], ['#315D70', '#4E9085'], ['#6E422D', '#D0744F'], ['#3E477A', '#7A67AA'], ['#305A49', '#6C9B67']] as const;

export function finishTrail(topic: string, modelTrail: ModelTrail) {
  return {
    id: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    topic,
    scenes: modelTrail.scenes.map((scene, index) => ({ ...scene, gradient: gradients[index] })),
    quiz: modelTrail.quiz,
  };
}
