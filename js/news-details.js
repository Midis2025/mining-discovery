const API_ROOT = "https://acceptable-desire-0cca5bb827.strapiapp.com";

// --- Configuration ---
const CONFIG = {
    API_BASE_URL: `${API_ROOT}/api`,
    REQUEST_TIMEOUT: 8000, // 8 seconds
    SCROLL_THRESHOLD: 20, // Show popup at 20% scroll
    SUBSCRIPTION_KEY: 'mining_discovery_subscribed' // Key for checking subscription status
};

// --- Global State Variables for Popup & Comments ---
let popupShown = false;
let allComments = [];

// --- New: Original Popup Form Content HTML (for resetting) ---
let originalPopupFormContent = null;
function getOriginalPopupFormContent() {
    if (!originalPopupFormContent) {
        // Hardcode the new form structure for resetting
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

// Restores the original form content and re-attaches listeners
function resetPopupContent() {
    const innerContainer = document.querySelector('#subscribePopup .popup-inner');
    const originalContent = getOriginalPopupFormContent();

    if (innerContainer) {
        innerContainer.innerHTML = originalContent;
        // Re-attach the event listener on the newly created form
        const form = document.getElementById('subscribeForm');
        if (form) {
             form.addEventListener('submit', (e) => {
                e.preventDefault();
                window.subscribe();
            });
        }
    }
}


// --- Subscription Popup Functions (Modified for bottom bar) ---

function isUserSubscribed() {
    // Check if user is logged in with Clerk
    if (window.Clerk && window.Clerk.user) {
        return true; // User is logged in, consider them subscribed
    }

    // Otherwise check session storage
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
             <div style="display: flex; justify-content: center;">
        <button onclick="window.closePopup()" style="
          background: linear-gradient(135deg, #ffd27d, #ae8a4c);
          color: #111;
          font-weight: bold;
          padding: 12px 100px;
          width: 85%;
          max-width: 380px;
          border: none;
          border-radius: 30px;
          cursor: pointer;
        ">Continue Reading</button>
      </div>
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
    console.log('API Request URL:', apiURL);
    
    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        });
        
        console.log('API Response Status:', response.status);

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
        console.error('Subscription error caught (Network or Logic):', error);
        
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

// --- Scroll Detection ---
function initializeScrollPopup() {
    const newsDetails = document.getElementById('newsDetails');
    if (!newsDetails || isUserSubscribed() || popupShown) {
        return;
    }
    
    getOriginalPopupFormContent(); 

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

    setTimeout(handleScroll, 500);
}

// ---------------------------------------------------------------------------------
// START OF COMMENT LOGIC (Restored and Adapted)
// ---------------------------------------------------------------------------------

// ✅ Load comments from memory
function loadComments(newsId) {
    if (!window.commentsStore) {
        window.commentsStore = {};
    }
    return window.commentsStore[`comments_${newsId}`] || [];
}

// ✅ Save comment to memory
function saveComment(newsId, commentData) {
    if (!window.commentsStore) {
        window.commentsStore = {};
    }
    
    const comments = loadComments(newsId);
    const newComment = {
        id: Date.now(),
        // Use fields from the new form structure
        name: commentData.name, 
        email: commentData.email,
        comment: commentData.comment,
        createdAt: new Date().toISOString()
    };
    
    comments.unshift(newComment);
    window.commentsStore[`comments_${newsId}`] = comments;
    return newComment;
}

// ✅ Render individual comment (using new HTML structure)
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

// ✅ Render and display comments list
function renderCommentsList() {
    const commentList = document.getElementById('comment-list');
    const commentCountP = document.getElementById('comment-count-text'); 
    
    if (allComments.length === 0) {
        commentList.innerHTML = '<div style="text-align:center; padding: 20px; color: #5b4633;">No comments yet. Be the first to comment!</div>';
        commentCountP.textContent = '0 Comments';
        return;
    }
    
    commentCountP.textContent = `${allComments.length} Comments`;
    commentList.innerHTML = allComments.map(renderComment).join('');
}

// ✅ Load and display comments wrapper
function displayComments(newsId) {
    try {
        allComments = loadComments(newsId);
        renderCommentsList();
    } catch (error) {
        console.error('Error loading comments:', error);
        document.getElementById('comment-list').innerHTML = '<div style="color:red; text-align:center; padding: 20px;">Error loading comments.</div>';
    }
}

// ✅ Handle comment form submission (adapted for new form fields)
function handleCommentSubmission(newsId) {
    const form = document.getElementById('newCommentForm');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
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

        try {
            // POST comment to Strapi API
            const apiURL = `${CONFIG.API_BASE_URL}/comments`;

            // Try to get the numeric ID if available
            const newsSectionId = currentNewsSection?.id || newsId;
            const newsSectionDocumentId = currentNewsSection?.documentId || newsId;

            // Strapi v5 payload - try with numeric ID first, then documentId
            const payload = {
                data: {
                    comment: comment,
                    name: name,
                    email: email,
                    news_section: newsSectionId // Try numeric ID first
                }
            };

            console.log('Posting comment to:', apiURL);
            console.log('Available IDs - Numeric:', newsSectionId, 'DocumentId:', newsSectionDocumentId);
            console.log('Payload:', JSON.stringify(payload, null, 2));

            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('API Response Status:', response.status);

            // If 500 error with numeric ID, try with documentId instead
            if (response.status === 500 && newsSectionId !== newsSectionDocumentId) {
                console.warn('500 error with numeric ID, retrying with documentId...');

                const retryPayload = {
                    data: {
                        comment: comment,
                        name: name,
                        email: email,
                        news_section: newsSectionDocumentId
                    }
                };

                console.log('Retry Payload:', JSON.stringify(retryPayload, null, 2));

                const retryResponse = await fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(retryPayload)
                });

                console.log('Retry Response Status:', retryResponse.status);

                if (!retryResponse.ok) {
                    const retryErrorText = await retryResponse.text();
                    console.error('Retry API Error Response:', retryErrorText);
                    throw new Error(`Failed to post comment (Status ${retryResponse.status}). ${retryErrorText.substring(0, 100)}`);
                }

                const retryData = await retryResponse.json();
                console.log('Comment posted successfully (retry):', retryData);

                // Success with documentId
                const newComment = saveComment(newsId, { name, email, comment });
                allComments.unshift(newComment);
                renderCommentsList();
                commentTextarea.value = '';
                showMessage('Comment posted successfully!', 'success');
                return; // Exit early on success
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);

                let errorMessage = `Failed to post comment (Status ${response.status}).`;

                try {
                    const errorData = JSON.parse(errorText);
                    console.error('Parsed Error Data:', errorData);

                    // More detailed error extraction
                    if (errorData.error) {
                        if (errorData.error.details) {
                            console.error('Error Details:', errorData.error.details);
                        }
                        errorMessage = errorData.error.message || errorMessage;
                    } else {
                        errorMessage = errorData.message || errorMessage;
                    }
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                    if (errorText.length > 0) {
                        errorMessage = `Failed to post comment. Details: ${errorText.substring(0, 100)}`;
                    }
                }
                throw new Error(errorMessage);
            }

            const responseData = await response.json();
            console.log('Comment posted successfully:', responseData);

            // Save comment locally and update UI
            const newComment = saveComment(newsId, { name, email, comment });
            allComments.unshift(newComment);
            renderCommentsList();

            // Clear only the comment textarea, keep name and email
            commentTextarea.value = '';

            showMessage('Comment posted successfully!', 'success');

        } catch (error) {
            console.error('Error posting comment:', error);
            showMessage(
                error.message.includes('Failed to fetch') || error.message.includes('NetworkError')
                    ? 'Network error. Please check your connection and try again.'
                    : `Error posting comment: ${error.message}`,
                'error'
            );
        } finally {
            commentButton.disabled = false;
            commentButton.textContent = 'Submit';
        }
    });
}

// ✅ Render the new comments HTML structure
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
                    

                    <div class="acknowledge">
                        <input type="checkbox" id="ageCheck" />
                        <label for="ageCheck">Acknowledge I am 18 and older.</label>
                    </div>

                   
            </form>

            <div class="comments-sort">Most Recent <i class="fa-solid fa-angle-down"></i></div>

            <div id="comment-list">
                </div>
        </div>
    `;
}
// ---------------------------------------------------------------------------------
// END OF COMMENT LOGIC
// ---------------------------------------------------------------------------------


// --- Utility Functions (Kept/Simplified) ---

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get("id"),
        category: params.get("category")
    };
}

function getImageUrl(image) {
    if (!image) return "";
    
    if (Array.isArray(image)) { image = image[0]; }
    if (image.data) {
        image = image.data;
        if (Array.isArray(image)) { image = image[0]; }
    }
    if (image.attributes) { image = image.attributes; }
    
    let url = null;
    if (image.formats?.large?.url) url = image.formats.large.url;
    else if (image.formats?.medium?.url) url = image.formats.medium.url;
    else if (image.formats?.small?.url) url = image.formats.small.url;
    else if (image.formats?.thumbnail?.url) url = image.formats.thumbnail.url;
    else if (image.url) url = image.url;
    
    if (url && url.startsWith("/")) { url = API_ROOT + url; }
    return url || "";
}

function formatPlainDescription(description) {
    if (!description) return "";
    
    return description
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => {
            if (paragraph.startsWith('![')) { return ''; }
            return `<p>${paragraph}</p>`;
        })
        .join('');
}

function updateTopbarTitle(title) {
    const topbarElement = document.querySelector('.topbar h1');
    if (topbarElement) { topbarElement.textContent = title || "News Article"; }
    document.title = title ? `${title} - Mining Discovery` : "News - Mining Discovery";
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.message-popup');
    if (existingMessage) { existingMessage.remove(); }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-popup ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => { messageDiv.remove(); }, 3000);
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) { return; }

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { backToTopBtn.classList.add('show'); }
        else { backToTopBtn.classList.remove('show'); }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- Share Functionality ---
function initShareButton() {
    const shareBtn = document.getElementById('shareBtn');
    const shareDropdown = document.getElementById('shareDropdown');

    if (!shareBtn || !shareDropdown) return;

    // Toggle dropdown
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shareDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!shareBtn.contains(e.target) && !shareDropdown.contains(e.target)) {
            shareDropdown.classList.remove('active');
        }
    });

    // Handle share options
    const shareOptions = shareDropdown.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = option.getAttribute('data-platform');
            handleShare(platform);
            shareDropdown.classList.remove('active');
        });
    });
}

function handleShare(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.querySelector('.news-detail h1')?.textContent || 'Check out this article');

    let shareUrl = '';

    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${title}%20${url}`;
            break;
        case 'copy':
            copyToClipboard(window.location.href);
            return;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback();
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showCopyFeedback();
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textarea);
    });
}

function showCopyFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.textContent = 'Link copied to clipboard!';
    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 3000);
}


// ---------------------------------------------------------------------------------
// CORE FUNCTION: loadNewsDetails (Corrected order for comment section)
// ---------------------------------------------------------------------------------

// Simple rich text renderer
function renderRichText(richTextData) {
    if (!richTextData) return '';

    // If it's already a string, return it
    if (typeof richTextData === 'string') {
        return formatPlainDescription(richTextData);
    }

    // Handle Strapi rich text format
    if (Array.isArray(richTextData)) {
        return richTextData.map(block => {
            if (block.type === 'paragraph') {
                const text = block.children?.map(child => child.text || '').join('') || '';
                return `<p>${text}</p>`;
            }
            if (block.type === 'heading') {
                const text = block.children?.map(child => child.text || '').join('') || '';
                const level = block.level || 2;
                return `<h${level}>${text}</h${level}>`;
            }
            return '';
        }).join('');
    }

    return formatPlainDescription(JSON.stringify(richTextData));
}

// Global variable to store news section IDs
let currentNewsSection = null;

async function loadNewsDetails() {
    const { id, category } = getQueryParams();
    const container = document.getElementById("newsDetails");

    if (!id) {
        container.innerHTML = `<p>Invalid news item.</p>`;
        updateTopbarTitle("Invalid News Item");
        return;
    }

    // Show skeleton loader
    container.innerHTML = `
        <div class="skeleton-loader">
            <div class="skeleton-header">
                <div class="skeleton-tag"></div>
                <div class="skeleton-title"></div>
                <div class="skeleton-meta">
                    <div class="skeleton-text-short"></div>
                    <div class="skeleton-text-short"></div>
                </div>
            </div>
            <div class="skeleton-image"></div>
            <div class="skeleton-body">
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text-short"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text-short"></div>
            </div>
        </div>
    `;

    try {
        let newsSection = null;
        let categorySlug = category;

        // OPTIMIZED: Try to fetch directly by documentId first (much faster!)
        try {
            const directUrl = `${API_ROOT}/api/news-sections/${id}?populate=*`;
            console.log('Attempting direct fetch from:', directUrl);
            const directRes = await fetch(directUrl);

            if (directRes.ok) {
                const directData = await directRes.json();
                newsSection = directData.data || directData;
                console.log('✅ Fast fetch successful');
            } else {
                console.log('Direct fetch returned status:', directRes.status);
            }
        } catch (err) {
            console.warn('Direct fetch failed:', err.message);
        }

        // Fallback: If direct fetch fails, search through categories (slower but more thorough)
        if (!newsSection) {
            const url = `${API_ROOT}/api/news-categories?populate[news_sections][populate]=*`;
            console.log('Attempting category search from:', url);
            try {
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
                            const found = sections.find(section => section.id?.toString() === id || section.documentId?.toString() === id);
                            if (found) {
                                newsSection = found;
                                categorySlug = categoryItem.slug || categoryItem?.attributes?.slug || category;
                                break;
                            }
                        }
                    }
                }
            } catch (fallbackErr) {
                console.error('Category search failed:', fallbackErr.message);
            }
        }

        if (!newsSection) { throw new Error('News article not found'); }

        // Store the complete newsSection data for comment submission
        currentNewsSection = {
            id: newsSection.id,
            documentId: newsSection.documentId || id,
            title: newsSection.title
        };
        console.log('Current News Section:', currentNewsSection);

        updateTopbarTitle(newsSection.title);

        const publishDate = newsSection.publish_on ? 
            new Date(newsSection.publish_on).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

        const imageUrl = getImageUrl(newsSection.image);

        let descriptionHTML = "";
        if (newsSection.description) {
            try {
                const parsed = JSON.parse(newsSection.description);
                descriptionHTML = renderRichText(parsed);
            } catch (e) {
                descriptionHTML = formatPlainDescription(newsSection.description);
            }
        }
        
        const displayCategory = category || categorySlug || 'NEWS';
        const categoryDisplay = displayCategory.toUpperCase().replace(/-/g, ' ');

        // --- Render the main HTML structure with the article followed by the comment section ---
        container.innerHTML = `
            <div class="news-detail">
                <div class="news-header">
                    <span class="category-tag">${categoryDisplay}</span>
                    <h1>${newsSection.title || "Untitled"}</h1>
                    
                    <div class="news-meta">
                        ${newsSection.author ? `<span class="author">${newsSection.author}</span>` : ''}
                        ${publishDate ? `<span class="publish-date">${publishDate}</span>` : ''}

                        <div class="share-button-container">
                            <button class="share-btn" id="shareBtn">
                                <i class="fa-solid fa-share-nodes"></i>
                                <span>Share</span>
                            </button>
                            <div class="share-dropdown" id="shareDropdown">
                                <h4>Share this article</h4>
                                <div class="share-options">
                                    <a href="#" class="share-option facebook" data-platform="facebook">
                                        <i class="fa-brands fa-facebook-f"></i>
                                        <span>Facebook</span>
                                    </a>
                                    <a href="#" class="share-option twitter" data-platform="twitter">
                                        <i class="fa-brands fa-twitter"></i>
                                        <span>Twitter</span>
                                    </a>
                                    <a href="#" class="share-option linkedin" data-platform="linkedin">
                                        <i class="fa-brands fa-linkedin-in"></i>
                                        <span>LinkedIn</span>
                                    </a>
                                    <a href="#" class="share-option whatsapp" data-platform="whatsapp">
                                        <i class="fa-brands fa-whatsapp"></i>
                                        <span>WhatsApp</span>
                                    </a>
                                    <a href="#" class="share-option copy" data-platform="copy">
                                        <i class="fa-solid fa-link"></i>
                                        <span>Copy Link</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${imageUrl ? `
                    <div class="news-image">
                        <img src="${imageUrl}" alt="${newsSection.image?.alternativeText || newsSection.title}" />
                    </div>
                ` : ''}
                
                <div class="news-body">
                    ${newsSection.short_description ? `
                        <div class="short-description">
                            <p>${newsSection.short_description}</p>
                        </div>
                    ` : ''}

                    <div class="full-description">
                        ${descriptionHTML}
                    </div>
                </div>
            </div>

            ${renderNewCommentsSection(id)}

            <button id="backToTop" class="back-to-top" title="Back to top">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
            </button>
        `;
        
        // --- Final Initialization ---
        
        setTimeout(() => {
            // Re-attach the submit listener for the newly rendered popup form
            const popupForm = document.getElementById('subscribeForm');
            if (popupForm) {
                 popupForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    window.subscribe();
                });
            }
            
            // Comment initialization
            handleCommentSubmission(id);
            displayComments(id);

            // Other features
            initBackToTop();
            initShareButton();
            // initializeScrollPopup(); // Subscription popup disabled for now
            
        }, 100);
        
    } catch (err) {
        console.error('Error loading news details:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        updateTopbarTitle("Error Loading News");
        
        let errorMessage = err.message;
        if (err.message.includes('Failed to fetch')) {
            errorMessage = 'Network error: Unable to reach the server. Please check your connection.';
        }
        
        document.getElementById("newsDetails").innerHTML = `<p style="color:#b00">Failed to load news: ${errorMessage}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadNewsDetails);