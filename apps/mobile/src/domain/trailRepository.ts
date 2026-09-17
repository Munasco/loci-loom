import type { MemoryTrail } from './trails';

export interface TrailRepository {
  list(): Promise<MemoryTrail[]>;
  save(trail: MemoryTrail): Promise<void>;
}

export class MemoryTrailRepository implements TrailRepository {
  constructor(private trails: MemoryTrail[] = []) {}
  async list() { return [...this.trails]; }
  async save(trail: MemoryTrail) { this.trails = [trail, ...this.trails.filter(item => item.id !== trail.id)]; }
}
