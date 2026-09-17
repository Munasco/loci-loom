export type TrailScene = { place: string; emoji: string; title: string; story: string; anchor: string; gradient: readonly [string, string] };
export type MemoryTrail = { id: string; topic: string; scenes: TrailScene[]; quiz: { prompt: string; options: string[]; correct: number; explanation: string } };
const palettes: Array<readonly [string, string]> = [['#5B326F', '#A14F78'], ['#315D70', '#4E9085'], ['#6E422D', '#D0744F'], ['#3E477A', '#7A67AA'], ['#305A49', '#6C9B67']];
const places = ['The brass doorway', 'The flooded library', 'The upside-down garden', 'The clockmaker’s roof', 'The lantern observatory'];
const emoji = ['🚪', '📚', '🌿', '⏳', '🔭'];
export function generateTrail(rawTopic: string): MemoryTrail {
  const topic = rawTopic.trim().replace(/\s+/g, ' '); if (!topic) throw new Error('A topic is required');
  const words = topic.split(' '); const key = words.length > 3 ? words.slice(0, 3).join(' ') : topic; const concepts = ['first principle', 'moving parts', 'cause and effect', 'exception', 'lasting insight'];
  return { id: slug(topic), topic, scenes: concepts.map((concept, index) => ({ place: places[index], emoji: emoji[index], gradient: palettes[index], title: index === 0 ? `Meet ${key}` : capitalize(concept), story: `Picture ${topic} as something alive in ${places[index].toLowerCase()}. Its ${concept} becomes exaggerated, physical, and impossible to ignore.`, anchor: `${capitalize(concept)}: connect the location, the unusual object, and the core idea in one mental snapshot.` })), quiz: { prompt: `Which stop held the cause and effect of ${topic}?`, options: [places[0], places[1], places[2], places[4]], correct: 2, explanation: 'The upside-down garden was your third stop—the place where causes visibly changed their effects.' } };
}
export const starterTrail: MemoryTrail = { id: 'how-memory-works', topic: 'How memory works', scenes: [
  { place: 'The velvet gate', emoji: '🧠', title: 'Attention opens the gate', story: 'A bright gate ignores every thought except the one lit by attention. What you notice gets permission to enter.', anchor: 'Attention decides what reaches working memory.', gradient: ['#58316F', '#A24D76'] },
  { place: 'The echo hall', emoji: '🔔', title: 'Working memory rings briefly', story: 'Seven bells hold small fragments for only a moment. Repeat one and its echo lasts longer.', anchor: 'Working memory is limited and temporary.', gradient: ['#315B70', '#4C9387'] },
  { place: 'The glass garden', emoji: '🌱', title: 'Connections make roots', story: 'New ideas grow roots only when they touch something already planted. More connections make the memory harder to pull free.', anchor: 'Meaningful associations strengthen encoding.', gradient: ['#385A49', '#7BA269'] },
  { place: 'The sleeping workshop', emoji: '🌙', title: 'Sleep sets the shape', story: 'At night, quiet hands file, join, and store the day’s fragile pieces while the workshop is closed.', anchor: 'Sleep supports memory consolidation.', gradient: ['#41467A', '#7164A5'] },
  { place: 'The recall bridge', emoji: '🌉', title: 'Crossing rebuilds the bridge', story: 'Every attempt to cross repairs the path. Looking at a map feels easy; retrieving the route makes it durable.', anchor: 'Active recall strengthens future retrieval.', gradient: ['#78452E', '#D17A4D'] }
], quiz: { prompt: 'What makes a new memory grow deeper roots?', options: ['More connections', 'Longer exposure', 'Perfect silence', 'Reading it once'], correct: 0, explanation: 'The glass garden showed that new knowledge lasts when it connects to what you already know.' } };
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
