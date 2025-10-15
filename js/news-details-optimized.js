/**
 * Optimized News Details Loader
 * Improvements:
 * 1. Skeleton loading state (immediate visual feedback)
 * 2. Frontend caching (instant loads for viewed articles)
 * 3. Progressive rendering (content appears as it's ready)
 * 4. Lazy loading images
 * 5. Debounced scroll events
 * 6. Reduced DOM manipulation
 */

const API_ROOT = "https://admins.miningdiscovery.com";

// Configuration
const CONFIG = {
    API_BASE_URL: `${API_ROOT}/api`,
    REQUEST_TIMEOUT: 8000,
    SCROLL_THRESHOLD: 20,
    SUBSCRIPTION_KEY: 'mining_discovery_subscribed',
    CACHE_DURATION: 15 * 60 * 1000, // 15 minutes for article details
    enableCache: true, // Enable caching for articles
};

// Expose config to window for cached-fetch-wrapper
if (!window.LOAD_CONFIG) {
    window.LOAD_CONFIG = {
        enableCache: true
    };
}

// Global state
let popupShown = false;
let allComments = [];
let originalPopupFormContent = null;

// ============================================
// SKELETON LOADING STATE
// ============================================

function showSkeletonLoading() {
    const container = document.getElementById("newsDetails");
    if (!container) return;

    container.innerHTML = `
        <div class="news-detail skeleton-loading">
            <div class="news-header">
                <div class="skeleton skeleton-tag"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-title" style="width: 70%;"></div>
                <div class="news-meta">
                    <div class="skeleton skeleton-meta"></div>
                    <div class="skeleton skeleton-meta"></div>
                </div>
            </div>

            <div class="news-image">
                <div class="skeleton skeleton-image"></div>
            </div>

            <div class="news-body">
                <div class="short-description">
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line" style="width: 80%;"></div>
                </div>

                <div class="full-description">
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line" style="width: 90%;"></div>
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line" style="width: 85%;"></div>
                </div>
            </div>
        </div>

        <style>
            .skeleton-loading * {
                pointer-events: none;
            }

            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s ease-in-out infinite;
                border-radius: 4px;
            }

            .skeleton-tag {
                width: 120px;
                height: 24px;
                margin-bottom: 15px;
                display: inline-block;
            }

            .skeleton-title {
                height: 32px;
                margin-bottom: 10px;
            }

            .skeleton-meta {
                width: 150px;
                height: 16px;
                margin-right: 15px;
                display: inline-block;
            }

            .skeleton-image {
                width: 100%;
                height: 400px;
                margin-bottom: 30px;
            }

            .skeleton-line {
                height: 18px;
                margin-bottom: 12px;
                width: 100%;
            }

            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            @media (max-width: 768px) {
                .skeleton-image {
                    height: 250px;
                }

                .skeleton-title {
                    height: 24px;
                }
            }
        </style>
    `;
}

// ============================================
// CACHING LAYER
// ============================================

async function getCachedArticle(id) {
    if (!window.CacheManager) return null;

    try {
        const cached = await window.CacheManager.get(`article_${id}`);
        if (cached) {
            console.log(`✅ Article loaded from cache: ${id}`);
            return cached;
        }
    } catch (e) {
        console.warn('Cache read error:', e);
    }
    return null;
}

async function cacheArticle(id, data) {
    if (!window.CacheManager) return;

    try {
        await window.CacheManager.set(`article_${id}`, data, {}, CONFIG.CACHE_DURATION);
        console.log(`💾 Article cached: ${id}`);
    } catch (e) {
        console.warn('Cache write error:', e);
    }
}

// ============================================
// LAZY LOADING IMAGES
// ============================================

function setupLazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// ============================================
// PROGRESSIVE RENDERING
// ============================================

function renderArticleProgressively(newsSection, categoryDisplay, publishDate) {
    const container = document.getElementById("newsDetails");
    const imageUrl = getImageUrl(newsSection.image);

    // Phase 1: Render header immediately
    container.innerHTML = `
        <div class="news-detail">
            <div class="news-header">
                <span class="category-tag">${categoryDisplay}</span>
                <h1>${newsSection.title || "Untitled"}</h1>

                <div class="news-meta">
                    ${newsSection.author ? `<span class="author">${newsSection.author}</span>` : ''}
                    ${publishDate ? `<span class="publish-date">${publishDate}</span>` : ''}
                </div>
            </div>

            ${imageUrl ? `
                <div class="news-image">
                    <img data-src="${imageUrl}"
                         alt="${newsSection.image?.alternativeText || newsSection.title}"
                         class="lazy-image"
                         style="background: #f0f0f0;" />
                </div>
            ` : ''}

            <div class="news-body">
                <div class="short-description-placeholder">
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                </div>

                <div class="full-description-placeholder">
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                </div>
            </div>
        </div>
    `;

    // Trigger lazy load for the image
    setTimeout(() => setupLazyLoadImages(), 100);

    // Phase 2: Render content (async)
    setTimeout(() => {
        renderArticleContent(newsSection);
    }, 50);
}

function renderArticleContent(newsSection) {
    const shortDescPlaceholder = document.querySelector('.short-description-placeholder');
    const fullDescPlaceholder = document.querySelector('.full-description-placeholder');

    if (!shortDescPlaceholder || !fullDescPlaceholder) return;

    // Render short description
    if (newsSection.short_description) {
        shortDescPlaceholder.outerHTML = `
            <div class="short-description">
                <p>${newsSection.short_description}</p>
            </div>
        `;
    } else {
        shortDescPlaceholder.remove();
    }

    // Render full description
    let descriptionHTML = "";
    if (newsSection.description) {
        try {
            const parsed = JSON.parse(newsSection.description);
            descriptionHTML = renderRichText(parsed);
        } catch (e) {
            descriptionHTML = formatPlainDescription(newsSection.description);
        }
    }

    fullDescPlaceholder.outerHTML = `
        <div class="full-description">
            ${descriptionHTML}
        </div>
    `;
}

// ============================================
// OPTIMIZED loadNewsDetails
// ============================================

async function loadNewsDetails() {
    const { id, category } = getQueryParams();
    const container = document.getElementById("newsDetails");

    if (!id) {
        container.innerHTML = `<p>Invalid news item.</p>`;
        updateTopbarTitle("Invalid News Item");
        return;
    }

    // Show skeleton immediately
    showSkeletonLoading();

    try {
        // Try cache first
        const cachedArticle = await getCachedArticle(id);

        if (cachedArticle) {
            // Render from cache (instant!)
            renderCachedArticle(cachedArticle, id);
            return;
        }

        // Not in cache, fetch from API
        let newsSection = null;
        let categorySlug = null;

        const url = `${API_ROOT}/api/news-categories?populate[news_sections][populate]=*`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data?.data && Array.isArray(data.data)) {
            for (const categoryItem of data.data) {
                let sections = categoryItem?.news_sections;
                if (!Array.isArray(sections) && categoryItem?.attributes?.news_sections) {
                    const v4Data = categoryItem.attributes.news_sections.data || [];
                    sections = v4Data.map((x) => ({ id: x.id, documentId: x.documentId, ...x.attributes }));
                }
                if (Array.isArray(sections)) {
                    const found = sections.find(section =>
                        section.id?.toString() === id || section.documentId?.toString() === id
                    );
                    if (found) {
                        newsSection = found;
                        categorySlug = categoryItem.slug || categoryItem?.attributes?.slug;
                        break;
                    }
                }
            }
        }

        if (!newsSection) {
            throw new Error('News article not found');
        }

        // Cache the article for future visits
        await cacheArticle(id, {
            newsSection,
            categorySlug,
            category
        });

        // Render the article
        renderArticle(newsSection, categorySlug, category, id);

    } catch (err) {
        console.error('Error loading news details:', err);
        updateTopbarTitle("Error Loading News");
        container.innerHTML = `
            <div class="error-state" style="padding: 40px; text-align: center;">
                <h2 style="color: #dc3545; margin-bottom: 15px;">❌ Failed to Load Article</h2>
                <p style="color: #666; margin-bottom: 20px;">${err.message}</p>
                <button onclick="location.reload()" style="
                    background: #ae8a4c;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                ">Retry</button>
            </div>
        `;
    }
}

function renderCachedArticle(cachedData, id) {
    const { newsSection, categorySlug, category } = cachedData;
    renderArticle(newsSection, categorySlug, category, id);
}

function renderArticle(newsSection, categorySlug, category, id) {
    updateTopbarTitle(newsSection.title);

    const publishDate = newsSection.publish_on ?
        new Date(newsSection.publish_on).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '';

    const displayCategory = category || categorySlug || 'NEWS';
    const categoryDisplay = displayCategory.toUpperCase().replace(/-/g, ' ');

    // Use progressive rendering
    renderArticleProgressively(newsSection, categoryDisplay, publishDate);

    // Render comments section after a short delay
    setTimeout(() => {
        renderCommentsSection(id);
    }, 200);
}

function renderCommentsSection(id) {
    const container = document.getElementById("newsDetails");
    if (!container) return;

    const commentsHTML = renderNewCommentsSection(id);
    const backToTopHTML = `
        <button id="backToTop" class="back-to-top" title="Back to top">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
        </button>
    `;

    container.insertAdjacentHTML('beforeend', commentsHTML);
    container.insertAdjacentHTML('beforeend', backToTopHTML);
    container.insertAdjacentHTML('beforeend', getArticleStyles());

    // Initialize features
    setTimeout(() => {
        const popupForm = document.getElementById('subscribeForm');
        if (popupForm) {
            popupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                window.subscribe();
            });
        }

        handleCommentSubmission(id);
        displayComments(id);
        initBackToTop();
        initializeScrollPopup();
    }, 100);
}

// ============================================
// DEBOUNCED SCROLL HANDLER
// ============================================

function initializeScrollPopup() {
    const newsDetails = document.getElementById('newsDetails');
    if (!newsDetails || isUserSubscribed() || popupShown) {
        return;
    }

    getOriginalPopupFormContent();
    let scrollCheckEnabled = true;
    let scrollTimeout;

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

    // Debounced scroll event
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        if (!popupShown && !isUserSubscribed()) {
            scrollTimeout = setTimeout(handleScroll, 150); // Debounce to 150ms
        }
    }, { passive: true });

    setTimeout(handleScroll, 500);
}

// ============================================
// Keep all original functions from news-details.js
// (subscription, comments, utilities, etc.)
// ============================================

// Copy all the original functions here...
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
    const originalContent = getOriginalPopupFormContent();

    if (innerContainer) {
        innerContainer.innerHTML = originalContent;
        const form = document.getElementById('subscribeForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                window.subscribe();
            });
        }
    }
}

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
        console.log('Subscription Bottom Popup displayed.');
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

function showSubscriptionSuccess() {
    const innerContainer = document.querySelector('#subscribePopup .popup-inner');

    if (innerContainer) {
        innerContainer.innerHTML = `
            <div class="text-content" style="padding-top: 15px;">
                <h2 style="color: #ae8a4c; margin-bottom: 5px;">✓ Subscription Successful!</h2>
                <p style="margin-bottom: 25px;">Thank you! You can now continue reading.</p>
            </div>
            <button onclick="window.closePopup()" style="
                background: linear-gradient(135deg, #ffd27d, #ae8a4c);
                color: #111;
                font-weight: bold;
                padding: 12px 100px;
                width: 85%;
                max-width: 380px;
            ">Continue Reading</button>
        `;
    }

    setTimeout(() => {
        hideSubscriptionPopup();
        resetPopupContent();
    }, 2500);
}

function showSubscriptionError(message) {
    const messageContainer = document.getElementById('popup-message-container');
    if (messageContainer) {
        messageContainer.innerHTML = '';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'subscription-error';
        errorDiv.style.cssText = 'color: #ff6b6b; background: rgba(255, 107, 107, 0.1); padding: 10px; border-radius: 8px; font-size: 13px; margin-top: 10px; border: 1px solid rgba(255, 107, 107, 0.3); width: 100%; max-width: 380px; margin-left: auto; margin-right: auto;';
        errorDiv.textContent = message;

        messageContainer.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 5000);
    }
}

window.closePopup = function() {
    hideSubscriptionPopup();
};

window.subscribe = async function() {
    const emailInput = document.querySelector('#subscribePopup #email');
    const email = emailInput ? emailInput.value.trim() : '';
    const subscribeButton = document.querySelector('#subscribeForm button[type="submit"]');

    const messageContainer = document.getElementById('popup-message-container');
    if (messageContainer) messageContainer.innerHTML = '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showSubscriptionError('Please enter a valid email address');
        return;
    }

    if (subscribeButton) {
        subscribeButton.disabled = true;
        subscribeButton.textContent = 'Subscribing...';
        subscribeButton.style.opacity = '0.7';
    }

    const apiURL = `${CONFIG.API_BASE_URL}/subscribers`;
    const payload = JSON.stringify({ data: { email: email } });

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Subscription failed (Status ${response.status}).`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error?.message || errorData.message || errorMessage;
            } catch (e) {
                if (errorText.length > 0) {
                    errorMessage = `Subscription failed. Details: ${errorText.substring(0, 50)}...`;
                }
            }
            throw new Error(errorMessage);
        }

        markUserSubscribed();
        showSubscriptionSuccess();

    } catch (error) {
        console.error('Subscription error:', error);

        if (subscribeButton) {
            subscribeButton.disabled = false;
            subscribeButton.textContent = 'Continue';
            subscribeButton.style.opacity = '1';
        }

        showSubscriptionError(
            error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
              ? 'Network error. Please check your connection and try again.'
              : `Subscription failed: ${error.message}`
        );
    }
};

// Comments functions
function loadComments(newsId) {
    if (!window.commentsStore) window.commentsStore = {};
    return window.commentsStore[`comments_${newsId}`] || [];
}

function saveComment(newsId, commentData) {
    if (!window.commentsStore) window.commentsStore = {};

    const comments = loadComments(newsId);
    const newComment = {
        id: Date.now(),
        name: commentData.name,
        email: commentData.email,
        comment: commentData.comment,
        createdAt: new Date().toISOString()
    };

    comments.unshift(newComment);
    window.commentsStore[`comments_${newsId}`] = comments;
    return newComment;
}

function renderComment(comment) {
    const now = new Date(comment.createdAt || Date.now());
    const date = now.toLocaleDateString('en-US');
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div class="user-comment">
            <div class="header">
                <div class="username"><i class="fa-regular fa-user"></i> ${comment.name || 'Anonymous'}</div>
                <div class="date">${date} at ${time}</div>
            </div>
            <div class="text">
                ${comment.comment.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="like"><i class="fa-regular fa-heart"></i> Like</div>
        </div>
    `;
}

function renderCommentsList() {
    const commentList = document.getElementById('comment-list');
    const commentCountP = document.getElementById('comment-count-text');

    if (!commentList) return;

    if (allComments.length === 0) {
        commentList.innerHTML = '<div style="text-align:center; padding: 20px; color: #5b4633;">No comments yet. Be the first to comment!</div>';
        if (commentCountP) commentCountP.textContent = '0 Comments';
        return;
    }

    if (commentCountP) commentCountP.textContent = `${allComments.length} Comments`;
    commentList.innerHTML = allComments.map(renderComment).join('');
}

function displayComments(newsId) {
    try {
        allComments = loadComments(newsId);
        renderCommentsList();
    } catch (error) {
        console.error('Error loading comments:', error);
        const commentList = document.getElementById('comment-list');
        if (commentList) {
            commentList.innerHTML = '<div style="color:red; text-align:center; padding: 20px;">Error loading comments.</div>';
        }
    }
}

function handleCommentSubmission(newsId) {
    const form = document.getElementById('newCommentForm');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const commentTextarea = form.querySelector('textarea');
        const nameInput = document.getElementById('commentNameField');
        const emailInput = document.getElementById('commentEmailField');
        const commentButton = form.querySelector('button');

        const comment = commentTextarea.value.trim();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!comment || !name || !email) {
            showMessage('Please fill in Name, Email, and Comment.', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        commentButton.disabled = true;
        commentButton.textContent = 'Posting...';

        setTimeout(() => {
            try {
                const newComment = saveComment(newsId, { name, email, comment });
                allComments.unshift(newComment);
                renderCommentsList();

                commentTextarea.value = '';

                showMessage('Comment posted successfully!', 'success');
            } catch (error) {
                console.error('Error posting comment:', error);
                showMessage('Error posting comment. Please try again.', 'error');
            } finally {
                commentButton.disabled = false;
                commentButton.textContent = 'Submit';
            }
        }, 500);
    });
}

function renderNewCommentsSection(newsId) {
    return `
        <div class="comments-section" id="commentsSection">
            <div class="comments-header">
                <h2>Comments</h2>
                <div class="login-dropdown">Login <i class="fa-solid fa-angle-down"></i></div>
            </div>

            <p id="comment-count-text">0 Comments</p>

            <form id="newCommentForm">
                <div class="comment-box">
                    <textarea id="commentText" name="comment" placeholder="Add comment here..."></textarea>
                    <div class="comment-toolbar">
                        <div class="toolbar-icons">
                            <i class="fa-solid fa-bold"></i>
                            <i class="fa-solid fa-italic"></i>
                            <i class="fa-solid fa-underline"></i>
                            <i class="fa-solid fa-link"></i>
                            <i class="fa-solid fa-quote-left"></i>
                            <i class="fa-regular fa-face-smile"></i>
                        </div>
                        <button type="submit">Submit</button>
                    </div>
                </div>

                <div class="signup-section">
                    <span class="share-icons">
                        <span>Share</span>
                    </span>
                    </p>
                    <input type="text" id="commentNameField" name="name" placeholder="Name*" class="input-field" required/>
                    <input type="email" id="commentEmailField" name="email" placeholder="Email*" class="input-field" required/>
                    <input type="password" id="commentPasswordField" placeholder="Password*" class="input-field" />

                    <div class="acknowledge">
                        <input type="checkbox" id="ageCheck" />
                        <label for="ageCheck">Acknowledge I am 18 and older.</label>
                    </div>

                  
                </div>
            </form>

            <div class="comments-sort">Most Recent <i class="fa-solid fa-angle-down"></i></div>

            <div id="comment-list"></div>
        </div>
    `;
}

// Utility functions
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get("id"),
        category: params.get("category")
    };
}

function getImageUrl(image) {
    if (!image) return "";

    if (Array.isArray(image)) image = image[0];
    if (image.data) {
        image = image.data;
        if (Array.isArray(image)) image = image[0];
    }
    if (image.attributes) image = image.attributes;

    let url = null;
    if (image.formats?.large?.url) url = image.formats.large.url;
    else if (image.formats?.medium?.url) url = image.formats.medium.url;
    else if (image.formats?.small?.url) url = image.formats.small.url;
    else if (image.formats?.thumbnail?.url) url = image.formats.thumbnail.url;
    else if (image.url) url = image.url;

    if (url && url.startsWith("/")) url = API_ROOT + url;
    return url || "";
}

function formatPlainDescription(description) {
    if (!description) return "";

    return description
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => {
            if (paragraph.startsWith('![')) return '';
            return `<p>${paragraph}</p>`;
        })
        .join('');
}

function updateTopbarTitle(title) {
    const topbarElement = document.querySelector('.topbar h1');
    if (topbarElement) topbarElement.textContent = title || "News Article";
    document.title = title ? `${title} - Mining Discovery` : "News - Mining Discovery";
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.message-popup');
    if (existingMessage) existingMessage.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-popup ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => messageDiv.remove(), 3000);
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }, 100);
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Render Rich Text function (if needed)
function renderRichText(richTextData) {
    // Add your rich text rendering logic here
    // For now, just return formatted description
    return formatPlainDescription(JSON.stringify(richTextData));
}

// Get article styles
function getArticleStyles() {
    return `<style>
        /* Lazy load image styles */
        .lazy-image {
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .lazy-image.loaded {
            opacity: 1;
        }

        /* All other styles from news-details.js */
        /* Copy the entire style block from the original file */
    </style>`;
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", loadNewsDetails);

console.log('✅ Optimized news-details.js loaded');
