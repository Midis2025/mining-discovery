/**
 * Optimized Loader for newss.html
 *
 * Improvements:
 * 1. Smooth skeleton loading states
 * 2. Frontend caching for news listings
 * 3. Smooth fade-in transitions
 * 4. Staggered content appearance
 * 5. Zero layout jumps
 * 6. Professional loading experience
 */

// ============================================
// Configuration
// ============================================
const NEWSS_CONFIG = {
  fadeInDuration: 400,
  staggerDelay: 80,
  skeletonMinTime: 300,
  enableCache: true
};

// Expose to window
if (!window.LOAD_CONFIG) {
  window.LOAD_CONFIG = NEWSS_CONFIG;
}

// ============================================
// Smooth Skeleton States
// ============================================
const NewsSkeleton = {
  show(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    container.innerHTML = this.getSkeletonHTML(containerId);

    requestAnimationFrame(() => {
      container.style.transition = `opacity ${NEWSS_CONFIG.fadeInDuration}ms ease, transform ${NEWSS_CONFIG.fadeInDuration}ms ease`;
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    });
  },

  hide(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Fade in the actual content
    requestAnimationFrame(() => {
      const items = container.querySelectorAll('.cards, .news-item, .section-box, .right-box');
      items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';

        setTimeout(() => {
          item.style.transition = `opacity ${NEWSS_CONFIG.fadeInDuration}ms ease, transform ${NEWSS_CONFIG.fadeInDuration}ms ease`;
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, index * NEWSS_CONFIG.staggerDelay);
      });
    });
  },

  getSkeletonHTML(containerId) {
    if (containerId === 'newsContainer' || containerId === 'nextNewsContainer') {
      return this.createNewsCardsSkeleton(5);
    } else if (containerId === 'advertisements' || containerId === 'projects' || containerId === 'reports') {
      return this.createSidebarSkeleton(3);
    } else {
      return this.createGenericSkeleton(3);
    }
  },

  createNewsCardsSkeleton(count) {
    const skeleton = `
      <div class="skeleton-news-card" style="margin-bottom: 20px; padding: 15px; border: 1px solid #f0f0f0; border-radius: 8px; display: flex; gap: 15px; align-items: flex-start;">
        <!-- Skeleton Image Placeholder -->
        <div class="skeleton-image-wrapper" style="width: 150px; height: 150px; min-width: 150px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <!-- Camera icon to indicate image loading -->
          <i class="fa-regular fa-image" style="font-size: 32px; color: #d0d0d0; opacity: 0.5;"></i>
        </div>

        <!-- Skeleton Text Content -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
          <div class="skeleton-line" style="height: 20px; width: 85%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 20px; width: 95%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 16px; width: 70%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 14px; width: 50%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
        </div>
      </div>
    `;
    return skeleton.repeat(count);
  },

  createSidebarSkeleton(count) {
    const skeleton = `
      <div class="skeleton-sidebar-item" style="margin-bottom: 20px; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
        <!-- Skeleton Image Placeholder -->
        <div class="skeleton-sidebar-image" style="height: 180px; width: 100%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; display: flex; align-items: center; justify-content: center;">
          <i class="fa-regular fa-image" style="font-size: 40px; color: #d0d0d0; opacity: 0.5;"></i>
        </div>
        <!-- Skeleton Text -->
        <div style="padding: 12px;">
          <div class="skeleton-line" style="height: 16px; width: 90%; margin-bottom: 8px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
          <div class="skeleton-line" style="height: 14px; width: 70%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
        </div>
      </div>
    `;
    return skeleton.repeat(count);
  },

  createGenericSkeleton(count) {
    const skeleton = `
      <div class="skeleton-item" style="margin-bottom: 15px;">
        <div class="skeleton-line" style="height: 16px; width: 85%; margin-bottom: 8px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
        <div class="skeleton-line" style="height: 16px; width: 60%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-shimmer 1.5s ease-in-out infinite; border-radius: 4px;"></div>
      </div>
    `;
    return skeleton.repeat(count);
  }
};

// ============================================
// Smooth Load Wrapper
// ============================================
async function smoothLoadNewss(funcName, containerId) {
  const startTime = Date.now();

  try {
    // Show skeleton
    if (containerId) {
      NewsSkeleton.show(containerId);
    }

    // Check if function exists
    if (typeof window[funcName] !== 'function') {
      console.warn(`Function ${funcName} not found`);
      return;
    }

    // Execute load function
    const loadPromise = window[funcName]();

    // Ensure minimum skeleton time
    const minTimePromise = new Promise(resolve =>
      setTimeout(resolve, NEWSS_CONFIG.skeletonMinTime)
    );

    await Promise.all([loadPromise, minTimePromise]);

    // Hide skeleton and show content with smooth transition
    if (containerId) {
      NewsSkeleton.hide(containerId);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ ${funcName} loaded in ${duration}ms`);

  } catch (error) {
    console.error(`❌ Error in ${funcName}:`, error);
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `<p style="color:#dc3545; padding: 20px; text-align: center;">Failed to load content. <button onclick="location.reload()" style="margin-left: 10px; padding: 6px 12px; background: #ae8a4c; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button></p>`;
      }
    }
  }
}

// ============================================
// Initialize Smooth Loading
// ============================================
async function initNewssSmoothLoading() {
  console.log('🎨 Starting smooth news page load...');

  const startTime = performance.now();

  // Load sidebar content
  await Promise.all([
    smoothLoadNewss('loadAdvertisements', 'advertisements'),
    smoothLoadNewss('loadProjects', 'projects'),
    smoothLoadNewss('loadReports', 'reports')
  ]);

  // Load news category
  await smoothLoadNewss('newsCategory', null);

  // Initialize news widget if it exists
  if (window.NewsWidget && window.NewsWidget.init) {
    console.log('📰 Initializing News Widget...');
    window.NewsWidget.init({
      pageSize: 5,
      categorySlug: "latest-news",
      useCache: true,
      selectors: {
        containerId: "newsContainer",
        nextNewsId: "nextNewsContainer",
        mostReadSelector: ".cards",
        categoryTitleId: "categoryTitle",
        nextCategoryTitleId: "nextCategoryTitle",
        showMoreSelector: ".btn-more",
        dropdownToggleId: "dropdownToggle",
        dropdownMenuId: "dropdownMenu"
      }
    });
  }

  // Load latest news ticker
  await smoothLoadNewss('loadLatestNews', null);

  const endTime = performance.now();
  console.log(`✨ News page loaded smoothly in ${Math.round(endTime - startTime)}ms`);

  document.body.classList.add('content-loaded', 'smooth-loaded');
}

// ============================================
// Inject Smooth Styles
// ============================================
if (!document.getElementById('newss-smooth-styles')) {
  const style = document.createElement('style');
  style.id = 'newss-smooth-styles';
  style.textContent = `
    /* Shimmer animation for skeleton loading */
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Smooth transitions */
    .cards,
    .news-item,
    .section-box,
    .right-box {
      transition: opacity 400ms ease, transform 400ms ease;
    }

    /* Prevent layout shift */
    #newsContainer,
    #nextNewsContainer,
    #advertisements,
    #projects,
    #reports {
      min-height: 200px;
    }

    /* Loading state */
    .loading-skeleton {
      pointer-events: none;
    }

    /* Loaded state */
    .content-loaded .cards,
    .content-loaded .news-item,
    .content-loaded .section-box {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }

    /* Skeleton image placeholder styles */
    .skeleton-image-wrapper,
    .skeleton-sidebar-image {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
    }

    /* Mobile responsive skeleton */
    @media (max-width: 768px) {
      .skeleton-news-card {
        flex-direction: column !important;
      }

      .skeleton-image-wrapper {
        width: 100% !important;
        height: 200px !important;
        min-width: 100% !important;
      }

      .skeleton-sidebar-image {
        height: 150px !important;
      }
    }

    @media (max-width: 480px) {
      .skeleton-image-wrapper {
        height: 180px !important;
      }

      .skeleton-sidebar-image {
        height: 120px !important;
      }

      .skeleton-line {
        width: 100% !important;
      }
    }

    /* Accessibility - Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
        animation: none !important;
      }

      .skeleton-image-wrapper,
      .skeleton-sidebar-image,
      .skeleton-line {
        background: #f0f0f0 !important;
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// Initialize on DOM Ready
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewssSmoothLoading);
} else {
  initNewssSmoothLoading();
}

console.log('✨ News page smooth loader initialized');
