import type { MemoryTrail } from './trails';
export interface TrailGenerator { generate(topic: string, sourceText?: string): Promise<MemoryTrail>; }
