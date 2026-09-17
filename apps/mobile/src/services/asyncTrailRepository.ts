import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TrailRepository } from '../domain/trailRepository';
import type { MemoryTrail } from '../domain/trails';

const STORAGE_KEY = 'loci-loom:trails:v1';

export class AsyncTrailRepository implements TrailRepository {
  async list(): Promise<MemoryTrail[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      const trails = JSON.parse(stored) as MemoryTrail[];
      return Array.isArray(trails) ? trails : [];
    } catch {
      return [];
    }
  }

  async save(trail: MemoryTrail): Promise<void> {
    const trails = await this.list();
    const withoutDuplicate = trails.filter(item => item.id !== trail.id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([trail, ...withoutDuplicate]));
  }
}
