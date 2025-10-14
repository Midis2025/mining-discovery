/**
 * Cache Manager for Mining Discovery
 * Implements smart caching with IndexedDB and localStorage fallback
 *
 * Features:
 * - IndexedDB for large data storage
 * - localStorage fallback for older browsers
 * - Automatic cache expiration
 * - Cache versioning (invalidate on updates)
 * - Size management
 * - Debug tools
 */

const CacheManager = (function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const CONFIG = {
    DB_NAME: 'MiningDiscoveryCache',
    DB_VERSION: 1,
    STORE_NAME: 'apiCache',

    // Cache durations (in milliseconds)
    CACHE_DURATIONS: {
      'latestNews': 5 * 60 * 1000,        // 5 minutes (frequently updated)
      'popularNews': 10 * 60 * 1000,      // 10 minutes
      'copperNews': 15 * 60 * 1000,       // 15 minutes
      'goldNews': 15 * 60 * 1000,         // 15 minutes
      'silverNews': 15 * 60 * 1000,       // 15 minutes
      'preciousMetalNews': 15 * 60 * 1000,
      'worldNews': 30 * 60 * 1000,        // 30 minutes
      'corporateNews': 15 * 60 * 1000,
      'advertisements': 60 * 60 * 1000,   // 1 hour (rarely changes)
      'announcements': 30 * 60 * 1000,
      'whatsOn': 30 * 60 * 1000,
      'magazines': 60 * 60 * 1000,        // 1 hour
      'sponsoredPost': 15 * 60 * 1000,
      'default': 15 * 60 * 1000           // 15 minutes default
    },

    // Max cache size (5MB)
    MAX_CACHE_SIZE: 5 * 1024 * 1024,

    // Cache version (increment to invalidate all caches)
    CACHE_VERSION: '1.0.0'
  };

  // ============================================
  // Private Variables
  // ============================================
  let db = null;
  let useIndexedDB = false;
  let cacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    size: 0
  };

  // ============================================
  // IndexedDB Setup
  // ============================================
  async function initIndexedDB() {
    return new Promise((resolve, reject) => {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        console.log('📦 IndexedDB not available, using localStorage');
        resolve(false);
        return;
      }

      const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

      request.onerror = () => {
        console.warn('Failed to open IndexedDB, falling back to localStorage');
        resolve(false);
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        useIndexedDB = true;
        console.log('✅ IndexedDB initialized successfully');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        // Create object store if it doesn't exist
        if (!database.objectStoreNames.contains(CONFIG.STORE_NAME)) {
          const objectStore = database.createObjectStore(CONFIG.STORE_NAME, { keyPath: 'key' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  // ============================================
  // Cache Key Generation
  // ============================================
  function generateCacheKey(url, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${CONFIG.CACHE_VERSION}:${url}${paramString ? '?' + paramString : ''}`;
  }

  // ============================================
  // Get Cache Duration
  // ============================================
  function getCacheDuration(key) {
    // Extract category from key
    for (const [category, duration] of Object.entries(CONFIG.CACHE_DURATIONS)) {
      if (key.toLowerCase().includes(category.toLowerCase())) {
        return duration;
      }
    }
    return CONFIG.CACHE_DURATIONS.default;
  }

  // ============================================
  // IndexedDB Operations
  // ============================================
  async function getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(CONFIG.STORE_NAME);
      const request = objectStore.get(key);

      request.onsuccess = () => {
        const result = request.result;

        if (!result) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() > result.expiresAt) {
          // Delete expired entry
          deleteFromIndexedDB(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => resolve(null);
    });
  }

  async function setToIndexedDB(key, data, duration) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CONFIG.STORE_NAME);

      const cacheEntry = {
        key: key,
        data: data,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration,
        size: JSON.stringify(data).length
      };

      const request = objectStore.put(cacheEntry);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async function deleteFromIndexedDB(key) {
    return new Promise((resolve) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CONFIG.STORE_NAME);
      const request = objectStore.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async function clearIndexedDB() {
    return new Promise((resolve) => {
      const transaction = db.transaction([CONFIG.STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CONFIG.STORE_NAME);
      const request = objectStore.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  // ============================================
  // localStorage Operations (Fallback)
  // ============================================
  function getFromLocalStorage(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      // Check if expired
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (e) {
      console.warn('localStorage read error:', e);
      return null;
    }
  }

  function setToLocalStorage(key, data, duration) {
    try {
      const cacheEntry = {
        data: data,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration
      };

      localStorage.setItem(key, JSON.stringify(cacheEntry));
      return true;
    } catch (e) {
      // QuotaExceededError - localStorage is full
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old entries');
        cleanupLocalStorage();

        // Try again
        try {
          localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + duration
          }));
          return true;
        } catch (e2) {
          console.error('Failed to cache after cleanup:', e2);
          return false;
        }
      }
      return false;
    }
  }

  function clearLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CONFIG.CACHE_VERSION)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
      return false;
    }
  }

  function cleanupLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      const entries = [];

      // Collect all cache entries with timestamps
      keys.forEach(key => {
        if (key.startsWith(CONFIG.CACHE_VERSION)) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            entries.push({ key, timestamp: item.timestamp || 0 });
          } catch (e) {
            // Invalid entry, remove it
            localStorage.removeItem(key);
          }
        }
      });

      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest 25% of entries
      const toRemove = Math.ceil(entries.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(entries[i].key);
      }

      console.log(`🧹 Cleaned up ${toRemove} old cache entries`);
    } catch (e) {
      console.error('Cleanup failed:', e);
    }
  }

  // ============================================
  // Public API
  // ============================================
  const API = {
    /**
     * Initialize the cache manager
     */
    async init() {
      await initIndexedDB();

      // Load stats
      this.updateStats();

      console.log(`📦 Cache Manager initialized (${useIndexedDB ? 'IndexedDB' : 'localStorage'})`);
      return true;
    },

    /**
     * Get data from cache
     */
    async get(key, params = {}) {
      const cacheKey = generateCacheKey(key, params);

      try {
        let data;

        if (useIndexedDB) {
          data = await getFromIndexedDB(cacheKey);
        } else {
          data = getFromLocalStorage(cacheKey);
        }

        if (data) {
          cacheStats.hits++;
          console.log(`✅ Cache HIT: ${key}`);
          return data;
        } else {
          cacheStats.misses++;
          console.log(`❌ Cache MISS: ${key}`);
          return null;
        }
      } catch (e) {
        cacheStats.errors++;
        console.error('Cache get error:', e);
        return null;
      }
    },

    /**
     * Set data to cache
     */
    async set(key, data, params = {}, customDuration = null) {
      const cacheKey = generateCacheKey(key, params);
      const duration = customDuration || getCacheDuration(key);

      try {
        let success;

        if (useIndexedDB) {
          success = await setToIndexedDB(cacheKey, data, duration);
        } else {
          success = setToLocalStorage(cacheKey, data, duration);
        }

        if (success) {
          console.log(`💾 Cached: ${key} (expires in ${Math.round(duration / 1000)}s)`);
        }

        return success;
      } catch (e) {
        cacheStats.errors++;
        console.error('Cache set error:', e);
        return false;
      }
    },

    /**
     * Delete specific cache entry
     */
    async delete(key, params = {}) {
      const cacheKey = generateCacheKey(key, params);

      try {
        if (useIndexedDB) {
          return await deleteFromIndexedDB(cacheKey);
        } else {
          localStorage.removeItem(cacheKey);
          return true;
        }
      } catch (e) {
        console.error('Cache delete error:', e);
        return false;
      }
    },

    /**
     * Clear all cache
     */
    async clear() {
      try {
        if (useIndexedDB) {
          await clearIndexedDB();
        } else {
          clearLocalStorage();
        }

        cacheStats = { hits: 0, misses: 0, errors: 0, size: 0 };
        console.log('🧹 Cache cleared');
        return true;
      } catch (e) {
        console.error('Cache clear error:', e);
        return false;
      }
    },

    /**
     * Get cache statistics
     */
    getStats() {
      return {
        ...cacheStats,
        hitRate: cacheStats.hits + cacheStats.misses > 0
          ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2) + '%'
          : '0%',
        backend: useIndexedDB ? 'IndexedDB' : 'localStorage'
      };
    },

    /**
     * Update cache size statistics
     */
    async updateStats() {
      try {
        let totalSize = 0;

        if (useIndexedDB && db) {
          const transaction = db.transaction([CONFIG.STORE_NAME], 'readonly');
          const objectStore = transaction.objectStore(CONFIG.STORE_NAME);
          const request = objectStore.getAll();

          request.onsuccess = () => {
            request.result.forEach(entry => {
              totalSize += entry.size || 0;
            });
            cacheStats.size = totalSize;
          };
        } else {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith(CONFIG.CACHE_VERSION)) {
              totalSize += localStorage.getItem(key).length;
            }
          });
          cacheStats.size = totalSize;
        }
      } catch (e) {
        console.warn('Failed to update cache stats:', e);
      }
    },

    /**
     * Check if cache is healthy
     */
    isHealthy() {
      return cacheStats.errors < 10; // Arbitrary threshold
    }
  };

  return API;
})();

// ============================================
// Auto-initialize
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CacheManager.init());
} else {
  CacheManager.init();
}

// ============================================
// Expose to window for debugging
// ============================================
window.CacheManager = CacheManager;
window.getCacheStats = () => {
  const stats = CacheManager.getStats();
  console.group('📊 Cache Statistics');
  console.log('Backend:', stats.backend);
  console.log('Hits:', stats.hits);
  console.log('Misses:', stats.misses);
  console.log('Hit Rate:', stats.hitRate);
  console.log('Errors:', stats.errors);
  console.log('Size:', (stats.size / 1024).toFixed(2) + ' KB');
  console.groupEnd();
  return stats;
};

window.clearCache = () => {
  CacheManager.clear();
  console.log('✅ Cache cleared. Reload the page to see fresh data.');
};
