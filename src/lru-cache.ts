/**
 * A Least Recently Used (LRU) cache with Time-to-Live (TTL) support. Items are kept in the cache until they either
 * reach their TTL or the cache reaches its size and/or item limit. When the limit is exceeded, the cache evicts the
 * item that was least recently accessed (based on the timestamp of access). Items are also automatically evicted if they
 * are expired, as determined by the TTL.
 * An item is considered accessed, and its last accessed timestamp is updated, whenever `has`, `get`, or `set` is called with its key.
 *
 * Implement the LRU cache provider here and use the lru-cache.test.ts to check your implementation.
 * You're encouraged to add additional functions that make working with the cache easier for consumers.
 */

type LRUCacheProviderOptions = {
  ttl: number // Time to live in milliseconds
  itemLimit: number
}
type LRUCacheProvider<T> = {
  has: (key: string) => boolean
  get: (key: string) => T | undefined
  set: (key: string, value: T) => void
}

export function createLRUCacheProvider<T>({
  ttl,
  itemLimit,
}: LRUCacheProviderOptions): LRUCacheProvider<T> {
  const cache: Map<string, { value: T; expiry: number }> = new Map()

  return {
    has: (key: string) => {
      const currentTime = Date.now()
      const cacheItem = cache.get(key)
      if (!cacheItem) {
        return false
      }
      if (cacheItem && cacheItem.expiry < currentTime) {
        cache.delete(key)
        return false
      }

      cache.delete(key)
      cache.set(key, { value: cacheItem.value, expiry: currentTime + ttl })
      return true
    },
    get: (key: string) => {
      const currentTime = Date.now()
      const cacheItem = cache.get(key)
      if (!cacheItem) {
        return undefined
      }

      if (cacheItem.expiry < currentTime) {
        cache.delete(key)
        return undefined
      }

      // Move item to the end to be the recent item
      cache.delete(key)
      cache.set(key, { value: cacheItem.value, expiry: currentTime + ttl })

      return cacheItem.value
    },
    set: (key: string, value: T) => {
      const currentTime = Date.now()
      if (cache.has(key)) {
        // Remove key if already exists
        cache.delete(key)
      }

      if (cache.size === itemLimit) {
        // Remove oldest key if limit exceeds
        const oldestKey = cache.keys().next().value ?? ''
        cache.delete(oldestKey)
      }

      cache.set(key, { value, expiry: currentTime + ttl })
    },
  }
}
