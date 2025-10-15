/**
 * Universal Page Loader
 * Works for newsletter, magazine, CEO profile, and other content pages
 *
 * Features:
 * 1. Smooth skeleton loading
 * 2. Frontend caching
 * 3. Smooth transitions
 * 4. Automatic detection of page content
 * 5. Professional loading experience
 */

// ============================================
// Configuration
// ============================================
const UNIVERSAL_CONFIG = {
  fadeInDuration: 400,
  staggerDelay: 80,
  skeletonMinTime: 300,
  enableCache: true
};

// Expose to window
if (!window.LOAD_CONFIG) {
  window.LOAD_CONFIG = UNIVERSAL_CONFIG;
}

// ============================================
// Skeleton Loader
// ============================================
const UniversalSkeleton = {
  show(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    container.innerHTML = this.getSkeletonHTML(containerId);

    requestAnimationFrame(() => {
      container.style.transition = `opacity ${UNIVERSAL_CONFIG.fadeInDuration}ms ease, transform ${UNIVERSAL_CONFIG.fadeInDuration}ms ease`;
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    });
  },

  hide(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    requestAnimationFrame(() => {
      const items = container.querySelectorAll('.newsletter-card, .magazine-card, .ceo-card, .cards, .section-box, .right-box, .news-item');
      items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';

        setTimeout(() => {
          item.style.transition = `opacity ${UNIVERSAL_CONFIG.fadeInDuration}ms ease, transform ${UNIVERSAL_CONFIG.fadeInDuration}ms ease`;
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, index * UNIVERSAL_CONFIG.staggerDelay);
      });
    });
  },

  getSkeletonHTML(containerId) {
    // Smart detection based on container ID
    if (containerId.includes('newsletter') || containerId.includes('Newsletter')) {
      return this.createNewsletterSkeleton(4);
    } else if (containerId.includes('magazine') || containerId.includes('Magazine')) {
      return this.createMagazineSkeleton(6);
    } else if (containerId.includes('ceo') || containerId.includes('CEO') || containerId.includes('Ceo')) {
      return this.createCEOSkeleton(4);
    } else if (containerId.includes('latest') || containerId.includes('Latest')) {
      return this.createNewsSkeleton(5);
    } else {
      return this.createGenericSkeleton(4);
    }
  },

  createNewsletterSkeleton(count) {
    const skeleton = `
      <div class="skeleton-newsletter-card" style="margin-bottom: 25px; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; display: flex; gap: 20px; align-items: flex-start;">
        <!-- Image Placeholder -->
        <div class="skeleton-image-wrapper" style="width: 200px; height: 200px; min-width: 200px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
          <i class="fa-regular fa-newspaper" style="font-size: 40px; color: #d0d0d0; opacity: 0.5;"></i>
        </div>

        <!-- Text Content -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          <div class="skeleton-line" style="height: 24px; width: 90%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 18px; width: 80%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 16px; width: 95%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 16px; width: 85%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 14px; width: 40%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
        </div>
      </div>
    `;
    return skeleton.repeat(count);
  },

  createMagazineSkeleton(count) {
    const skeleton = `
      <div class="skeleton-magazine-card" style="margin-bottom: 25px; padding: 15px; border: 1px solid #f0f0f0; border-radius: 10px; text-align: center;">
        <!-- Cover Image -->
        <div class="skeleton-magazine-cover" style="width: 100%; height: 300px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center;">
          <i class="fa-solid fa-book-open" style="font-size: 50px; color: #d0d0d0; opacity: 0.5;"></i>
        </div>

        <!-- Title -->
        <div class="skeleton-line" style="height: 20px; width: 80%; margin: 0 auto 10px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
        <div class="skeleton-line" style="height: 16px; width: 60%; margin: 0 auto; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
      </div>
    `;
    return skeleton.repeat(count);
  },

  createCEOSkeleton(count) {
    const skeleton = `
      <div class="skeleton-ceo-card" style="margin-bottom: 30px; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; display: flex; gap: 20px; align-items: flex-start;">
        <!-- Profile Image -->
        <div class="skeleton-ceo-image" style="width: 150px; height: 150px; min-width: 150px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <i class="fa-solid fa-user-tie" style="font-size: 50px; color: #d0d0d0; opacity: 0.5;"></i>
        </div>

        <!-- CEO Info -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          <div class="skeleton-line" style="height: 26px; width: 70%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 20px; width: 50%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 16px; width: 95%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 16px; width: 90%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 16px; width: 85%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
        </div>
      </div>
    `;
    return skeleton.repeat(count);
  },

  createNewsSkeleton(count) {
    const skeleton = `
      <div class="skeleton-news-item" style="margin-bottom: 15px; padding: 12px; border-bottom: 1px solid #f0f0f0;">
        <div class="skeleton-line" style="height: 18px; width: 85%; margin-bottom: 8px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
        <div class="skeleton-line" style="height: 14px; width: 60%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
      </div>
    `;
    return skeleton.repeat(count);
  },

  createGenericSkeleton(count) {
    const skeleton = `
      <div class="skeleton-generic-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #f0f0f0; border-radius: 8px;">
        <div class="skeleton-line" style="height: 20px; width: 80%; margin-bottom: 10px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
        <div class="skeleton-line" style="height: 16px; width: 90%; margin-bottom: 8px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
        <div class="skeleton-line" style="height: 16px; width: 70%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
      </div>
    `;
    return skeleton.repeat(count);
  }
};

// ============================================
// Smooth Load Function
// ============================================
async function universalSmoothLoad(funcName, containerId) {
  const startTime = Date.now();

  try {
    // Show skeleton
    if (containerId) {
      UniversalSkeleton.show(containerId);
    }

    // Check if function exists
    if (typeof window[funcName] !== 'function') {
      console.warn(`Function ${funcName} not found, skipping...`);
      return;
    }

    // Execute load function
    const loadPromise = window[funcName]();

    // Ensure minimum skeleton time
    const minTimePromise = new Promise(resolve =>
      setTimeout(resolve, UNIVERSAL_CONFIG.skeletonMinTime)
    );

    await Promise.all([loadPromise, minTimePromise]);

    // Hide skeleton and show content
    if (containerId) {
      UniversalSkeleton.hide(containerId);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ ${funcName} loaded in ${duration}ms`);

  } catch (error) {
    console.error(`❌ Error in ${funcName}:`, error);

    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div style="padding: 40px; text-align: center; color: #dc3545;">
            <p style="margin-bottom: 15px;">Failed to load content</p>
            <button onclick="location.reload()" style="padding: 10px 20px; background: #ae8a4c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
              Retry
            </button>
          </div>
        `;
      }
    }
  }
}

// ============================================
// Universal Page Loader Class
// ============================================
class UniversalPageLoader {
  constructor(config = {}) {
    this.critical = config.critical || [];
    this.nonCritical = config.nonCritical || [];
    this.autoDetect = config.autoDetect !== false;
  }

  async init() {
    console.log('🎨 Universal page loader initialized');
    const startTime = performance.now();

    // If no manual config and auto-detect enabled, auto-detect functions
    if (this.critical.length === 0 && this.nonCritical.length === 0 && this.autoDetect) {
      this.autoDetectFunctions();
    }

    // Load critical content first
    if (this.critical.length > 0) {
      console.log(`📦 Loading ${this.critical.length} critical sections...`);
      await Promise.all(
        this.critical.map(item => universalSmoothLoad(item.func, item.container))
      );
    }

    // Load non-critical content
    if (this.nonCritical.length > 0) {
      console.log(`📦 Loading ${this.nonCritical.length} non-critical sections...`);
      await Promise.allSettled(
        this.nonCritical.map(item => universalSmoothLoad(item.func, item.container))
      );
    }

    const endTime = performance.now();
    console.log(`✨ Page loaded in ${Math.round(endTime - startTime)}ms`);

    document.body.classList.add('content-loaded', 'smooth-loaded');
  }

  autoDetectFunctions() {
    // Newsletter page
    if (typeof window.loadNewsletter === 'function') {
      this.critical.push({ func: 'loadNewsletter', container: 'newsletterContainer' });
    }

    // Magazine page
    if (typeof window.loadMagazine === 'function') {
      this.critical.push({ func: 'loadMagazine', container: 'magazineContainer' });
    } else if (typeof window.loadMagazines === 'function') {
      this.critical.push({ func: 'loadMagazines', container: 'magazineContainer' });
    }

    // CEO profile page
    if (typeof window.loadCEOProfiles === 'function') {
      this.critical.push({ func: 'loadCEOProfiles', container: 'ceoContainer' });
    }

    // Latest news (common to all)
    if (typeof window.loadLatestNews === 'function') {
      this.critical.push({ func: 'loadLatestNews', container: 'latestNews' });
    }

    // Common non-critical content
    if (typeof window.loadAdvertisements === 'function') {
      this.nonCritical.push({ func: 'loadAdvertisements', container: 'advertisements' });
    }
    if (typeof window.loadProjects === 'function') {
      this.nonCritical.push({ func: 'loadProjects', container: 'projectContainer' });
    }
    if (typeof window.loadReports === 'function') {
      this.nonCritical.push({ func: 'loadReports', container: 'reportContainer' });
    }
    if (typeof window.newsCategory === 'function') {
      this.nonCritical.push({ func: 'newsCategory', container: 'newsCategories' });
    }
  }
}

// Legacy function for auto-detect mode
async function initUniversalLoader() {
  const loader = new UniversalPageLoader({ autoDetect: true });
  await loader.init();
}

// ============================================
// Inject Smooth Styles
// ============================================
if (!document.getElementById('universal-smooth-styles')) {
  const style = document.createElement('style');
  style.id = 'universal-smooth-styles';
  style.textContent = `
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Smooth transitions */
    .newsletter-card,
    .magazine-card,
    .ceo-card,
    .cards,
    .section-box,
    .right-box,
    .news-item {
      transition: opacity 400ms ease, transform 400ms ease;
    }

    /* Prevent layout shift */
    #newsletterContainer,
    #magazineContainer,
    #ceoContainer,
    #latestNews {
      min-height: 200px;
    }

    /* Mobile responsive skeletons */
    @media (max-width: 768px) {
      .skeleton-newsletter-card,
      .skeleton-ceo-card {
        flex-direction: column !important;
      }

      .skeleton-image-wrapper,
      .skeleton-ceo-image {
        width: 100% !important;
        min-width: 100% !important;
        height: 200px !important;
      }

      .skeleton-magazine-cover {
        height: 250px !important;
      }
    }

    @media (max-width: 480px) {
      .skeleton-image-wrapper,
      .skeleton-ceo-image {
        height: 180px !important;
      }

      .skeleton-magazine-cover {
        height: 200px !important;
      }
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
        animation: none !important;
      }

      .skeleton-line,
      .skeleton-image-wrapper,
      .skeleton-magazine-cover,
      .skeleton-ceo-image {
        background: #f0f0f0 !important;
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// Initialize on DOM Ready (only if not manually initialized)
// ============================================
// Don't auto-initialize if UniversalPageLoader is used manually in HTML
let autoInitialized = false;

window.addEventListener('load', () => {
  // Only auto-init if not already manually initialized
  if (!autoInitialized && !document.body.classList.contains('content-loaded')) {
    console.log('🔄 Auto-initializing universal loader...');
    autoInitialized = true;
    initUniversalLoader();
  }
});

console.log('✨ Universal smooth loader ready');
