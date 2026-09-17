import type { MemoryTrail } from './trails';
export interface TrailGenerator { generate(topic: string): Promise<MemoryTrail>; }
