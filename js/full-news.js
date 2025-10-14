document.addEventListener("DOMContentLoaded", () => {
    const API_ROOT = "https://admins.miningdiscovery.com";

    // --- Configuration ---
    const CONFIG = {
        API_BASE_URL: `${API_ROOT}/api`,
        CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
        REQUEST_TIMEOUT: 8000, // 8 seconds
        EXTERNAL_SCRIPTS: ['./js/advertisment.js', './js/projects.js', './js/reports.js'],
        SCROLL_THRESHOLD: 40, // Show popup at 40% scroll
        SUBSCRIPTION_KEY: 'mining_discovery_subscribed'
    };

    // --- Cache and State Variables ---
    let projectsCache = null;
    let reportsCache = null;
    let cacheTimestamp = null;
    let popupShown = false;
    let originalPopupFormContent = null;

    // --- CRITICAL: Get/Reset Content for New Popup Structure ---
    function getOriginalPopupFormContent() {
        if (!originalPopupFormContent) {
            originalPopupFormContent = `
                <div class="text-content">
                    <h2>Create a free account, or log in.</h2>
                    <p>Gain access to limited free articles, news alerts, select newsletters, podcasts and some daily games.</p>
                </div>
                <form id="subscribeForm">
                    <label for="email">Email address</label>
                    <input type="email" id="email" placeholder="Enter your email" required />
                    <button type="submit">Continue</button>
                </form>
                <div id="popup-message-container"></div>
            `;
        }
        return originalPopupFormContent;
    }

    function resetPopupContent() {
        const innerContainer = document.querySelector('#subscribePopup .popup-inner');
        if (innerContainer) {
            innerContainer.innerHTML = getOriginalPopupFormContent();

            const form = document.getElementById('subscribeForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    window.subscribe();
                });
            }
        }
    }

    // --- Inject Comprehensive Responsive Styles (UPDATED with Comments Section) ---
    function injectResponsiveStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Global Responsive Reset */
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: 'Inter', sans-serif, 'Pontano Sans', sans-serif;
            }

            body {
                overflow-x: hidden;
                width: 100%;
                color: #222;
                line-height: 1.6;
            }
            
            body.popup-open {
                overflow: hidden;
            }

            .main-content {
                // width: 100%;
                max-width: 1200px;
                margin: 0 auto;
                padding: clamp(15px, 3vw, 30px);
                min-height: 60vh;
                background: #f9f9f9;
            }
               .content{
               text-align: justify;
               }

            #newsDetails {
                // width: 65%;
                background: #fff;
                border-radius: clamp(8px, 2vw, 12px);
                // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                border: 1px solid #fff;
            }

            #newsDetails h2 {
                font-size: clamp(1.2rem, 3vw, 1.8rem);
                // padding: clamp(15px, 3vw, 25px);
                text-align: center;
                color: #000;
            }
            
            /* Subscription Popup Styles */
            .overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.6s ease;
                z-index: 9998;
            }

            .overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .subscribe-popup {
                position: fixed;
                left: 0;
                bottom: -100%;
                width: 100%;
                background: #292929;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
                z-index: 9999;
                transition: bottom 1s ease;
            }

            .subscribe-popup.active {
                bottom: 0;
            }

            .popup-inner {
                max-width: 600px;
                margin: auto;
                padding: 35px 25px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                text-align: center;
            }
            
            .popup-inner::before {
                content: "";
                width: 60px;
                height: 4px;
                background: #ccc;
                border-radius: 2px;
                margin: 0 auto 10px;
                display: block;
            }

            .popup-inner h2 {
                font-size: clamp(18px, 4vw, 22px);
                font-weight: 700;
                margin-bottom: 6px;
                color: #ae8a4c;
            }

            .popup-inner p {
                font-size: clamp(13px, 3vw, 15px);
                color: #fff;
                margin-bottom: 18px;
            }

            .popup-inner form {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
            }

            .popup-inner label {
                font-size: 13px;
                font-weight: 1000;
                margin-bottom: 5px;
                color: #ae8a4c;
            }

            .popup-inner input[type="email"] {
                width: 85%;
                max-width: 380px;
                padding: 12px 14px;
                border: 1.5px solid #ccc;
                border-radius: 10px;
                font-size: 14px;
                outline: none;
                transition: all 0.3s ease;
                background: #fdfdfd;
            }

            .popup-inner button {
                background: #ae8a4c;
                color: #fff;
                border: none;
                border-radius: 10px;
                padding: 15px 155px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 10px;
                letter-spacing: 0.5px;
                width: 85%;
                max-width: 380px;
            }
            
            #popup-message-container {
                width: 85%;
                max-width: 380px;
                margin: 5px auto 0;
            }
            
            .subscription-error {
                color: #ff6b6b;
                background: rgba(255, 107, 107, 0.1);
                padding: 10px;
                border-radius: 8px;
                font-size: 13px;
                margin-top: 10px;
                border: 1px solid rgba(255, 107, 107, 0.3);
            }

            /* Article Styles */
            article {
                max-width: 900px;
                margin: 0 auto;
                padding: clamp(15px, 3vw, 25px);
                width: 100%;
                background: #fff;
                border: 1px solid #fff;
            }

            /* Comments Section Styles */
            .comments-section {
                max-width: 900px;
                margin: 40px auto 0;
                padding: clamp(15px, 3vw, 25px);
                background: #fff;
                border-top: 2px solid #e0e0e0;
            }

            .comments-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #a76f2e;
                border-bottom: 1px solid #ddd;
                padding-bottom: 8px;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 10px;
            }

            .comments-header h2 {
                font-size: clamp(20px, 4vw, 24px);
                font-weight: 600;
                margin: 0;
            }

            .login-dropdown {
                font-size: clamp(14px, 3vw, 15px);
                cursor: pointer;
                color: #a76f2e;
            }

            .comments-count {
                font-size: clamp(14px, 3vw, 16px);
                color: #5b4633;
                margin-bottom: 15px;
            }

            .comment-box {
                border: 1px solid #bfa27d;
                border-radius: 8px;
                padding: 0;
                background: #fff;
                margin-bottom: 20px;
                overflow: hidden;
            }

            .comment-box textarea {
                width: 100%;
                height: 120px;
                border: none;
                padding: 12px;
                resize: vertical;
                font-size: clamp(14px, 3vw, 15px);
                outline: none;
                background: transparent;
                box-sizing: border-box;
                font-family: inherit;
            }

            .comment-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid #bfa27d;
                padding: 10px 12px;
                box-sizing: border-box;
                flex-wrap: wrap;
                gap: 10px;
            }

            .toolbar-icons {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .toolbar-icons i {
                cursor: pointer;
                color: #5b4633;
                font-size: clamp(14px, 3vw, 16px);
                padding: 4px;
                transition: color 0.3s;
            }

            .toolbar-icons i:hover {
                color: #a76f2e;
            }

            .comment-box button {
                background-color: #b58b52;
                color: #fff;
                border: none;
                border-radius: 5px;
                padding: clamp(8px, 2vw, 10px) clamp(18px, 4vw, 24px);
                cursor: pointer;
                font-size: clamp(13px, 3vw, 14px);
                font-weight: 500;
                transition: background-color 0.3s;
            }

            .comment-box button:hover {
                background-color: #a3763e;
            }

            .signup-section {
                margin-top: 25px;
            }

            .signup-section p {
                font-size: clamp(13px, 3vw, 14px);
                margin-bottom: 10px;
                color: #5b4633;
            }

            .share-icons {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                margin-left: 10px;
                flex-wrap: wrap;
            }

            .share-icons i {
                border: 1px solid #bfa27d;
                border-radius: 50%;
                padding: 6px;
                font-size: clamp(12px, 3vw, 14px);
                color: #5b4633;
                transition: 0.3s;
                cursor: pointer;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .share-icons i:hover {
                background: #bfa27d;
                color: #fff;
            }

            .input-field {
                width: 100%;
                border: 1px solid #bfa27d;
                border-radius: 5px;
                padding: clamp(10px, 2.5vw, 12px);
                margin-bottom: 12px;
                outline: none;
                font-size: clamp(13px, 3vw, 14px);
                font-family: inherit;
            }

            .acknowledge {
                display: flex;
                align-items: center;
                font-size: clamp(12px, 3vw, 13px);
                color: #5b4633;
                margin-bottom: 20px;
            }

            .acknowledge input {
                margin-right: 8px;
                cursor: pointer;
            }

            .or-login {
                text-align: center;
                margin: 15px 0;
                font-size: clamp(13px, 3vw, 14px);
                color: #5b4633;
            }

            .login-icons {
                display: flex;
                justify-content: center;
                gap: 15px;
            }
a{
color:#ae8a4c;
}
            .login-icons i {
                border: 1px solid #bfa27d;
                border-radius: 50%;
                padding: 8px;
                font-size: clamp(14px, 3vw, 16px);
                color: #5b4633;
                transition: 0.3s;
                cursor: pointer;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .login-icons i:hover {
                background: #bfa27d;
                color: #fff;
            }

            .comments-sort {
                text-align: right;
                margin: 25px 0 15px;
                font-size: clamp(13px, 3vw, 14px);
                color: #5b4633;
                cursor: pointer;
            }

            .user-comment {
                border: 1px solid #bfa27d;
                border-radius: 10px;
                padding: clamp(12px, 3vw, 15px);
                margin-top: 15px;
                font-size: clamp(13px, 3vw, 14px);
                background: #fff;
            }

            .user-comment .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                color: #5b4633;
                flex-wrap: wrap;
                gap: 8px;
            }

            .user-comment .username {
                font-weight: 600;
                font-size: clamp(14px, 3vw, 15px);
            }

            .user-comment .date {
                font-size: clamp(11px, 2.5vw, 12px);
                color: #888;
            }

            .user-comment .text {
                color: #333;
                margin-bottom: 10px;
                line-height: 1.6;
            }

            .user-comment .like {
                font-size: clamp(12px, 3vw, 13px);
                color: #a76f2e;
                cursor: pointer;
                transition: color 0.3s;
            }

            .user-comment .like:hover {
                color: #8b5a23;
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
            
            /* Tablet Portrait (481px - 767px) */
            @media screen and (max-width: 767px) {
                .popup-inner {
                    padding: 25px 15px;
                }
                
                .popup-inner input[type="email"],
                .popup-inner button {
                    width: 100%;
                    max-width: 100%;
                }

                .comments-header {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .toolbar-icons {
                    order: 2;
                    width: 100%;
                    justify-content: flex-start;
                }

                .comment-box button {
                    order: 1;
                    width: 100%;
                }

                .comment-toolbar {
                    flex-direction: column;
                    align-items: stretch;
                }

                .share-icons {
                    margin-left: 0;
                    margin-top: 8px;
                }
            }

            /* Mobile (320px - 480px) */
            @media screen and (max-width: 480px) {
                .popup-inner {
                    padding: 20px 15px;
                }

                .comments-section {
                    padding: clamp(10px, 3vw, 15px);
                }

                .toolbar-icons {
                    gap: 6px;
                }

                .toolbar-icons i {
                    font-size: 14px;
                }
            }

            /* Landscape Mobile */
            @media screen and (max-height: 500px) and (orientation: landscape) {
                .popup-inner {
                    padding: 15px;
                }

                .comment-box textarea {
                    height: 80px;
                }
            }

            /* Print Styles */
            @media print {
                .subscribe-popup,
                .overlay,
                .comment-box,
                .signup-section,
                .comments-sort,
                .login-dropdown {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // --- Comments Section HTML Template ---
    function getCommentsHTML() {
        return `
            <div class="comments-section">
                <div class="comments-header">
                    <h2>Comments</h2>
                    <div class="login-dropdown">Login <i class="fa-solid fa-angle-down"></i></div>
                </div>

                <p class="comments-count">0 Comments</p>

                <div class="comment-box">
                    <textarea placeholder="Add comment here..."></textarea>
                    <div class="comment-toolbar">
                        <div class="toolbar-icons">
                            <i class="fa-solid fa-bold" title="Bold"></i>
                            <i class="fa-solid fa-italic" title="Italic"></i>
                            <i class="fa-solid fa-underline" title="Underline"></i>
                            <i class="fa-solid fa-link" title="Link"></i>
                            <i class="fa-solid fa-quote-left" title="Quote"></i>
                            <i class="fa-regular fa-face-smile" title="Emoji"></i>
                        </div>
                        <button type="button">Submit</button>
                    </div>
                </div>

                <div class="signup-section">
                  
                        <span class="share-icons">
                            <span>Share</span>
                         
                        </span>
                    </p>
                    <input type="text" placeholder="Name*" class="input-field" />
                    <input type="email" placeholder="Email*" class="input-field" />
                    <input type="password" placeholder="Password*" class="input-field" />

                    <div class="acknowledge">
                        <input type="checkbox" id="ageCheck" />
                        <label for="ageCheck">Acknowledge I am 18 and older.</label>
                    </div>

                    <div class="or-login">Or Login With</div>
                    <div class="login-icons">
                        <i class="fa-brands fa-google" title="Login with Google"></i>
                        <i class="fa-brands fa-facebook-f" title="Login with Facebook"></i>
                    </div>
                </div>

                <div class="comments-sort">Most Recent <i class="fa-solid fa-angle-down"></i></div>

                <div class="user-comment">
                    <div class="header">
                        <div class="username"><i class="fa-regular fa-user"></i> Username</div>
                        <div class="date">MM/DD/YYYY at 00:00</div>
                    </div>
                    <div class="text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                    </div>
                    <div class="like"><i class="fa-regular fa-heart"></i> Like</div>
                </div>
            </div>
        `;
    }

    // --- Subscription Functions ---
    function isUserSubscribed() {
        return sessionStorage.getItem(CONFIG.SUBSCRIPTION_KEY) === 'true';
    }

    function markUserSubscribed() {
        sessionStorage.setItem(CONFIG.SUBSCRIPTION_KEY, 'true');
    }

    function showSubscriptionPopup() {
        const popup = document.getElementById('subscribePopup');
        const overlay = document.getElementById('overlay');

        if (popup && overlay && !popupShown && !isUserSubscribed()) {
            resetPopupContent();
            popup.classList.add('active');
            overlay.classList.add('active');
            popupShown = true;
            document.body.classList.add('popup-open');
            console.log('Bottom Popup displayed successfully');
        }
    }

    function hideSubscriptionPopup() {
        const popup = document.getElementById('subscribePopup');
        const overlay = document.getElementById('overlay');
        if (popup && overlay) {
            popup.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('popup-open');
        }
    }

    window.closePopup = function() {
        hideSubscriptionPopup();
    };

    window.subscribe = async function() {
        const emailInput = document.getElementById('email');
        const email = emailInput ? emailInput.value.trim() : '';
        const subscribeButton = document.querySelector('#subscribeForm button');
        const messageContainer = document.getElementById('popup-message-container');

        if (messageContainer) messageContainer.innerHTML = '';
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showSubscriptionError('Please enter a valid email address');
            return;
        }

        if (subscribeButton) {
            subscribeButton.disabled = true;
            subscribeButton.textContent = 'Subscribing...';
            subscribeButton.style.opacity = '0.7';
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/subscribers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { email: email } })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Server returned ${response.status}`);
            }

            markUserSubscribed();
            showSubscriptionSuccess();

        } catch (error) {
            if (subscribeButton) {
                subscribeButton.disabled = false;
                subscribeButton.textContent = 'Continue';
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
        const innerContainer = document.querySelector('#subscribePopup .popup-inner');

        if (innerContainer) {
            innerContainer.innerHTML = `
                <div class="text-content" style="padding-top: 15px;">
                    <h2 style="color: #ae8a4c; margin-bottom: 5px;">✓ Subscription Successful!</h2>
                    <p style="margin-bottom: 25px; color: #fff;">Thank you! You can now continue reading.</p>
                </div>
                <button onclick="window.closePopup()" style="
                    background: linear-gradient(135deg, #ffd27d, #ae8a4c);
                    color: #111;
                    font-weight: bold;
                    padding: 12px 100px;
                    width: 85%;
                    max-width: 380px;
                    border-radius: 10px;
                    border: none;
                ">Continue Reading</button>
            `;
        }
        setTimeout(hideSubscriptionPopup, 2500);
    }

    function showSubscriptionError(message) {
        const messageContainer = document.getElementById('popup-message-container');
        if (messageContainer) {
            messageContainer.innerHTML = `<div class="subscription-error">${message}</div>`;
            setTimeout(() => messageContainer.innerHTML = '', 5000);
        }
    }

    // --- Scroll Detection ---
    function initializeScrollPopup() {
        const newsDetails = document.getElementById('newsDetails');
        if (!newsDetails) { return; }

        resetPopupContent();

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
                showSubscriptionPopup();
                scrollCheckEnabled = false;
            }
        }

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            if (!popupShown && !isUserSubscribed()) {
                scrollTimeout = setTimeout(handleScroll, 100);
            }
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

    async function fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
        
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
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

        for (const endpoint of endpoints) {
            try {
                const filteredUrl = `${endpoint.url}?filters[id][$eq]=${contentId}`;
                const response = await fetchWithTimeout(filteredUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    const items = data.data || data;
                    if (Array.isArray(items) && items.length > 0) {
                        return { item: items[0], source: endpoint.name };
                    }
                }
            } catch (error) { /* ignore filtered errors */ }
        }

        if (isCacheValid()) {
            if (projectsCache) {
                const item = projectsCache.find(p => p.id == contentId || p.id === parseInt(contentId));
                if (item) return { item, source: 'projects-cache' };
            }
            if (reportsCache) {
                const item = reportsCache.find(p => p.id == contentId || p.id === parseInt(contentId));
                if (item) return { item, source: 'reports-cache' };
            }
        }

        for (const endpoint of endpoints) {
            try {
                const response = await fetchWithTimeout(endpoint.url);
                
                if (!response.ok) continue;
                
                const data = await response.json();
                const items = data.data || data;
                
                if (!Array.isArray(items)) continue;

                if (endpoint.name === 'projects') projectsCache = items;
                else if (endpoint.name === 'reports') reportsCache = items;
                
                cacheTimestamp = Date.now();

                const item = items.find(p => p.id == contentId || p.id === parseInt(contentId));
                
                if (item) return { item, source: endpoint.name };
            } catch (error) { /* ignore full request errors */ }
        }

        throw new Error(`Content with ID ${contentId} not found in any endpoint`);
    }

    function renderNewsArticle(result, container) {
        const { item, source } = result;
        
        const title = item.project_title || item.title || 'Untitled';
        const contentType = source.includes('project') ? 'Project' : 'Report';
        
        const description = item.longDescription || item.shortDescription || 'No description available.';
        const author = item.author || 'Mining Discovery';
        const createdAt = item.createdAt || '';
        const updatedAt = item.updatedAt || '';

        const formattedCreatedDate = formatDate(createdAt);
        const formattedUpdatedDate = (updatedAt && updatedAt !== createdAt) ? formatDate(updatedAt) : '';
        const processedDescription = processDescription(description);

        const sourceIndicator = source && !source.includes('cache') ? `
            <span style="background: #e8f5e8; color: #ae8a4c; padding: clamp(2px, 1vw, 4px) clamp(4px, 1.5vw, 8px); border-radius: 3px; font-size: clamp(10px, 2vw, 12px);">
                Source: ${source}
            </span>
        ` : '';

        // Load Font Awesome if not already loaded
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesomeLink = document.createElement('link');
            fontAwesomeLink.rel = 'stylesheet';
            fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
            document.head.appendChild(fontAwesomeLink);
        }

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
                ${getCommentsHTML()}
            `;
        });
    }

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
            
            setTimeout(initializeScrollPopup, 1000);
        } catch (error) {
            showError(container, "Error Loading Content", error.message, true, contentId);
        }
    }

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

    function initializeDNSPrefetch() {
        try {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'dns-prefetch';
            preloadLink.href = CONFIG.API_BASE_URL.replace('/api', '');
            document.head.appendChild(preloadLink);
        } catch (error) { console.warn('Failed to add DNS prefetch:', error); }
    }

    function setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => console.error('Global error:', event.error));
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });
    }

    function initializeModules() {
        const modules = ["loadAdvertisements", "loadProjects", "loadReports"];
        modules.forEach(fnName => {
            try {
                if (typeof window[fnName] === "function") { window[fnName](); }
            } catch (error) { console.error(`Error initializing ${fnName}:`, error); }
        });
    }
    
    function handleViewportChanges() { 
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const popup = document.getElementById('subscribePopup');
                if (popup && popup.classList.contains('active')) {
                    popup.classList.remove('active');
                    requestAnimationFrame(() => {
                        popup.classList.add('active');
                    });
                }
            }, 250);
        }, { passive: true });
        window.addEventListener('orientationchange', () => {
             setTimeout(() => { window.scrollTo(0, window.scrollY + 1); window.scrollTo(0, window.scrollY - 1); }, 100);
        });
    }

    function enhanceMobileExperience() { 
        const buttons = document.querySelectorAll('button, .close-btn');
        buttons.forEach(button => { button.style.touchAction = 'manipulation'; });

        if (!document.querySelector('meta[name="viewport"]')) {
            const viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
            document.head.appendChild(viewportMeta);
        }
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

    function initialize() {
        console.log('Initializing Mining Discovery application...');
        
        getOriginalPopupFormContent(); 
        
        injectResponsiveStyles();
        setupGlobalErrorHandling();
        initializeDNSPrefetch();
        handleViewportChanges();
        enhanceMobileExperience();
        
        const subscribePopup = document.getElementById('subscribePopup');
        const overlay = document.getElementById('overlay');
        if (subscribePopup) subscribePopup.classList.remove('active');
        if (overlay) overlay.classList.remove('active');

        loadNewsDetails();
        loadExternalScripts();

        if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(initializeModules, { timeout: 2000 });
        } else {
            setTimeout(initializeModules, 100);
        }

        console.log('Mining Discovery application initialized successfully');
    }

    initialize();
});