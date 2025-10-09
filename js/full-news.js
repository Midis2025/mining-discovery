document.addEventListener("DOMContentLoaded", () => {

  // --- Configuration ---
  const CONFIG = {
    API_BASE_URL: 'https://admins.miningdiscovery.com/api',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    REQUEST_TIMEOUT: 8000, // 8 seconds
    EXTERNAL_SCRIPTS: ['./js/advertisment.js', './js/projects.js', './js/reports.js'],
    SCROLL_THRESHOLD: 40, // Show popup at 40% scroll
    SUBSCRIPTION_KEY: 'mining_discovery_subscribed'
  };

  // --- Cache for storing fetched data ---
  let projectsCache = null;
  let reportsCache = null;
  let cacheTimestamp = null;
  let popupShown = false;

  // --- Inject Comprehensive Responsive Styles ---
  function injectResponsiveStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Global Responsive Reset */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        overflow-x: hidden;
        width: 100%;
      }

      /* Main Content Area Responsive Styles */
      .main-content {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: clamp(15px, 3vw, 30px);
        min-height: 60vh;
        background: #fff;
      }

      #newsDetails {
        width: 100%;
        background: #fff;
        border-radius: clamp(8px, 2vw, 12px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border: 1px solid #fff;
      }

      #newsDetails h2 {
        font-size: clamp(1.2rem, 3vw, 1.8rem);
        padding: clamp(15px, 3vw, 25px);
        text-align: center;
        color: #000;
      }

      /* Popup Overlay Responsive Styles */
      .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: clamp(10px, 3vw, 20px);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }

      .popup-overlay.active {
        display: flex;
      }

      /* Subscribe Box Responsive Styles */
      .subscribe-box {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: clamp(12px, 3vw, 20px);
        padding: clamp(25px, 5vw, 45px) clamp(20px, 4vw, 35px);
        max-width: min(500px, 95vw);
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        position: relative;
        margin: auto;
        animation: slideIn 0.3s ease-out;
        text-align: center;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Close Button */
      .close-btn {
        position: absolute;
        top: clamp(10px, 2vw, 15px);
        right: clamp(10px, 2vw, 15px);
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: #fff;
        font-size: clamp(20px, 4vw, 28px);
        width: clamp(32px, 7vw, 40px);
        height: clamp(32px, 7vw, 40px);
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        line-height: 1;
        font-weight: 300;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
      }

      /* Logo in Popup */
      .logo2 {
        max-width: clamp(120px, 40vw, 180px);
        height: auto;
        margin: 0 auto clamp(15px, 3vw, 20px);
        display: block;
      }

      /* Subscribe Box Headings */
      .subscribe-box h2 {
        background: linear-gradient(90deg, #ffda8b, #ae8a4c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: clamp(18px, 4.5vw, 28px);
        margin: 0 0 clamp(10px, 2vw, 15px) 0;
        font-weight: bold;
        line-height: 1.3;
        padding: 0;
        text-align: center;
      }

      .subscribe-box > p {
        color: #ddd;
        font-size: clamp(13px, 3vw, 16px);
        line-height: 1.6;
        margin: 0 0 clamp(20px, 4vw, 25px) 0;
      }

      /* Form Group */
      .form-group {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: clamp(10px, 2vw, 12px);
      }

      .form-group input[type="email"] {
        width: 100%;
        padding: clamp(12px, 2.5vw, 15px) clamp(14px, 3vw, 18px);
        border: 2px solid #444;
        border-radius: clamp(8px, 2vw, 12px);
        background: #222;
        color: #fff;
        font-size: clamp(13px, 3vw, 16px);
        transition: all 0.3s ease;
        outline: none;
      }

      .form-group input[type="email"]:focus {
        border-color: #ffd27d;
        background: #2a2a2a;
        box-shadow: 0 0 0 3px rgba(255, 210, 125, 0.1);
      }

      .form-group input[type="email"]::placeholder {
        color: #888;
      }

      .form-group button {
        width: 100%;
        padding: clamp(12px, 2.5vw, 15px);
        border: none;
        border-radius: clamp(8px, 2vw, 12px);
        background: linear-gradient(135deg, #ffd27d, #ae8a4c);
        color: #111;
        font-size: clamp(14px, 3vw, 17px);
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .form-group button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255, 210, 125, 0.4);
      }

      .form-group button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      /* Article Responsive Styles */
      article {
        max-width: 900px;
        margin: 0 auto;
        padding: clamp(15px, 3vw, 25px);
        width: 100%;
        background: #fff;
        border: 1px solid #fff;
      }

      article header {
        border-bottom: 3px solid #d4af37;
        padding-bottom: clamp(15px, 3vw, 20px);
        margin-bottom: clamp(20px, 4vw, 30px);
      }

      article header h1 {
        color: #000;
        margin: 0 0 clamp(12px, 2vw, 15px) 0;
        line-height: 1.3;
        font-size: clamp(1.5rem, 4vw, 2.2rem);
        font-weight: 600;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      article header > div {
        color: #333;
        font-size: clamp(11px, 2.5vw, 14px);
        display: flex;
        flex-wrap: wrap;
        gap: clamp(6px, 2vw, 12px);
        align-items: center;
      }

      article header > div span {
        background: #ecf0f1;
        padding: clamp(3px, 1vw, 5px) clamp(6px, 1.5vw, 10px);
        border-radius: 4px;
        white-space: nowrap;
        font-size: clamp(10px, 2vw, 13px);
      }

      article .content {
        line-height: 1.8;
        color: #000;
        font-size: clamp(14px, 2.5vw, 17px);
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      article .content p {
        margin-bottom: 1em;
        color: #000;
      }

      article .content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: clamp(15px, 3vw, 20px) auto;
        border-radius: 8px;
      }

      article footer {
        margin-top: clamp(30px, 5vw, 50px);
        padding-top: clamp(15px, 3vw, 25px);
        border-top: 2px solid #ecf0f1;
        text-align: center;
      }

      article footer a {
        color: #a37b3c;
        text-decoration: none;
        font-weight: 500;
        padding: clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px);
        border: 2px solid #a37b3c;
        border-radius: 6px;
        transition: all 0.3s ease;
        display: inline-block;
        font-size: clamp(13px, 2.5vw, 16px);
      }

      article footer a:hover {
        background: #a37b3c;
        color: white;
        transform: translateY(-2px);
      }

      /* Loading Spinner */
      .spinner-container {
        text-align: center;
        padding: clamp(30px, 6vw, 50px) clamp(15px, 3vw, 20px);
      }

      .spinner {
        display: inline-block;
        width: clamp(35px, 8vw, 50px);
        height: clamp(35px, 8vw, 50px);
        border: 4px solid #f3f3f3;
        border-top: 4px solid #a37b3c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .spinner-container p {
        margin-top: 15px;
        color: #000;
        font-size: clamp(13px, 2.5vw, 16px);
      }

      /* Error Container */
      .error-container {
        padding: clamp(15px, 3vw, 25px);
        margin: clamp(10px, 2vw, 20px);
        border-radius: 8px;
        font-size: clamp(13px, 2.5vw, 16px);
        word-wrap: break-word;
        background: #fff;
        border: 1px solid #fff;
      }

      .error-container h3 {
        font-size: clamp(16px, 3.5vw, 22px);
        margin-bottom: 10px;
        color: #b00;
      }

      .error-container p {
        margin: 8px 0;
        color: #000;
      }

      .error-container button,
      .error-container a {
        font-size: clamp(12px, 2.5vw, 15px);
        padding: clamp(6px, 1.5vw, 10px) clamp(12px, 2.5vw, 20px);
        display: inline-block;
        margin: 5px 5px 5px 0;
      }

      /* Warning and Error Messages */
      .subscribe-warning,
      .subscription-error {
        font-size: clamp(11px, 2.5vw, 14px) !important;
        padding: clamp(8px, 2vw, 12px) !important;
        margin-top: clamp(8px, 2vw, 12px) !important;
        border-radius: 6px;
        word-wrap: break-word;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }

      /* Tablet Landscape (768px - 1024px) */
      @media screen and (min-width: 768px) and (max-width: 1024px) {
        .subscribe-box {
          max-width: 520px;
        }

        .main-content {
          padding: 25px;
        }

        article {
          padding: 22px;
        }
      }

      /* Tablet Portrait (481px - 767px) */
      @media screen and (max-width: 767px) {
        .popup-overlay {
          padding: 15px;
        }

        .subscribe-box {
          padding: 30px 22px;
        }

        .main-content {
          padding: 18px;
        }

        article header > div {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        #newsDetails {
          border-radius: 8px;
        }
      }

      /* Mobile (320px - 480px) */
      @media screen and (max-width: 480px) {
        .popup-overlay {
          padding: 10px;
          align-items: flex-start;
          padding-top: 30px;
        }

        .subscribe-box {
          padding: 25px 18px;
          border-radius: 12px;
          max-width: 98vw;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          font-size: 22px;
          top: 8px;
          right: 8px;
        }

        .logo2 {
          max-width: 140px;
          margin-bottom: 12px;
        }

        .main-content {
          padding: 12px;
        }

        #newsDetails {
          border-radius: 6px;
        }

        article {
          padding: 15px;
        }

        article header {
          padding-bottom: 12px;
          margin-bottom: 18px;
        }

        article header > div {
          font-size: 11px;
          gap: 6px;
        }

        article header > div span {
          padding: 3px 6px;
          font-size: 10px;
        }

        article footer {
          margin-top: 30px;
          padding-top: 18px;
        }

        .error-container {
          padding: 15px;
          margin: 10px;
        }
      }

      /* Extra Small Mobile (< 360px) */
      @media screen and (max-width: 359px) {
        .subscribe-box {
          padding: 20px 15px;
        }

        .logo2 {
          max-width: 120px;
        }

        .main-content {
          padding: 10px;
        }

        article {
          padding: 12px;
        }

        article header h1 {
          font-size: 1.3rem;
        }
      }

      /* Landscape Mobile (height < 500px) */
      @media screen and (max-height: 500px) and (orientation: landscape) {
        .popup-overlay {
          align-items: flex-start;
          padding-top: 10px;
          padding-bottom: 10px;
        }

        .subscribe-box {
          padding: 18px 20px;
          max-height: 92vh;
          overflow-y: auto;
          margin: 10px auto;
        }

        .logo2 {
          max-width: 100px;
          margin-bottom: 10px;
        }

        .subscribe-box h2 {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .subscribe-box > p {
          font-size: 12px;
          margin-bottom: 12px;
        }

        .form-group {
          gap: 8px;
        }

        .form-group input[type="email"],
        .form-group button {
          padding: 10px 12px;
          font-size: 13px;
        }
      }

      /* Large Desktop (> 1440px) */
      @media screen and (min-width: 1440px) {
        .subscribe-box {
          max-width: 560px;
          padding: 50px 45px;
        }

        .main-content {
          padding: 35px;
          
        }

        article {
          padding: 30px;
        }
      }

      /* High DPI Displays */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .subscribe-box {
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        article {
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
      }

      /* Reduced Motion Accessibility */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* Print Styles */
      @media print {
        .popup-overlay,
        .close-btn,
        article footer {
          display: none !important;
        }

        article {
          max-width: 100%;
        }
      }

      /* Dark Mode Support (Optional) */
      @media (prefers-color-scheme: dark) {
        /* Keep main content white even in dark mode */
        .main-content,
        #newsDetails,
        article {
          background: #fff !important;
          border-color: #fff !important;
         
        }

        #newsDetails h2,
        article header h1,
        article .content,
        article .content p {
          color: #000 !important;
          text-align: justify;

        }

        .error-container {
          background: #fff !important;
          border-color: #fff !important;
        }

        .error-container p {
          color: #000 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // --- Subscription Functions ---
  function isUserSubscribed() {
    return sessionStorage.getItem(CONFIG.SUBSCRIPTION_KEY) === 'true';
  }

  function markUserSubscribed() {
    sessionStorage.setItem(CONFIG.SUBSCRIPTION_KEY, 'true');
  }

  function showSubscriptionPopup() {
    const popup = document.getElementById('popup2');
    console.log('Attempting to show popup. Element found:', !!popup);
    
    if (popup && !popupShown && !isUserSubscribed()) {
      popup.style.display = 'flex';
      popup.classList.add('active');
      popupShown = true;
      document.body.style.overflow = 'hidden';
      console.log('Popup displayed successfully');
    }
  }

  function hideSubscriptionPopup() {
    const popup = document.getElementById('popup2');
    if (popup) {
      popup.style.display = 'none';
      popup.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  window.closePopup = function() {
    if (isUserSubscribed()) {
      hideSubscriptionPopup();
    } else {
      const subscribeBox = document.querySelector('.subscribe-box');
      if (subscribeBox) {
        const existingWarning = subscribeBox.querySelector('.subscribe-warning');
        if (!existingWarning) {
          const warning = document.createElement('p');
          warning.className = 'subscribe-warning';
          warning.style.cssText = 'color: #ffd27d; background: rgba(255, 210, 125, 0.1); padding: 10px; border-radius: 6px; margin: 12px 0 0; animation: shake 0.5s; border: 1px solid rgba(255, 210, 125, 0.3);';
          warning.textContent = 'Please subscribe to continue reading';
          subscribeBox.appendChild(warning);
          
          setTimeout(() => warning.remove(), 3000);
        }
      }
    }
  };

  window.subscribe = async function() {
    const emailInput = document.getElementById('email');
    const email = emailInput ? emailInput.value.trim() : '';
    const subscribeButton = document.querySelector('.form-group button');
    
    if (!email) {
      showSubscriptionError('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showSubscriptionError('Please enter a valid email address');
      return;
    }
    
    if (subscribeButton) {
      subscribeButton.disabled = true;
      subscribeButton.textContent = 'Subscribing...';
      subscribeButton.style.opacity = '0.7';
    }
    
    try {
      console.log('Sending subscription request for:', email);
      
      const response = await fetch('https://admins.miningdiscovery.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            email: email
          }
        })
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || `Server returned ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Subscription successful:', result);
      
      markUserSubscribed();
      showSubscriptionSuccess();
      
    } catch (error) {
      console.error('Subscription error:', error);
      
      if (subscribeButton) {
        subscribeButton.disabled = false;
        subscribeButton.textContent = 'Subscribe';
        subscribeButton.style.opacity = '1';
      }
      
      showSubscriptionError(
        error.message.includes('Failed to fetch') 
          ? 'Network error. Please check your connection and try again.' 
          : `Subscription failed: ${error.message}`
      );
    }
  };

  function showSubscriptionSuccess() {
    const subscribeBox = document.querySelector('.subscribe-box');
    if (subscribeBox) {
      subscribeBox.innerHTML = `
        <div style="padding: clamp(15px, 3vw, 25px); text-align: center;">
          <div style="font-size: clamp(36px, 10vw, 56px); color: #4CAF50; margin-bottom: 15px;">✓</div>
          <h2 style="background: linear-gradient(90deg, #ffda8b, #ae8a4c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: clamp(18px, 4vw, 26px); margin-bottom: 12px;">
            Thank You for Subscribing!
          </h2>
          <p style="color: #ddd; margin: 12px 0; font-size: clamp(13px, 2.5vw, 16px);">You'll receive the latest mining updates in your inbox.</p>
          <button onclick="closePopup()" style="
            padding: clamp(10px, 2vw, 14px) clamp(18px, 4vw, 28px);
            border: none;
            border-radius: 8px;
            background: linear-gradient(135deg, #ffd27d, #ae8a4c);
            color: #111;
            font-size: clamp(13px, 2.5vw, 16px);
            font-weight: bold;
            cursor: pointer;
            margin-top: 12px;
            width: auto;
            min-width: 150px;
          ">Continue Reading</button>
        </div>
      `;
    }
    
    setTimeout(() => {
      hideSubscriptionPopup();
    }, 2500);
  }

  function showSubscriptionError(message) {
    const subscribeBox = document.querySelector('.subscribe-box');
    if (subscribeBox) {
      const existingError = subscribeBox.querySelector('.subscription-error');
      if (!existingError) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'subscription-error';
        errorDiv.style.cssText = 'color: #ff6b6b; background: rgba(255, 107, 107, 0.1); padding: clamp(8px, 2vw, 12px); border-radius: 6px; font-size: clamp(11px, 2.5vw, 14px); margin-top: 12px; border: 1px solid rgba(255, 107, 107, 0.3);';
        errorDiv.textContent = message;
        subscribeBox.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
      }
    }
  }

  // --- Scroll Detection ---
  function initializeScrollPopup() {
    const newsDetails = document.getElementById('newsDetails');
    if (!newsDetails) {
      console.log('News details container not found');
      return;
    }

    console.log('Scroll popup initialized');
    let scrollCheckEnabled = true;

    function handleScroll() {
      if (!scrollCheckEnabled || isUserSubscribed() || popupShown) {
        return;
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

      if (scrollPercentage >= CONFIG.SCROLL_THRESHOLD) {
        console.log('Showing popup at', scrollPercentage.toFixed(2), '%');
        showSubscriptionPopup();
        scrollCheckEnabled = false;
      }
    }

    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    }, { passive: true });

    setTimeout(handleScroll, 1000);
  }

  // --- Utility Functions ---
  function showSpinner(container, message = "Loading...") {
    container.innerHTML = `
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
  }

  function showError(container, title, message, showRetry = true, contentId = null) {
    const retryButton = showRetry ? `
      <button onclick="location.reload()" style="
        background: #a37b3c; 
        color: white; 
        border: none; 
        padding: clamp(8px, 2vw, 12px) clamp(14px, 3vw, 20px); 
        border-radius: 6px; 
        cursor: pointer; 
        font-size: clamp(12px, 2.5vw, 15px);
      ">Retry</button>
    ` : '';

    container.innerHTML = `
      <div class="error-container" style="
        color: #b00; 
        padding: clamp(15px, 3vw, 25px); 
        border: 1px solid #ddd; 
        border-radius: 8px; 
        background: #fafafa;
        margin: clamp(10px, 2vw, 20px);
      ">
        <h3>${title}</h3>
        <p>${message}</p>
        ${contentId ? `<p style="font-size: clamp(12px, 2.5vw, 14px); color: #666;"><strong>Content ID:</strong> ${contentId}</p>` : ''}
        <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">
          ${retryButton}
          <a href="/" style="
            color: #a37b3c; 
            text-decoration: none; 
            padding: clamp(8px, 2vw, 12px) clamp(14px, 3vw, 20px);
            border: 2px solid #a37b3c;
            border-radius: 6px;
            display: inline-block;
            font-size: clamp(12px, 2.5vw, 15px);
          ">← Back to home</a>
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

    console.log(`Searching for content with ID: ${contentId}`);

    // Try filtered requests first
    for (const endpoint of endpoints) {
      try {
        const filteredUrl = `${endpoint.url}?filters[id][$eq]=${contentId}`;
        console.log(`Attempting filtered request on ${endpoint.name}: ${filteredUrl}`);
        
        const response = await fetchWithTimeout(filteredUrl);
        
        if (response.ok) {
          const data = await response.json();
          const items = data.data || data;
          
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
          console.warn(`HTTP ${response.status} for ${endpoint.name}`);
          continue;
        }
        
        const data = await response.json();
        const items = data.data || data;
        
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

        const item = items.find(p => p.id == contentId || p.id === parseInt(contentId));
        
        if (item) {
          console.log(`Found item in ${endpoint.name}`);
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
    
    // Update topbar h1 text only
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
      <span style="background: #e8f5e8; color: #2e7d32; padding: clamp(2px, 1vw, 4px) clamp(4px, 1.5vw, 8px); border-radius: 3px; font-size: clamp(10px, 2vw, 12px);">
        Source: ${source}
      </span>
    ` : '';

    requestAnimationFrame(() => {
      container.innerHTML = `
        <article>
          <header>
            <h1>${title}</h1>
            <div>
              ${sourceIndicator}
              ${author ? `<span><strong>Author:</strong> ${author}</span>` : ''}
              ${formattedCreatedDate ? `<span><strong>Published:</strong> ${formattedCreatedDate}</span>` : ''}
              ${formattedUpdatedDate ? `<span><strong>Updated:</strong> ${formattedUpdatedDate}</span>` : ''}
            </div>
          </header>
          <div class="content">
            ${processedDescription}
          </div>
          <footer>
            <a href="/">← Back to Home</a>
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
      console.log('Article loaded, initializing scroll popup...');
      setTimeout(() => {
        initializeScrollPopup();
        console.log('Scroll popup initialization complete');
      }, 1000);
    } catch (error) {
      console.error("Error loading content:", error);

      let errorMessage = error.message.includes("not found") 
        ? "The requested content could not be found." 
        : "Failed to load the content article.";
      
      let debugInfo = "";

      if (projectsCache || reportsCache) {
        const availableIds = [];
        if (projectsCache) availableIds.push(...projectsCache.slice(0, 5).map(p => `${p.id} (projects)`));
        if (reportsCache) availableIds.push(...reportsCache.slice(0, 5).map(p => `${p.id} (reports)`));
        if (availableIds.length) {
          debugInfo = `<p style="font-size: clamp(11px, 2vw, 12px); color: #666; margin-top: 10px;">Available IDs: ${availableIds.join(', ')}</p>`;
        }
      }

      container.innerHTML = `
        <div class="error-container" style="
          color: #b00; 
          padding: clamp(15px, 3vw, 25px); 
          border: 1px solid #ddd; 
          border-radius: 8px; 
          background: #fafafa;
          margin: clamp(10px, 2vw, 20px);
        ">
          <h3>Error Loading Content</h3>
          <p>${errorMessage}</p>
          <p style="font-size: clamp(12px, 2.5vw, 14px); color: #666;"><strong>Content ID:</strong> ${contentId}</p>
          ${debugInfo}
          <p style="font-size: clamp(11px, 2vw, 12px); color: #666;">Error details: ${error.message}</p>
          <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">
            <button onclick="location.reload()" style="
              background: #a37b3c; 
              color: white; 
              border: none; 
              padding: clamp(8px, 2vw, 12px) clamp(14px, 3vw, 20px); 
              border-radius: 6px; 
              cursor: pointer;
              font-size: clamp(12px, 2.5vw, 15px);
            ">Retry</button>
            <a href="/" style="
              color: #a37b3c; 
              text-decoration: none;
              padding: clamp(8px, 2vw, 12px) clamp(14px, 3vw, 20px);
              border: 2px solid #a37b3c;
              border-radius: 6px;
              display: inline-block;
              font-size: clamp(12px, 2.5vw, 15px);
            ">← Back to home</a>
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

  // --- Handle viewport changes ---
  function handleViewportChanges() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        console.log('Viewport resized to:', window.innerWidth, 'x', window.innerHeight);
        
        // Reposition popup if visible
        const popup = document.getElementById('popup2');
        if (popup && popup.style.display === 'flex') {
          popup.style.display = 'none';
          requestAnimationFrame(() => {
            popup.style.display = 'flex';
          });
        }
      }, 250);
    }, { passive: true });

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        console.log('Orientation changed');
        // Force viewport recalculation
        window.scrollTo(0, window.scrollY + 1);
        window.scrollTo(0, window.scrollY - 1);
      }, 100);
    });
  }

  // --- Add touch support for better mobile experience ---
  function enhanceMobileExperience() {
    // Prevent double-tap zoom on buttons
    const buttons = document.querySelectorAll('button, .close-btn');
    buttons.forEach(button => {
      button.style.touchAction = 'manipulation';
    });

    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
      document.head.appendChild(viewportMeta);
    }
  }

  // --- Main initialization ---
  function initialize() {
    console.log('Initializing Mining Discovery application...');
    
    injectResponsiveStyles();
    setupGlobalErrorHandling();
    initializeDNSPrefetch();
    initializeShowMore();
    handleViewportChanges();
    enhanceMobileExperience();
    loadNewsDetails();
    loadExternalScripts();

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(initializeModules, { timeout: 2000 });
    } else {
      setTimeout(initializeModules, 100);
    }

    console.log('Mining Discovery application initialized successfully');
  }

  // Start the application
  initialize();

});