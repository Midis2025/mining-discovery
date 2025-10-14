/**
 * Smooth Content Loader for Index.html
 *
 * Fixes jerky loading with:
 * 1. Smooth fade-in transitions
 * 2. Staggered content appearance
 * 3. Skeleton states with CSS transitions
 * 4. No sudden content jumps
 * 5. Professional loading experience
 */

// ============================================
// Configuration
// ============================================
const SMOOTH_CONFIG = {
  // Animation timings (in milliseconds)
  fadeInDuration: 400,        // How long fade-in takes
  staggerDelay: 80,           // Delay between each item appearing
  skeletonMinTime: 300,       // Minimum time to show skeleton

  // Content loading order
  critical: [
    { func: 'loadLatestNews', container: 'latestNews' },
    { func: 'loadPopularNews', container: 'carousel' }
  ],
  nonCritical: [
    { func: 'loadCopperNews', container: 'copperNews' },
    { func: 'loadPreciousMetalNews', container: 'preciousMetalNews' },
    { func: 'loadWorldNews', container: 'worldNews' },
    { func: 'loadCorporateNews', container: 'corporateNews' },
    { func: 'loadAdvertisements', container: 'advertisements' },
    { func: 'loadTopMagazines', container: 'magazines-home' }
  ],

  timeout: 8000,
  enableCache: true
};

// Expose to window
window.LOAD_CONFIG = SMOOTH_CONFIG;

// ============================================
// Smooth Transitions Manager
// ============================================
const SmoothTransitions = {
  /**
   * Add fade-in class to container
   */
  prepareContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Add transition class
    container.classList.add('smooth-transition');
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
  },

  /**
   * Fade in container smoothly
   */
  fadeIn(containerId, delay = 0) {
    const container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return new Promise((resolve) => {
      setTimeout(() => {
        container.style.transition = `opacity ${SMOOTH_CONFIG.fadeInDuration}ms ease, transform ${SMOOTH_CONFIG.fadeInDuration}ms ease`;
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';

        setTimeout(resolve, SMOOTH_CONFIG.fadeInDuration);
      }, delay);
    });
  },

  /**
   * Fade in children with stagger effect
   */
  fadeInChildren(containerId, childSelector = '.news-item, .team-card, .right-box') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const children = container.querySelectorAll(childSelector);

    children.forEach((child, index) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(10px)';

      setTimeout(() => {
        child.style.transition = `opacity ${SMOOTH_CONFIG.fadeInDuration}ms ease, transform ${SMOOTH_CONFIG.fadeInDuration}ms ease`;
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      }, index * SMOOTH_CONFIG.staggerDelay);
    });
  },

  /**
   * Smooth skeleton replacement
   */
  async replaceSkeleton(containerId, contentHTML) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Fade out skeleton
    container.style.transition = `opacity ${SMOOTH_CONFIG.fadeInDuration}ms ease`;
    container.style.opacity = '0';

    await new Promise(resolve => setTimeout(resolve, SMOOTH_CONFIG.fadeInDuration));

    // Replace content
    container.innerHTML = contentHTML;

    // Fade in new content
    container.style.opacity = '1';

    // Stagger children after a brief moment
    setTimeout(() => {
      this.fadeInChildren(containerId);
    }, 50);
  }
};

// ============================================
// Enhanced Loading States
// ============================================
const SmoothLoadingStates = {
  show(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Prepare for smooth transition
    SmoothTransitions.prepareContainer(containerId);

    // Add skeleton
    container.classList.add('loading-skeleton');
    container.innerHTML = this.getSkeletonHTML(containerId);

    // Fade in skeleton smoothly
    requestAnimationFrame(() => {
      SmoothTransitions.fadeIn(containerId);
    });
  },

  async hide(containerId, keepContent = true) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.remove('loading-skeleton');

    if (keepContent) {
      // Smoothly transition from skeleton to content
      await SmoothTransitions.fadeIn(containerId, 0);

      // Stagger children animation
      setTimeout(() => {
        SmoothTransitions.fadeInChildren(containerId);
      }, 100);
    }
  },

  getSkeletonHTML(containerId) {
    const skeletons = {
      'latestNews': this.createSkeletonItems(5, 'list'),
      'carousel': this.createSkeletonItems(4, 'card'),
      'copperNews': this.createSkeletonItems(5, 'list'),
      'preciousMetalNews': this.createSkeletonItems(4, 'list'),
      'worldNews': this.createSkeletonItems(4, 'list'),
      'corporateNews': this.createSkeletonItems(4, 'list'),
      'advertisements': this.createSkeletonItems(3, 'ad'), // 3 ad placeholders
      'magazines-home': this.createSkeletonItems(3, 'card'),
      'default': this.createSkeletonItems(3, 'list')
    };

    return skeletons[containerId] || skeletons['default'];
  },

  createSkeletonItems(count, type) {
    const templates = {
      list: `
        <div class="skeleton-item" style="margin-bottom: 15px;">
          <div class="skeleton-line" style="width: 85%;"></div>
          <div class="skeleton-line short" style="width: 60%;"></div>
        </div>`,

      card: `
        <div class="skeleton-card" style="margin-bottom: 20px; display: inline-block; width: 200px; margin-right: 15px; vertical-align: top;">
          <div class="skeleton-image" style="height: 150px; margin-bottom: 10px;"></div>
          <div class="skeleton-line" style="width: 90%;"></div>
          <div class="skeleton-line short" style="width: 70%;"></div>
        </div>`,

      ad: `
        <div class="skeleton-ad" style="margin-bottom: 20px; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
          <div class="skeleton-image" style="height: 250px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; display: flex; align-items: center; justify-content: center; position: relative;">
            <i class="fa-solid fa-rectangle-ad" style="font-size: 48px; color: #d0d0d0; opacity: 0.4;"></i>
            <div style="position: absolute; bottom: 15px; left: 0; right: 0; text-align: center; color: #d0d0d0; font-size: 12px; opacity: 0.5;">Advertisement Loading...</div>
          </div>
        </div>`
    };

    const template = templates[type] || templates.list;
    return template.repeat(count);
  }
};

// ============================================
// Smooth Content Wrapper
// ============================================
async function smoothExecute(funcName, containerId) {
  const startTime = Date.now();

  try {
    // Show skeleton with smooth fade-in
    if (containerId) {
      SmoothLoadingStates.show(containerId);
    }

    // Check if function exists
    if (typeof window[funcName] !== 'function') {
      console.warn(`Function ${funcName} not found, skipping...`);
      return { status: 'skipped', funcName };
    }

    // Execute the load function
    const loadPromise = window[funcName]();

    // Ensure skeleton shows for minimum time (prevents flash)
    const minTimePromise = new Promise(resolve =>
      setTimeout(resolve, SMOOTH_CONFIG.skeletonMinTime)
    );

    // Wait for both load and minimum time
    await Promise.all([loadPromise, minTimePromise]);

    // Smoothly hide skeleton and show content
    if (containerId) {
      await SmoothLoadingStates.hide(containerId);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ ${funcName} loaded in ${duration}ms`);

    return { status: 'success', funcName, duration };

  } catch (error) {
    console.error(`❌ Error in ${funcName}:`, error.message);

    if (containerId) {
      SmoothLoadingStates.hide(containerId, false);
    }

    return { status: 'error', funcName, error: error.message };
  }
}

// ============================================
// Parallel Loading with Smooth Transitions
// ============================================
async function loadContentSmoothly(items) {
  const promises = items.map(item =>
    smoothExecute(item.func, item.container)
  );

  const results = await Promise.allSettled(promises);

  // Log summary
  const summary = results.reduce((acc, result) => {
    if (result.status === 'fulfilled') {
      acc[result.value.status] = (acc[result.value.status] || 0) + 1;
    } else {
      acc.failed = (acc.failed || 0) + 1;
    }
    return acc;
  }, {});

  console.log('📊 Load Summary:', summary);
  return results;
}

// ============================================
// Main Initialization
// ============================================
async function initializeSmoothLoading() {
  const startTime = performance.now();

  console.log('🎨 Starting smooth page load...');

  // Phase 1: Load critical content (with smooth transitions)
  console.log('⚡ Loading critical content...');
  await loadContentSmoothly(SMOOTH_CONFIG.critical);

  // Phase 2: Load non-critical content (with smooth transitions)
  console.log('📦 Loading non-critical content...');
  await loadContentSmoothly(SMOOTH_CONFIG.nonCritical);

  // Phase 3: Load announcements and what's on without skeleton loaders
  console.log('📝 Loading announcements and what\'s on...');
  if (typeof window.loadAnnouncements === 'function') {
    window.loadAnnouncements().catch(err => console.error('Error loading announcements:', err));
  }
  if (typeof window.loadWhatsOn === 'function') {
    window.loadWhatsOn().catch(err => console.error('Error loading what\'s on:', err));
  }

  const endTime = performance.now();
  console.log(`✨ Page loaded smoothly in ${Math.round(endTime - startTime)}ms`);

  // Mark page as fully loaded
  document.body.classList.add('content-loaded', 'smooth-loaded');
}

// ============================================
// Inject Smooth Transition CSS
// ============================================
if (!document.getElementById('smooth-loader-styles')) {
  const style = document.createElement('style');
  style.id = 'smooth-loader-styles';
  style.textContent = `
    /* Smooth transition base */
    .smooth-transition {
      transition: opacity 400ms ease, transform 400ms ease;
    }

    /* Skeleton animations */
    .loading-skeleton {
      pointer-events: none;
    }

    .skeleton-item,
    .skeleton-card,
    .skeleton-box,
    .skeleton-ad {
      margin-bottom: 15px;
    }

    .skeleton-line,
    .skeleton-image {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .skeleton-line {
      height: 16px;
    }

    .skeleton-line.short {
      width: 60%;
    }

    .skeleton-image {
      width: 100%;
      border-radius: 8px;
    }

    @keyframes skeleton-shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    /* Smooth content appearance */
    .news-item,
    .team-card,
    .right-box,
    .gold-card,
    .section-box {
      transition: opacity 400ms ease, transform 400ms ease;
    }

    /* Prevent layout shift during load */
    [id*="News"],
    [id*="carousel"],
    [id*="advertisements"] {
      min-height: 100px;
    }

    /* Fade in effect for loaded content */
    .content-loaded .news-item,
    .content-loaded .team-card,
    .content-loaded .right-box {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }

    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      .smooth-transition,
      .news-item,
      .team-card,
      .right-box {
        transition: none !important;
        animation: none !important;
      }

      .skeleton-line,
      .skeleton-image {
        animation: none !important;
        background: #f0f0f0 !important;
      }
    }

    /* Performance optimization */
    .loading-skeleton * {
      will-change: opacity, transform;
    }

    .smooth-loaded .news-item,
    .smooth-loaded .team-card {
      will-change: auto;
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// Initialize on DOM Ready
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSmoothLoading);
} else {
  initializeSmoothLoading();
}

console.log('✨ Smooth loader initialized');
