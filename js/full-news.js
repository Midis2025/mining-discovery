
document.addEventListener("DOMContentLoaded", () => {

  // --- Configuration ---
  const CONFIG = {
    API_BASE_URL: 'https://admins.miningdiscovery.com/api',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    REQUEST_TIMEOUT: 8000, // 8 seconds
    EXTERNAL_SCRIPTS: ['./js/advertisment.js', './js/projects.js', './js/reports.js']
  };

  // --- Cache for storing fetched data ---
  let projectsCache = null;
  let reportsCache = null;
  let cacheTimestamp = null;

  // --- Utility Functions ---
  function showSpinner(container, message = "Loading...") {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="
          display: inline-block; 
          width: 40px; 
          height: 40px; 
          border: 4px solid #f3f3f3; 
          border-top: 4px solid ##a37b3c; 
          border-radius: 50%; 
          animation: spin 1s linear infinite;
        "></div>
        <p style="margin-top: 15px; color: #666;">${message}</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  function showError(container, title, message, showRetry = true, contentId = null) {
    const retryButton = showRetry ? `
      <button onclick="location.reload()" style="
        background: #a37b3c; 
        color: white; 
        border: none; 
        padding: 8px 16px; 
        border-radius: 4px; 
        cursor: pointer; 
        margin-right: 10px;
      ">Retry</button>
    ` : '';

    container.innerHTML = `
      <div style="
        color: #b00; 
        padding: 20px; 
        border: 1px solid #ddd; 
        border-radius: 5px; 
        background: #fafafa;
      ">
        <h3 style="margin-top: 0;">${title}</h3>
        <p>${message}</p>
        ${contentId ? `<p style="font-size: 14px; color: #666;"><strong>Content ID:</strong> ${contentId}</p>` : ''}
        <div style="margin-top: 15px;">
          ${retryButton}
          <a href="/" style="color: #0066cc; text-decoration: none;">← Back to home</a>
        </div>
      </div>
    `;
  }

  function isCacheValid() {
    return cacheTimestamp && (Date.now() - cacheTimestamp) < CONFIG.CACHE_DURATION;
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return '';
    }
  }

  function processDescription(description) {
    if (!description) return '<p>No description available.</p>';
    
    return description
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(?!<p>)/, '<p>')
      .replace(/(?!<\/p>)$/, '</p>');
  }

  // --- API Functions ---
  async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(url, { 
        ...options, 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async function fetchFromMultipleEndpoints(contentId) {
    const endpoints = [
      { name: 'projects', url: `${CONFIG.API_BASE_URL}/projects`, cache: 'projectsCache' },
      { name: 'reports', url: `${CONFIG.API_BASE_URL}/reports`, cache: 'reportsCache' }
    ];

    console.log(`Searching for content with ID: ${contentId} (type: ${typeof contentId})`);

    // Try filtered requests first
    for (const endpoint of endpoints) {
      try {
        const filteredUrl = `${endpoint.url}?filters[id][$eq]=${contentId}`;
        console.log(`Attempting filtered request on ${endpoint.name}: ${filteredUrl}`);
        
        const response = await fetchWithTimeout(filteredUrl);
        
        if (response.ok) {
          const data = await response.json();
          const items = data.data || data;
          
          console.log(`${endpoint.name} filtered response:`, items);
          
          if (Array.isArray(items) && items.length > 0) {
            console.log(`Found item via filtered request in ${endpoint.name}`);
            return { item: items[0], source: endpoint.name };
          }
        }
      } catch (error) {
        console.log(`Filtered request failed for ${endpoint.name}:`, error.message);
      }
    }

    // Fallback to cached data if available
    if (isCacheValid()) {
      console.log('Checking cached data for fallback');
      
      if (projectsCache && Array.isArray(projectsCache)) {
        const item = projectsCache.find(p => p.id == contentId || p.id === parseInt(contentId));
        if (item) {
          console.log('Found item in projects cache');
          return { item, source: 'projects-cache' };
        }
      }
      
      if (reportsCache && Array.isArray(reportsCache)) {
        const item = reportsCache.find(p => p.id == contentId || p.id === parseInt(contentId));
        if (item) {
          console.log('Found item in reports cache');
          return { item, source: 'reports-cache' };
        }
      }
    }

    // Fallback to full endpoint requests
    for (const endpoint of endpoints) {
      try {
        console.log(`Attempting full endpoint request on ${endpoint.name}`);
        const response = await fetchWithTimeout(endpoint.url);
        
        if (!response.ok) {
          console.warn(`HTTP ${response.status} for ${endpoint.name}: ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        const items = data.data || data;
        
        console.log(`${endpoint.name} full response items count:`, items ? items.length : 0);
        
        if (!Array.isArray(items)) {
          console.warn(`Invalid API response format for ${endpoint.name}`);
          continue;
        }

        if (endpoint.name === 'projects') {
          projectsCache = items;
        } else if (endpoint.name === 'reports') {
          reportsCache = items;
        }
        
        cacheTimestamp = Date.now();
        console.log(`Data cached successfully from ${endpoint.name}`);

        const item = items.find(p => {
          console.log(`Comparing: ${p.id} (${typeof p.id}) with ${contentId} (${typeof contentId})`);
          return p.id == contentId || p.id === parseInt(contentId);
        });
        
        if (item) {
          console.log(`Found item in ${endpoint.name}:`, item.title || item.project_title);
          return { item, source: endpoint.name };
        }
      } catch (error) {
        console.error(`Error fetching from ${endpoint.name}:`, error.message);
      }
    }

    throw new Error(`Content with ID ${contentId} not found in any endpoint`);
  }

  // --- Show extra news when button clicked ---
  function initializeShowMore() {
    const showMoreBtn = document.getElementById("showMoreBtn");
    if (showMoreBtn) {
      showMoreBtn.addEventListener("click", () => {
        const extraNews = document.querySelectorAll(".extra-news");
        extraNews.forEach(section => {
          section.style.display = "block";
          section.style.opacity = "0";
          section.style.transition = "opacity 0.4s ease";
          requestAnimationFrame(() => section.style.opacity = "1");
        });
        showMoreBtn.style.display = "none";
      });
    }
  }

  // --- Render Article ---
  function renderNewsArticle(result, container) {
    const { item, source } = result;
    
    const title = item.project_title || item.title || 'Untitled';
    const contentType = source === 'projects' || source === 'projects-cache' ? 'Project' : 'Report';
    
    // ✅ Update topbar h1 text only
    const topbar = document.getElementById("topbar");
    if (topbar) {
      let h1 = topbar.querySelector("h1");
      if (!h1) {
        h1 = document.createElement("h1");
        topbar.appendChild(h1);
      }
      h1.textContent = `${contentType}: ${title}`;
    }

    const description = item.longDescription || item.shortDescription || 'No description available.';
    const author = item.author || 'Mining Discovery';
    const createdAt = item.createdAt || '';
    const updatedAt = item.updatedAt || '';

    const formattedCreatedDate = formatDate(createdAt);
    const formattedUpdatedDate = (updatedAt && updatedAt !== createdAt) ? formatDate(updatedAt) : '';
    const processedDescription = processDescription(description);

    const sourceIndicator = source && !source.includes('cache') ? `
      <span style="background: #e8f5e8; color: #2e7d32; padding: 2px 6px; border-radius: 3px; font-size: 12px;">
        Source: ${source}
      </span>
    ` : '';

    requestAnimationFrame(() => {
      container.innerHTML = `
        <article style="max-width: 900px; margin: 0 auto; padding: 20px;">
          <header style="border-bottom: 3px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0 0 15px 0; line-height: 1.3; font-size: 2.2em; font-weight: 600;">
              ${title}
            </h1>
            <div style="color: #7f8c8d; font-size: 14px; display: flex; flex-wrap: wrap; gap: 15px; align-items: center;">
              ${sourceIndicator}
              ${author ? `<span style="background: #ecf0f1; padding: 4px 8px; border-radius: 4px;"><strong>Author:</strong> ${author}</span>` : ''}
              ${formattedCreatedDate ? `<span style="background: #ecf0f1; padding: 4px 8px; border-radius: 4px;"><strong>Published:</strong> ${formattedCreatedDate}</span>` : ''}
              ${formattedUpdatedDate ? `<span style="background: #ecf0f1; padding: 4px 8px; border-radius: 4px;"><strong>Updated:</strong> ${formattedUpdatedDate}</span>` : ''}
            </div>
          </header>
          <div class="content" style="line-height: 1.8; color: #34495e; font-size: 16px;">
            ${processedDescription}
          </div>
          <footer style="margin-top: 50px; padding-top: 25px; border-top: 2px solid #ecf0f1; text-align: center;">
            <a href="/" style="color: #a37b3c; text-decoration: none; font-weight: 500; padding: 10px 20px; border: 2px solid #a37b3c; border-radius: 5px; transition: all 0.3s ease; display: inline-block;"
               onmouseover="this.style.background='#a37b3c'; this.style.color='white';" 
               onmouseout="this.style.background='transparent'; this.style.color='#a37b3c';">
              ← Back to Home
            </a>
          </footer>
        </article>
      `;
    });
  }

  // --- Load News Details Dynamically ---
  async function loadNewsDetails() {
    const container = document.getElementById("newsDetails");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const contentId = params.get("id") || params.get("reportId") || params.get("projectId");

    if (!contentId) {
      showError(container, "Invalid Request", "No content ID provided in the URL.", false);
      return;
    }

    showSpinner(container, "Loading article...");

    try {
      const result = await fetchFromMultipleEndpoints(contentId);
      renderNewsArticle(result, container);
    } catch (error) {
      console.error("Error loading content:", error);

      let errorMessage = error.message.includes("not found") ? "The requested content could not be found." : "Failed to load the content article.";
      let debugInfo = "";

      if (projectsCache || reportsCache) {
        const availableIds = [];
        if (projectsCache) availableIds.push(...projectsCache.slice(0, 5).map(p => `${p.id} (projects)`));
        if (reportsCache) availableIds.push(...reportsCache.slice(0, 5).map(p => `${p.id} (reports)`));
        if (availableIds.length) debugInfo = `<p style="font-size: 12px; color: #666; margin-top: 10px;">Available IDs: ${availableIds.join(', ')}</p>`;
      }

      container.innerHTML = `
        <div style="color: #b00; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background: #fafafa;">
          <h3 style="margin-top: 0;">Error Loading Content</h3>
          <p>${errorMessage}</p>
          <p style="font-size: 14px; color: #666;"><strong>Content ID:</strong> ${contentId}</p>
          ${debugInfo}
          <p style="font-size: 12px; color: #666;">Error details: ${error.message}</p>
          <div style="margin-top: 15px;">
            <button onclick="location.reload()" style="background: #a37b3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Retry</button>
            <a href="/" style="color: #a37b3c; text-decoration: none;">← Back to home</a>
          </div>
        </div>
      `;
    }
  }

  // --- Initialize external modules safely ---
  function initializeModules() {
    const modules = ["loadAdvertisements", "loadProjects", "loadReports"];
    
    modules.forEach(fnName => {
      try {
        if (typeof window[fnName] === "function") {
          window[fnName]();
        }
      } catch (error) {
        console.error(`Error initializing ${fnName}:`, error);
      }
    });
  }

  // --- Load external scripts with error handling ---
  function loadExternalScripts() {
    CONFIG.EXTERNAL_SCRIPTS.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => console.log(`Successfully loaded: ${src}`);
      script.onerror = () => console.warn(`Failed to load: ${src}`);
      document.head.appendChild(script);
    });
  }

  // --- Initialize DNS prefetch ---
  function initializeDNSPrefetch() {
    try {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'dns-prefetch';
      preloadLink.href = CONFIG.API_BASE_URL.replace('/api', '');
      document.head.appendChild(preloadLink);
    } catch (error) {
      console.warn('Failed to add DNS prefetch:', error);
    }
  }

  // --- Global error handling ---
  function setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => console.error('Global error:', event.error));
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });
  }

  // --- Main initialization ---
  function initialize() {
    setupGlobalErrorHandling();
    initializeDNSPrefetch();
    initializeShowMore();
    loadNewsDetails();
    loadExternalScripts();

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(initializeModules, { timeout: 2000 });
    } else {
      setTimeout(initializeModules, 100);
    }
  }

  // Start the application
  initialize();

});