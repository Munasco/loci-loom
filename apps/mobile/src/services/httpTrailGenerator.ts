import type { TrailGenerator } from '../domain/trailGenerator';
import type { MemoryTrail } from '../domain/trails';
import { isMemoryTrail } from '../domain/trailValidation';

export class HttpTrailGenerator implements TrailGenerator {
  constructor(private baseUrl: string, private request: typeof fetch = (...args) => globalThis.fetch(...args)) {}
  async generate(topic: string, sourceText?: string): Promise<MemoryTrail> {
    const response = await this.request(`${this.baseUrl.replace(/\/$/, '')}/v1/trails`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, sourceText }) });
    const body = await response.json() as MemoryTrail | { error?: string };
    if (!response.ok) throw new Error('error' in body && body.error ? body.error : `Trail generation failed (${response.status})`);
    if (!isMemoryTrail(body)) throw new Error('The trail service returned an invalid response');
    return body;
  }
}
