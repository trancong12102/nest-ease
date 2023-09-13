export class CacheManager {
  private readonly _cacheMap: Record<string, unknown>;

  constructor() {
    this._cacheMap = {};
  }

  get<T>(key: string): T {
    return this._cacheMap[key] as T;
  }

  set<T>(key: string, value: T) {
    this._cacheMap[key] = value;
  }

  resolve<T>(key: string, fn: () => T): T {
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    const value = fn();
    this.set(key, value);

    return value;
  }
}
