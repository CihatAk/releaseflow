import { Redis } from '@upstash/redis';

// Redis client for caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export class CacheService {
  private static instance: CacheService;
  private redis: Redis;

  private constructor() {
    this.redis = redis;
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key) as string;
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (options.ttl) {
        await this.redis.setex(key, options.ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  // Cache helpers for specific use cases
  async getCachedRepo(owner: string, repo: string): Promise<any> {
    const key = `repo:${owner}:${repo}`;
    return this.get(key);
  }

  async setCachedRepo(owner: string, repo: string, data: any, ttl: number = 3600): Promise<void> {
    const key = `repo:${owner}:${repo}`;
    return this.set(key, data, { ttl });
  }

  async getCachedChangelog(owner: string, repo: string, version?: string): Promise<any> {
    const key = `changelog:${owner}:${repo}${version ? `:${version}` : ''}`;
    return this.get(key);
  }

  async setCachedChangelog(owner: string, repo: string, data: any, version?: string, ttl: number = 1800): Promise<void> {
    const key = `changelog:${owner}:${repo}${version ? `:${version}` : ''}`;
    return this.set(key, data, { ttl });
  }

  async getCachedCommits(owner: string, repo: string, since?: string): Promise<any> {
    const key = `commits:${owner}:${repo}${since ? `:${since}` : ''}`;
    return this.get(key);
  }

  async setCachedCommits(owner: string, repo: string, data: any, since?: string, ttl: number = 900): Promise<void> {
    const key = `commits:${owner}:${repo}${since ? `:${since}` : ''}`;
    return this.set(key, data, { ttl });
  }
}

export const cache = CacheService.getInstance();
