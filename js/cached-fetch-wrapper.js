/**
 * Cached Fetch Wrapper
 * Wraps the native fetch API to add automatic caching
 * Works transparently with existing code
 */

(function() {
  'use strict';

  // Store original fetch
  const originalFetch = window.fetch;
  let cacheReady = false;

  // Wait for CacheManager to be ready
  const waitForCache = new Promise((resolve) => {
    if (window.CacheManager) {
      window.CacheManager.init().then(() => {
        cacheReady = true;
        resolve();
      });
    } else {
      // Retry every 100ms for up to 5 seconds
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.CacheManager) {
          clearInterval(interval);
          window.CacheManager.init().then(() => {
            cacheReady = true;
            resolve();
          });
        } else if (attempts > 50) {
          clearInterval(interval);
          console.warn('⚠️ CacheManager not found, caching disabled');
          resolve();
        }
      }, 100);
    }
  });

  /**
   * Generate cache key from URL and options
   */
  function generateCacheKey(url, options = {}) {
    const urlObj = new URL(url, window.location.origin);

    // Extract category or content type from URL
    const path = urlObj.pathname;
    const params = urlObj.searchParams.toString();

    // Determine cache key based on URL patterns
    let cacheKey = 'default';

    if (url.includes('latest-news') || path.includes('latest-news')) {
      cacheKey = 'latestNews';
    } else if (url.includes('silver-news') || path.includes('silver-news')) {
      cacheKey = 'silverNews';
    } else if (url.includes('copper-news') || path.includes('copper-news')) {
      cacheKey = 'copperNews';
    } else if (url.includes('gold-news') || path.includes('gold-news')) {
      cacheKey = 'goldNews';
    } else if (url.includes('precious-metal') || path.includes('precious-metal')) {
      cacheKey = 'preciousMetalNews';
    } else if (url.includes('world-news') || path.includes('world-news')) {
      cacheKey = 'worldNews';
    } else if (url.includes('corporate-news') || path.includes('corporate-news')) {
      cacheKey = 'corporateNews';
    } else if (url.includes('sponsored-post') || path.includes('sponsored-post')) {
      cacheKey = 'sponsoredPost';
    } else if (url.includes('advertisements') || path.includes('advertisements')) {
      cacheKey = 'advertisements';
    } else if (url.includes('announcements') || path.includes('announcements')) {
      cacheKey = 'announcements';
    } else if (url.includes('magazines') || path.includes('magazines')) {
      cacheKey = 'magazines';
    }

    return { cacheKey, params: { url: urlObj.href } };
  }

  /**
   * Check if URL should be cached
   */
  function shouldCache(url, options = {}) {
    // Only cache GET requests
    if (options.method && options.method.toUpperCase() !== 'GET') {
      return false;
    }

    // Only cache API calls
    const urlObj = new URL(url, window.location.origin);
    const isStrapiAPI = urlObj.hostname.includes('strapiapp.com') ||
                        urlObj.hostname.includes('miningdiscovery.com');

    return isStrapiAPI;
  }

  /**
   * Check if caching is enabled globally
   */
  function isCachingEnabled() {
    // Check if LOAD_CONFIG exists and has enableCache set to true
    // Default to true if not defined
    if (typeof window.LOAD_CONFIG !== 'undefined') {
      return window.LOAD_CONFIG.enableCache !== false;
    }
    // Default: caching is enabled
    return true;
  }

  /**
   * Enhanced fetch with caching
   */
  window.fetch = async function(url, options = {}) {
    // If caching is disabled or not a cacheable request, use original fetch
    if (!isCachingEnabled() || !shouldCache(url, options)) {
      return originalFetch(url, options);
    }

    // Wait for cache to be ready
    await waitForCache;

    // If cache is not available, use original fetch
    if (!cacheReady || !window.CacheManager) {
      return originalFetch(url, options);
    }

    // Generate cache key
    const { cacheKey, params } = generateCacheKey(url, options);

    try {
      // Try to get from cache first
      const cachedData = await window.CacheManager.get(cacheKey, params);

      if (cachedData !== null) {
        console.log(`🚀 Serving from cache: ${cacheKey}`);

        // Return a fake Response object that looks like a real fetch response
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          statusText: 'OK (Cached)',
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT'
          }
        });
      }

      // Not in cache, fetch from network
      console.log(`🌐 Fetching from network: ${cacheKey}`);
      const response = await originalFetch(url, options);

      // Only cache successful responses
      if (response.ok) {
        // Clone the response so we can read it
        const clonedResponse = response.clone();

        try {
          const data = await clonedResponse.json();

          // Cache the data asynchronously (don't wait for it)
          window.CacheManager.set(cacheKey, data, params).catch(err => {
            console.warn('Failed to cache response:', err);
          });
        } catch (jsonError) {
          // Response wasn't JSON, don't cache it
          console.warn('Response is not JSON, skipping cache');
        }
      }

      return response;

    } catch (error) {
      // If anything goes wrong with caching, fall back to original fetch
      console.warn('Cache error, falling back to network:', error);
      return originalFetch(url, options);
    }
  };

  // Preserve the original fetch for debugging
  window.fetch.original = originalFetch;

  console.log('✅ Cached fetch wrapper installed');

})();

// ============================================
// Cache Control UI (for debugging)
// ============================================
window.showCacheControl = function() {
  const existingPanel = document.getElementById('cache-control-panel');
  if (existingPanel) {
    existingPanel.remove();
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'cache-control-panel';
  panel.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #ae8a4c;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong style="color: #ae8a4c;">🗄️ Cache Control</strong>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
        ">×</button>
      </div>

      <div id="cache-stats-display" style="font-size: 13px; margin-bottom: 10px; line-height: 1.6;">
        Loading stats...
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button onclick="window.getCacheStats(); updateCacheStatsDisplay()" style="
          background: #ae8a4c;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Refresh Stats</button>

        <button onclick="window.clearCache(); setTimeout(() => updateCacheStatsDisplay(), 100)" style="
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Clear Cache</button>

        <button onclick="location.reload()" style="
          background: #28a745;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Reload Page</button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Update stats display
  window.updateCacheStatsDisplay = function() {
    const statsDiv = document.getElementById('cache-stats-display');
    if (!statsDiv || !window.CacheManager) return;

    const stats = window.CacheManager.getStats();
    statsDiv.innerHTML = `
      <div><strong>Backend:</strong> ${stats.backend}</div>
      <div><strong>Hits:</strong> ${stats.hits} | <strong>Misses:</strong> ${stats.misses}</div>
      <div><strong>Hit Rate:</strong> ${stats.hitRate}</div>
      <div><strong>Size:</strong> ${(stats.size / 1024).toFixed(2)} KB</div>
      <div><strong>Errors:</strong> ${stats.errors}</div>
    `;
  };

  updateCacheStatsDisplay();
};

// Add keyboard shortcut: Ctrl+Shift+C to toggle cache control panel
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    window.showCacheControl();
  }
});

console.log('💡 Press Ctrl+Shift+C to open Cache Control Panel');
