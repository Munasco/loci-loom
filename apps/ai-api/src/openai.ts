import { ModelTrailSchema, finishTrail } from './schema.js';

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4.1-mini';

export class OpenAiTrailGenerator {
  readonly provider = 'openai-fallback';

  constructor(private apiKey: string, private request: typeof fetch = fetch) {
    if (!apiKey) throw new Error('OPENAI_API_KEY is required');
  }

  async generate(topic: string, sourceText = '') {
    const response = await this.request(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.65,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You create accurate method-of-loci study trails. Return JSON only. Choose five distinct physical places connected as a walk. At each place, turn one essential concept into a concrete, exaggerated action. Do not invent facts; separate the factual anchor from the mnemonic image.' },
          { role: 'user', content: `Build a five-stop learning trail for “${topic}”. ${sourceText ? `Treat the following source notes as authoritative and select their five most important ideas: ${sourceText}` : ''} Return exactly {"scenes":[{"place":"","emoji":"","title":"","story":"","anchor":""}],"quiz":{"prompt":"","options":["","","",""],"correct":0,"explanation":""}}. Include exactly five scenes and four quiz options. The correct index must match the answer.` },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`);
    const completion = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenAI returned no trail content');
    const parsed = ModelTrailSchema.safeParse(JSON.parse(stripFence(content)));
    if (!parsed.success) throw new Error(`OpenAI returned an invalid trail: ${parsed.error.issues[0]?.message ?? 'schema mismatch'}`);
    return finishTrail(topic, parsed.data, sourceText);
  }
}

function stripFence(value: string) { return value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''); }
export const openAiConfig = { endpoint: ENDPOINT, model: MODEL };
