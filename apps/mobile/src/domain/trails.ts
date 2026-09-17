export type TrailScene = { place: string; emoji: string; title: string; story: string; anchor: string; gradient: readonly [string, string] };
export type MemoryTrail = { id: string; topic: string; scenes: TrailScene[]; quiz: { prompt: string; options: string[]; correct: number; explanation: string } };

const palettes: Array<readonly [string, string]> = [['#5B326F', '#A14F78'], ['#315D70', '#4E9085'], ['#6E422D', '#D0744F'], ['#3E477A', '#7A67AA'], ['#305A49', '#6C9B67']];

export function generateTrail(rawTopic: string): MemoryTrail {
  const topic = rawTopic.trim().replace(/\s+/g, ' ');
  if (!topic) throw new Error('A topic is required');
  const normalized = topic.toLowerCase();
  if (normalized.includes('immune')) return immuneTrail(topic);
  if (normalized.includes('sql') || normalized.includes('join')) return sqlTrail(topic);
  if (normalized.includes('french') || normalized.includes('verb')) return frenchTrail(topic);
  return fallbackTrail(topic);
}

function immuneTrail(topic: string): MemoryTrail {
  return makeTrail(topic, [
    ['The sentinel gate', '🛡️', 'The first line never sleeps', 'Skin, mucus, and chemical barriers stand at a crowded gate, stopping invaders before they enter.', 'Innate barriers act immediately and broadly.'],
    ['The alarm canal', '🚨', 'Inflammation calls for help', 'A wounded canal flashes red and widens. Chemical signals increase blood flow and guide immune cells to the damage.', 'Inflammation recruits defenders to an injured site.'],
    ['The key workshop', '🔑', 'Antibodies fit one target', 'B cells forge Y-shaped keys. Each antibody recognizes a particular antigen and marks that target for removal.', 'Adaptive immunity is specific: one key, one antigen.'],
    ['The command balcony', '📯', 'T cells coordinate and destroy', 'Helper T cells direct the defense from a balcony while cytotoxic T cells remove infected cells below.', 'Helper T cells coordinate; cytotoxic T cells kill infected cells.'],
    ['The archive vault', '🗄️', 'Memory makes round two faster', 'After the battle, memory B and T cells file the invader’s portrait so the next response begins sooner and stronger.', 'Immune memory explains lasting protection and vaccination.'],
  ], 'Where were antigen-specific antibodies forged?', 2, 'The key workshop represented B cells producing antibodies that recognize a particular antigen.');
}

function sqlTrail(topic: string): MemoryTrail {
  return makeTrail(topic, [
    ['The matching doorway', '🤝', 'INNER keeps mutual matches', 'Two guest lists meet at one doorway. Only names appearing on both lists are allowed through.', 'INNER JOIN returns rows with matching keys in both tables.'],
    ['The left-hand gallery', '👈', 'LEFT keeps every left row', 'Every portrait from the left gallery stays on the wall; missing partners from the right become blank frames.', 'LEFT JOIN preserves all left rows and fills missing right values with NULL.'],
    ['The right-hand gallery', '👉', 'RIGHT mirrors the rule', 'Every right-side portrait remains, even when the left gallery has no matching frame.', 'RIGHT JOIN preserves all right rows.'],
    ['The union ballroom', '🪩', 'FULL keeps everyone', 'Both guest lists enter the ballroom. Matched guests pair up; unmatched guests still receive a place.', 'FULL OUTER JOIN preserves matched and unmatched rows from both tables.'],
    ['The multiplication garden', '✖️', 'CROSS makes every pairing', 'Each red flower is tied to every blue flower, producing every possible combination.', 'CROSS JOIN returns the Cartesian product.'],
  ], 'Which stop preserved every row from the left table?', 1, 'The left-hand gallery kept every left portrait and used blank frames—NULLs—when no right match existed.');
}

function frenchTrail(topic: string): MemoryTrail {
  return makeTrail(topic, [
    ['The pronoun station', '👥', 'Choose who performs the action', 'Six passengers—je, tu, il, nous, vous, ils—wait for a verb ticket that agrees with them.', 'Conjugation begins with the subject pronoun.'],
    ['The stem workshop', '✂️', 'Remove the infinitive ending', 'A tailor snips -er, -ir, or -re from the infinitive, leaving the stem ready for a new ending.', 'Regular verbs are built from a stable stem plus an ending.'],
    ['The ending carousel', '🎠', 'Each subject gets an ending', 'Pronouns ride labeled horses: for parler, je takes -e, tu takes -es, and ils takes -ent.', 'The ending carries person and number.'],
    ['The irregular alley', '🎭', 'Common verbs break the pattern', 'Être, avoir, aller, and faire wear disguises; their forms must be learned as distinct shapes.', 'High-frequency irregular verbs do not follow one regular template.'],
    ['The time bridge', '🌉', 'Tense changes the viewpoint', 'The same action crosses past, present, and future arches, changing its auxiliary or ending as it moves.', 'Tense places the action in time.'],
  ], 'Where was the infinitive ending removed?', 1, 'The stem workshop cut -er, -ir, or -re away before adding a subject-specific ending.');
}

function fallbackTrail(topic: string): MemoryTrail {
  const places = ['The brass doorway', 'The flooded library', 'The upside-down garden', 'The clockmaker’s roof', 'The lantern observatory'];
  const emoji = ['🚪', '📚', '🌿', '⏳', '🔭'];
  const concepts = ['first principle', 'moving parts', 'cause and effect', 'exception', 'lasting insight'];
  const scenes = concepts.map((concept, index) => [places[index], emoji[index], capitalize(concept), `Picture ${topic} as something alive here. Make its ${concept} exaggerated, physical, and impossible to ignore.`, `${capitalize(concept)}: connect the location, one unusual object, and the core idea.`] as const);
  return makeTrail(topic, scenes, `Which stop held the cause and effect of ${topic}?`, 2, 'The upside-down garden was the third stop, where causes visibly changed their effects.');
}

function makeTrail(topic: string, sceneData: ReadonlyArray<readonly [string, string, string, string, string]>, prompt: string, correct: number, explanation: string): MemoryTrail {
  const scenes = sceneData.map(([place, emoji, title, story, anchor], index) => ({ place, emoji, title, story, anchor, gradient: palettes[index] }));
  return { id: slug(topic), topic, scenes, quiz: { prompt, options: scenes.slice(0, 4).map(scene => scene.place), correct, explanation } };
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
