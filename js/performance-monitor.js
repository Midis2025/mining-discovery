/**
 * Performance Monitoring Utility
 * Add this temporarily to measure page load improvements
 * Remove in production or keep for analytics
 */

(function() {
  'use strict';

  // Only run if performance API is available
  if (!window.performance || !window.performance.timing) {
    console.warn('Performance API not available');
    return;
  }

  // Wait for page to fully load
  window.addEventListener('load', function() {
    setTimeout(function() {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;
      const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;

      console.group('📊 Page Performance Metrics');
      console.log('Total Page Load Time:', pageLoadTime + 'ms');
      console.log('DOM Ready Time:', domReadyTime + 'ms');
      console.log('Server Response Time:', connectTime + 'ms');
      console.log('DOM Render Time:', renderTime + 'ms');
      console.groupEnd();

      // Performance rating
      if (pageLoadTime < 2000) {
        console.log('✅ Performance: EXCELLENT (< 2s)');
      } else if (pageLoadTime < 4000) {
        console.log('⚠️ Performance: GOOD (2-4s)');
      } else {
        console.log('❌ Performance: NEEDS IMPROVEMENT (> 4s)');
      }

      // Check for long tasks (optional - requires PerformanceObserver)
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                console.warn('⚠️ Long task detected:', entry.duration.toFixed(2) + 'ms');
              }
            }
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          // PerformanceObserver might not support longtask in all browsers
        }
      }
    }, 0);
  });

  // Monitor API call performance
  const originalFetch = window.fetch;
  const apiTimes = {};

  window.fetch = function(...args) {
    const url = args[0];
    const startTime = performance.now();

    return originalFetch.apply(this, args)
      .then(response => {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        // Log slow API calls
        if (duration > 1000) {
          console.warn(`🐌 Slow API call (${duration}ms):`, url);
        }

        // Track API call times
        if (!apiTimes[url]) {
          apiTimes[url] = [];
        }
        apiTimes[url].push(duration);

        return response;
      })
      .catch(error => {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        console.error(`❌ API call failed (${duration}ms):`, url, error);
        throw error;
      });
  };

  // Expose API times for debugging
  window.getAPITimes = function() {
    console.group('🌐 API Call Summary');
    Object.keys(apiTimes).forEach(url => {
      const times = apiTimes[url];
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      console.log(`${url.substring(0, 60)}...`);
      console.log(`  Calls: ${times.length} | Avg: ${Math.round(avg)}ms | Min: ${min}ms | Max: ${max}ms`);
    });
    console.groupEnd();
  };

  // Visual performance indicator (optional - shows in console)
  console.log('%c⚡ Performance Monitoring Active', 'color: #ae8a4c; font-weight: bold; font-size: 14px;');
  console.log('Run window.getAPITimes() to see API performance stats');
})();
