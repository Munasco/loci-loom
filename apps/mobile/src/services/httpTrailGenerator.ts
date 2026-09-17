import type { TrailGenerator } from '../domain/trailGenerator';
import type { MemoryTrail } from '../domain/trails';

export class HttpTrailGenerator implements TrailGenerator {
  constructor(private baseUrl: string, private request: typeof fetch = fetch) {}
  async generate(topic: string): Promise<MemoryTrail> {
    const response = await this.request(`${this.baseUrl.replace(/\/$/, '')}/v1/trails`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic }) });
    const body = await response.json() as MemoryTrail | { error?: string };
    if (!response.ok) throw new Error('error' in body && body.error ? body.error : `Trail generation failed (${response.status})`);
    if (!isTrail(body)) throw new Error('The trail service returned an invalid response');
    return body;
  }
}

function isTrail(value: unknown): value is MemoryTrail { if (!value || typeof value !== 'object') return false; const item = value as Partial<MemoryTrail>; return typeof item.id === 'string' && typeof item.topic === 'string' && Array.isArray(item.scenes) && item.scenes.length === 5 && Boolean(item.quiz); }
