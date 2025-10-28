// ========================================
// MOBILE NAVIGATION - SIDEBAR AND TAB BAR
// ========================================

/**
 * Opens the mobile sidebar for news categories
 */
function openSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (sidebar && overlay) {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

/**
 * Closes the mobile sidebar
 */
function closeSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (sidebar && overlay) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

/**
 * Initialize mobile navigation on page load
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeTabBar();
  initializeSidebar();
  setupSwipeGestures();
  setupKeyboardShortcuts();
});

/**
 * Set active tab based on current page
 */
function initializeTabBar() {
  const currentPath = window.location.pathname.toLowerCase();
  const tabItems = document.querySelectorAll('.tab-item');

  tabItems.forEach(tab => {
    const href = tab.getAttribute('href');

    // Remove active class from all tabs
    tab.classList.remove('active');

    // Skip tabs that trigger actions (like # links)
    if (!href || href === '#') {
      return;
    }

    // Normalize href to get the actual page name
    const normalizedHref = href.toLowerCase().replace(/^\.\.?\//g, '/').replace(/^\//g, '');
    const normalizedPath = currentPath.replace(/^\//g, '');

    // Check for home page
    if ((normalizedHref.includes('index.html') || href === '/') &&
        (normalizedPath === '' || normalizedPath === 'index.html' || currentPath === '/' || currentPath.includes('index.html'))) {
      tab.classList.add('active');
      return;
    }

    // Check for magazine page
    if ((normalizedHref.includes('magazine') || normalizedHref.includes('magzin')) &&
        (normalizedPath.includes('magazine') || normalizedPath.includes('magzin'))) {
      tab.classList.add('active');
      return;
    }

    // Check for service page
    if (normalizedHref.includes('service') && normalizedPath.includes('service')) {
      tab.classList.add('active');
      return;
    }

    // Generic match for other pages
    if (normalizedPath.includes(normalizedHref) && normalizedHref.length > 1) {
      tab.classList.add('active');
    }
  });
}

/**
 * Set active sidebar item based on current category page
 */
function initializeSidebar() {
  const currentPath = window.location.pathname.toLowerCase();
  const sidebarItems = document.querySelectorAll('.sidebar-item');

  sidebarItems.forEach(item => {
    const href = item.getAttribute('href');

    // Remove active class
    item.classList.remove('active');

    if (!href) return;

    // Normalize paths for comparison
    const normalizedHref = href.toLowerCase().replace(/^\.\.?\//g, '/');
    const normalizedPath = currentPath;

    // Add active class if current page matches
    if (normalizedPath.includes(normalizedHref)) {
      item.classList.add('active');
    }
  });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Close sidebar on escape key
    if (e.key === 'Escape') {
      closeSidebar();
    }
  });
}

/**
 * Setup swipe gestures for mobile
 */
function setupSwipeGestures() {
  let touchStartX = 0;
  let touchEndX = 0;
  const sidebar = document.getElementById('mobileSidebar');

  if (!sidebar) return;

  sidebar.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  sidebar.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  function handleSwipe() {
    const swipeDistance = touchStartX - touchEndX;

    // Swipe left to close (must be at least 50px)
    if (swipeDistance > 50) {
      closeSidebar();
    }
  }
}

/**
 * Generate mobile tab bar HTML
 * Can be called to dynamically create the tab bar
 */
function generateMobileTabBar() {
  return `
    <nav class="mobile-tab-bar">
      <a href="/index.html" class="tab-item">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </a>
      <a href="#" class="tab-item" onclick="openSidebar(); return false;">
        <i class="fas fa-newspaper"></i>
        <span>News</span>
      </a>
      <a href="/magazine" class="tab-item">
        <i class="fas fa-book"></i>
        <span>Magazine</span>
      </a>
      <a href="/service.html" class="tab-item">
        <i class="fas fa-briefcase"></i>
        <span>Services</span>
      </a>
      <a href="#" class="tab-item" onclick="toggleMenu(); return false;">
        <i class="fas fa-bars"></i>
        <span>More</span>
      </a>
    </nav>
  `;
}

/**
 * Generate mobile sidebar HTML
 * Can be called to dynamically create the sidebar
 */
function generateMobileSidebar() {
  return `
    <div class="mobile-sidebar" id="mobileSidebar">
      <div class="sidebar-header">
        <h3>News Categories</h3>
        <button class="sidebar-close" onclick="closeSidebar()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="sidebar-content" id="sidebarNewsCategories">
        <a href="/page/latest-news" class="sidebar-item">
          <i class="fas fa-newspaper"></i>
          <span>Latest News</span>
        </a>
        <a href="/page/gold-news" class="sidebar-item">
          <i class="fas fa-coins"></i>
          <span>Gold News</span>
        </a>
        <a href="/page/silver-news" class="sidebar-item">
          <i class="fas fa-circle"></i>
          <span>Silver News</span>
        </a>
        <a href="/page/copper-news" class="sidebar-item">
          <i class="fas fa-industry"></i>
          <span>Copper News</span>
        </a>
        <a href="/page/precious-metals" class="sidebar-item">
          <i class="fas fa-gem"></i>
          <span>Precious Metals</span>
        </a>
        <a href="/page/corporate-news" class="sidebar-item">
          <i class="fas fa-building"></i>
          <span>Corporate News</span>
        </a>
        <a href="/page/world-news" class="sidebar-item">
          <i class="fas fa-globe"></i>
          <span>World News</span>
        </a>
        <a href="/page/leadership-thoughts" class="sidebar-item">
          <i class="fas fa-user-tie"></i>
          <span>Leadership Thoughts</span>
        </a>
        <a href="/page/research-reports" class="sidebar-item">
          <i class="fas fa-file-alt"></i>
          <span>Research Reports</span>
        </a>
        <a href="/page/announcement" class="sidebar-item">
          <i class="fas fa-bullhorn"></i>
          <span>Announcements</span>
        </a>
        <a href="/page/evening-chatter" class="sidebar-item">
          <i class="fas fa-comments"></i>
          <span>Evening Chatter</span>
        </a>
        <a href="/page/popular-this-week" class="sidebar-item">
          <i class="fas fa-fire"></i>
          <span>Popular This Week</span>
        </a>
        <a href="/page/projects" class="sidebar-item">
          <i class="fas fa-project-diagram"></i>
          <span>Projects</span>
        </a>
        <a href="/page/sponsored-post" class="sidebar-item">
          <i class="fas fa-ad"></i>
          <span>Sponsored Post</span>
        </a>
        <a href="/page/whats-on" class="sidebar-item">
          <i class="fas fa-calendar-alt"></i>
          <span>What's On</span>
        </a>
      </div>
    </div>
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
  `;
}

// Export functions for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    openSidebar,
    closeSidebar,
    generateMobileTabBar,
    generateMobileSidebar
  };
}
