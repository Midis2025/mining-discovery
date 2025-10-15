# Troubleshooting Guide

## Common Errors and Solutions

### ❌ Error: `LOAD_CONFIG is not defined`

**Full Error:**
```
ReferenceError: LOAD_CONFIG is not defined
    at window.fetch (cached-fetch-wrapper.js:103:5)
```

**Cause:**
The `cached-fetch-wrapper.js` was trying to access `LOAD_CONFIG` which only exists on pages that load `optimized-loader.js` (like index.html).

**Solution:** ✅ **FIXED**

The code has been updated to:
1. Check if `LOAD_CONFIG` exists before using it
2. Default to caching enabled if not defined
3. Each page now sets its own config

**Verification:**
```javascript
// In browser console
console.log(window.LOAD_CONFIG); // Should show: {enableCache: true}
```

---

### ❌ Error: `CacheManager is not defined`

**Cause:**
Cache scripts not loaded or loaded in wrong order.

**Solution:**
Make sure scripts load in this order:
```html
<!-- 1. Cache Manager (FIRST) -->
<script src="./js/cache-manager.js"></script>
<script src="./js/cached-fetch-wrapper.js"></script>

<!-- 2. Page-specific scripts -->
<script src="./js/news-details-optimized.js"></script>
```

**Verification:**
```javascript
console.log(window.CacheManager); // Should be an object
```

---

### ❌ Error: Cache not working

**Symptoms:**
- No cache hits in console
- Same API calls every time
- "Cache MISS" every visit

**Debug Steps:**

1. **Check if CacheManager loaded:**
```javascript
console.log(window.CacheManager); // Should be an object
```

2. **Check if caching is enabled:**
```javascript
console.log(window.LOAD_CONFIG?.enableCache); // Should be true
```

3. **View cache stats:**
```javascript
window.getCacheStats();
// Should show hits/misses
```

4. **Check browser support:**
```javascript
// Check IndexedDB
console.log('indexedDB' in window); // Should be true

// Check localStorage
console.log('localStorage' in window); // Should be true
```

**Common Solutions:**

- **Clear old cache:**
```javascript
window.clearCache();
location.reload();
```

- **Check if in private/incognito mode:**
  - IndexedDB might be disabled
  - Use regular browser window

- **Check browser console for errors:**
  - Look for red errors
  - Check Network tab for failed requests

---

### ❌ Error: Skeleton not showing

**Symptoms:**
- Blank page instead of skeleton
- No loading animation

**Debug Steps:**

1. **Check if newsDetails container exists:**
```javascript
console.log(document.getElementById('newsDetails')); // Should be an element
```

2. **Check if function is called:**
```javascript
// Add to news-details-optimized.js temporarily
console.log('showSkeletonLoading called');
```

3. **Check CSS loaded:**
```javascript
// Skeleton styles should be in the page
console.log(document.querySelector('.skeleton')); // Should exist during load
```

**Solution:**
- Make sure `news-details-optimized.js` loads correctly
- Check browser console for JavaScript errors
- Verify `newsDetails` div exists in HTML

---

### ❌ Error: Images not lazy loading

**Symptoms:**
- All images load at once
- No progressive loading

**Debug Steps:**

1. **Check IntersectionObserver support:**
```javascript
console.log('IntersectionObserver' in window); // Should be true
```

2. **Check image attributes:**
```javascript
// Images should have data-src, not src
const imgs = document.querySelectorAll('img[data-src]');
console.log(imgs.length); // Should be > 0
```

3. **Check if setupLazyLoadImages called:**
```javascript
// Add console.log in setupLazyLoadImages function
console.log('Lazy load setup for', images.length, 'images');
```

**Solution:**
- Update browser (IntersectionObserver needs modern browser)
- Check image HTML uses `data-src` attribute
- Fallback will load all images if browser too old

---

### ❌ Error: Scroll feels laggy

**Symptoms:**
- Stuttering during scroll
- High CPU usage
- Battery drain

**Debug Steps:**

1. **Check scroll event count:**
```javascript
let scrollCount = 0;
window.addEventListener('scroll', () => {
  scrollCount++;
  console.log('Scroll events:', scrollCount);
});
// Should NOT increment rapidly
```

2. **Check for duplicate scripts:**
```javascript
// View all script tags
const scripts = document.querySelectorAll('script[src]');
scripts.forEach(s => console.log(s.src));
// Look for duplicates
```

3. **Check passive flag:**
```javascript
// Scroll listeners should have {passive: true}
// Check in news-details-optimized.js
```

**Solution:**
- Remove duplicate script tags in HTML
- Verify debounced scroll in code
- Close other tabs/applications

---

### ❌ Error: Comments not saving

**Symptoms:**
- Comment form submits but nothing happens
- No comments display

**Debug Steps:**

1. **Check commentsStore:**
```javascript
console.log(window.commentsStore); // Should be an object
```

2. **Check form submission:**
```javascript
// Look for this in console after submitting
console.log('Comment posted successfully!');
```

3. **Check localStorage:**
```javascript
// Comments are stored in memory, not localStorage
// But check if page reloaded
console.log(window.commentsStore);
```

**Solution:**
- Comments are **in-memory only** (not persistent)
- They reset on page reload
- This is by design for demo purposes
- To make persistent, need backend API

---

### ❌ Error: Subscription popup not showing

**Symptoms:**
- Scroll 20% but no popup
- Popup never appears

**Debug Steps:**

1. **Check if already subscribed:**
```javascript
console.log(sessionStorage.getItem('mining_discovery_subscribed'));
// If 'true', popup won't show
```

2. **Clear subscription status:**
```javascript
sessionStorage.removeItem('mining_discovery_subscribed');
location.reload();
```

3. **Check popup elements exist:**
```javascript
console.log(document.getElementById('subscribePopup')); // Should exist
console.log(document.getElementById('overlay')); // Should exist
```

4. **Check scroll percentage:**
```javascript
window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollableHeight = documentHeight - windowHeight;
  const scrollPercentage = (scrollTop / scrollableHeight) * 100;
  console.log('Scroll %:', scrollPercentage.toFixed(2));
  // Should reach 20%
});
```

**Solution:**
- Clear session storage
- Scroll at least 20% down the page
- Check popup HTML exists in page
- Verify no JavaScript errors blocking execution

---

## Performance Issues

### Page loads slowly

**Check:**

1. **Network speed:**
```javascript
// Chrome DevTools → Network tab → Throttling
// Test with "Fast 3G" and "Slow 3G"
```

2. **API response time:**
```javascript
window.getAPITimes();
// Shows time for each API call
```

3. **Cache hit rate:**
```javascript
window.getCacheStats();
// Hit rate should be >70% after first visit
```

**Solutions:**
- Enable caching (should be default)
- Check network connection
- Verify server is responding
- Clear cache and try again

---

### High memory usage

**Check:**

1. **Cache size:**
```javascript
const stats = window.getCacheStats();
console.log('Cache size:', (stats.size / 1024).toFixed(2), 'KB');
// Should be under 5MB
```

2. **Clear old cache:**
```javascript
window.clearCache();
```

**Solution:**
- Cache auto-cleans at 5MB
- Manually clear if needed
- Check for memory leaks in other scripts

---

## Browser Compatibility Issues

### Feature not working in older browsers

**Check browser support:**

```javascript
// IndexedDB
console.log('indexedDB' in window);

// IntersectionObserver (lazy loading)
console.log('IntersectionObserver' in window);

// Fetch API
console.log('fetch' in window);

// Promise
console.log('Promise' in window);
```

**Minimum Browser Versions:**
- Chrome: 58+
- Firefox: 55+
- Safari: 11+
- Edge: 79+

**Fallbacks:**
- No IndexedDB → Uses localStorage
- No IntersectionObserver → Loads all images
- Older browsers may not support all features

---

## Quick Diagnostic Commands

Run these in browser console:

```javascript
// 1. Check caching system
console.log('CacheManager:', window.CacheManager ? '✅' : '❌');
console.log('LOAD_CONFIG:', window.LOAD_CONFIG ? '✅' : '❌');

// 2. View cache stats
window.getCacheStats();

// 3. View API performance
window.getAPITimes();

// 4. Check storage
console.log('IndexedDB:', 'indexedDB' in window ? '✅' : '❌');
console.log('localStorage:', 'localStorage' in window ? '✅' : '❌');

// 5. Check feature support
console.log('IntersectionObserver:', 'IntersectionObserver' in window ? '✅' : '❌');
console.log('Fetch:', 'fetch' in window ? '✅' : '❌');

// 6. Clear everything and reset
window.clearCache();
sessionStorage.clear();
localStorage.clear();
location.reload();
```

---

## Still Having Issues?

1. **Open browser console** (F12)
2. **Look for red errors**
3. **Run diagnostic commands above**
4. **Check Network tab** for failed requests
5. **Try in Incognito mode** (clean slate)
6. **Clear cache** and reload
7. **Check if scripts loaded** in correct order

---

## Script Load Order (Important!)

### ✅ Correct Order:

```html
<!-- 1. Cache system -->
<script src="./js/cache-manager.js"></script>
<script src="./js/cached-fetch-wrapper.js"></script>

<!-- 2. Page logic -->
<script src="./js/news-details-optimized.js"></script>

<!-- 3. Other features -->
<script src="./js/advertisment.js"></script>
```

### ❌ Wrong Order:

```html
<!-- ❌ Page logic loads before cache -->
<script src="./js/news-details-optimized.js"></script>
<script src="./js/cache-manager.js"></script> <!-- Too late! -->
```

---

## Need Help?

1. Check documentation:
   - [NEWS_DETAILS_OPTIMIZATION.md](NEWS_DETAILS_OPTIMIZATION.md)
   - [CACHING_GUIDE.md](CACHING_GUIDE.md)
   - [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

2. Run diagnostics in console

3. Check browser console for errors

4. Try in different browser

---

**Last Updated:** 2025-10-15
