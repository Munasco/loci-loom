import { ModelTrailSchema, finishTrail } from './schema.js';

const ENDPOINT = 'https://api.tokenfactory.us-central1.nebius.com/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-super-120b-a12b';

export class NebiusTrailGenerator {
  readonly provider = 'nebius-token-factory';

  constructor(private apiKey: string, private request: typeof fetch = fetch) {
    if (!apiKey) throw new Error('NEBIUS_API_KEY is required');
  }

  async generate(topic: string, sourceText = '') {
    const response = await this.request(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.65,
        max_tokens: 1800,
        messages: [
          { role: 'system', content: 'You design accurate method-of-loci learning trails. Return only valid JSON. Never invent factual claims. Each scene must connect one essential concept to a distinct physical location and memorable action.' },
          { role: 'user', content: `Create exactly five scenes and one four-option recall question about: ${topic}. ${sourceText ? `Treat these source notes as authoritative and cover their five most important ideas: ${sourceText}` : ''} Return {"scenes":[{"place":"","emoji":"","title":"","story":"","anchor":""}],"quiz":{"prompt":"","options":["","","",""],"correct":0,"explanation":""}}. The correct index must match the correct option.` },
        ],
      }),
    });
    if (!response.ok) throw new Error(`Nebius request failed (${response.status})`);
    const completion = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error('Nebius returned no trail content');
    const parsed = ModelTrailSchema.safeParse(JSON.parse(stripFence(content)));
    if (!parsed.success) throw new Error(`Nebius returned an invalid trail: ${parsed.error.issues[0]?.message ?? 'schema mismatch'}`);
    return finishTrail(topic, parsed.data, sourceText);
  }
}

function stripFence(value: string) { return value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''); }
export const tokenFactoryConfig = { endpoint: ENDPOINT, model: MODEL };
