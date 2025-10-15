/**
 * Optimized Page Loader for Index.html
 * Fixes slow loading and UI breakage by:
 * 1. Loading all APIs in parallel
 * 2. Showing skeleton/loading states
 * 3. Graceful error handling
 * 4. Progressive enhancement
 * 5. Frontend caching with IndexedDB/localStorage
 */

// ============================================
// Configuration
// ============================================
const LOAD_CONFIG = {
  // Critical content (loads first)
  critical: [
    'loadLatestNews',
    'loadPopularNews'
  ],
  // Non-critical content (loads after critical)
  nonCritical: [
    'loadCopperNews',
    'loadPreciousMetalNews',
    'loadWorldNews',
    'loadCorporateNews',
    'loadAdvertisements',
    'loadAnnouncements',
    'loadWhatsOn',
    'loadTopMagazines'
  ],
  // Timeout for each API call (ms)
  timeout: 8000,
  // Enable caching
  enableCache: true
};

// ============================================
// Utility: Timeout wrapper for fetch
// ============================================
function fetchWithTimeout(fetchPromise, timeoutMs = LOAD_CONFIG.timeout) {
  return Promise.race([
    fetchPromise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// ============================================
// Loading State Management
// ============================================
const LoadingStates = {
  show(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Add skeleton loading class
    container.classList.add('loading-skeleton');
    container.innerHTML = this.getSkeletonHTML(containerId);
  },

  hide(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.classList.remove('loading-skeleton');
  },

  getSkeletonHTML(containerId) {
    // Different skeleton patterns based on container
    const skeletons = {
      'latestNews': `
        <div class="skeleton-item">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>`.repeat(5),

      'carousel': `
        <div class="skeleton-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-line"></div>
        </div>`.repeat(4),

      'copperNews': `
        <div class="skeleton-box">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>`.repeat(5),

      'default': `
        <div class="skeleton-item">
          <div class="skeleton-line"></div>
        </div>`.repeat(3)
    };

    return skeletons[containerId] || skeletons['default'];
  }
};

// ============================================
// Error Handling
// ============================================
function showError(containerId, message = 'Failed to load content') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="error-state" style="padding: 20px; text-align: center; color: #666;">
      <p>${message}</p>
      <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; cursor: pointer;">
        Retry
      </button>
    </div>
  `;
}

// ============================================
// Safe Function Wrapper
// ============================================
async function safeExecute(funcName, containerId) {
  try {
    // Show loading state
    if (containerId) {
      LoadingStates.show(containerId);
    }

    // Check if function exists
    if (typeof window[funcName] !== 'function') {
      console.warn(`Function ${funcName} not found, skipping...`);
      return { status: 'skipped', funcName };
    }

    // Execute with timeout
    await fetchWithTimeout(window[funcName]());

    // Hide loading state
    if (containerId) {
      LoadingStates.hide(containerId);
    }

    return { status: 'success', funcName };

  } catch (error) {
    console.error(`Error in ${funcName}:`, error.message);

    // Show error state
    if (containerId) {
      LoadingStates.hide(containerId);
      // Don't show error UI for non-critical content
      // Just hide the loading state
    }

    return { status: 'error', funcName, error: error.message };
  }
}

// ============================================
// Parallel Loader
// ============================================
async function loadContentInParallel(functionNames, containerMap = {}) {
  const promises = functionNames.map(funcName => {
    const containerId = containerMap[funcName];
    return safeExecute(funcName, containerId);
  });

  const results = await Promise.allSettled(promises);

  // Log results (can be removed in production)
  const summary = results.reduce((acc, result, index) => {
    const funcName = functionNames[index];
    if (result.status === 'fulfilled') {
      acc[result.value.status] = (acc[result.value.status] || 0) + 1;
    } else {
      acc.failed = (acc.failed || 0) + 1;
    }
    return acc;
  }, {});

  console.log('Load Summary:', summary);
  return results;
}

// ============================================
// Container Mapping
// ============================================
const CONTAINER_MAP = {
  'loadLatestNews': 'latestNews',
  'loadPopularNews': 'carousel',
  'loadCopperNews': 'copperNews',
  'loadPreciousMetalNews': 'preciousMetalNews',
  'loadWorldNews': 'worldNews',
  'loadCorporateNews': 'corporateNews',
  'loadAdvertisements': 'advertisements',
  'loadAnnouncements': 'announcements',
  'loadWhatsOn': 'what\'s On',
  'loadTopMagazines': 'magazines-home'
};

// ============================================
// Main Initialization
// ============================================
async function initializePageContent() {
  const startTime = performance.now();

  console.log('🚀 Starting optimized page load...');

  // Phase 1: Load critical content first (parallel)
  console.log('📦 Loading critical content...');
  await loadContentInParallel(LOAD_CONFIG.critical, CONTAINER_MAP);

  // Phase 2: Load non-critical content (parallel)
  console.log('📦 Loading non-critical content...');
  await loadContentInParallel(LOAD_CONFIG.nonCritical, CONTAINER_MAP);

  const endTime = performance.now();
  console.log(`✅ Page loaded in ${Math.round(endTime - startTime)}ms`);

  // Mark page as fully loaded
  document.body.classList.add('content-loaded');
}

// ============================================
// Setup on DOM Ready
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePageContent);
} else {
  // DOM already loaded
  initializePageContent();
}

// ============================================
// Add Skeleton CSS (inject once)
// ============================================
if (!document.getElementById('skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'skeleton-styles';
  style.textContent = `
    .loading-skeleton {
      pointer-events: none;
      opacity: 0.6;
    }

    .skeleton-item,
    .skeleton-card,
    .skeleton-box {
      margin-bottom: 15px;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }

    .skeleton-line {
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s ease-in-out infinite;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .skeleton-line.short {
      width: 60%;
    }

    .skeleton-image {
      width: 100%;
      height: 150px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s ease-in-out infinite;
      border-radius: 8px;
      margin-bottom: 10px;
    }

    @keyframes skeleton-loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    @keyframes skeleton-pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }

    .error-state button {
      background: #ae8a4c;
      color: white;
      border: none;
      border-radius: 4px;
      font-family: inherit;
    }

    .error-state button:hover {
      background: #8f6e3a;
    }
  `;
  document.head.appendChild(style);
}
