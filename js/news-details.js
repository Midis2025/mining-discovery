const API_ROOT = "https://admins.miningdiscovery.com";

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
                
                commentTextarea.value = ''; // Only clear the comment text
                
                showMessage('Comment posted successfully!', 'success');
            } catch (error) {
                console.error('Error posting comment:', error);
                showMessage('Error posting comment. Please try again.', 'error');
            } finally {
                commentButton.disabled = false;
                commentButton.textContent = 'Submit';
            }
        }, 500); // Simulated API delay
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
                    <input type="password" id="commentPasswordField" placeholder="Password*" class="input-field" />

                    <div class="acknowledge">
                        <input type="checkbox" id="ageCheck" />
                        <label for="ageCheck">Acknowledge I am 18 and older.</label>
                    </div>

                    <div class="or-login">Or Login With</div>
                    <div class="login-icons">
                        <i class="fa-brands fa-google"></i>
                        <i class="fa-brands fa-facebook-f"></i>
                    </div>
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


// ---------------------------------------------------------------------------------
// CORE FUNCTION: loadNewsDetails (Corrected order for comment section)
// ---------------------------------------------------------------------------------

async function loadNewsDetails() {
    const { id, category } = getQueryParams();
    const container = document.getElementById("newsDetails");

    if (!id) {
        container.innerHTML = `<p>Invalid news item.</p>`;
        updateTopbarTitle("Invalid News Item");
        return;
    }

    try {
        let newsSection = null;
        let categorySlug = null;

        // Data fetching logic... (assume successful fetch)
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
                    const found = sections.find(section => section.id?.toString() === id || section.documentId?.toString() === id);
                    if (found) {
                        newsSection = found;
                        categorySlug = categoryItem.slug || categoryItem?.attributes?.slug;
                        break;
                    }
                }
            }
        }
        
        if (!newsSection) { throw new Error('News article not found'); }

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
            
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Pontano+Sans:wght@300;400;600;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'); 
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'); 
                
                /* ======================================================= */
                /* BASE STYLES */
                /* ======================================================= */
                * { box-sizing: border-box; }
                body { font-family: 'Pontano Sans', sans-serif; margin: 0; padding: 0; }
                body.popup-open { overflow: hidden; }
            
                .news-detail { 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: clamp(12px, 3vw, 20px); 
                    font-family: 'Pontano Sans', sans-serif; 
                }
                
                /* --- ARTICLE STYLES --- */
                .news-header { margin-bottom: clamp(20px, 4vw, 30px); }
                .category-tag { 
                    display: inline-block; 
                    background-color:#ae8a4c; 
                    color: white; 
                    padding: clamp(4px, 1vw, 5px) clamp(8px, 2vw, 12px); 
                    border-radius: 4px; 
                    font-size: clamp(10px, 2vw, 12px); 
                    font-weight: bold; 
                    margin-bottom: clamp(10px, 2vw, 15px); 
                }
                .news-detail h1 { 
                    font-weight: bold; 
                    color: #333; 
                    line-height: 1.2; 
                    margin-bottom: clamp(10px, 2vw, 15px); 
                    word-wrap: break-word; 
                    font-size: clamp(1.5rem, 4vw, 2rem);
                }
                .news-meta { 
                    display: flex; 
                    flex-wrap: wrap; 
                    gap: clamp(10px, 2vw, 15px); 
                    color: #666; 
                    font-size: clamp(12px, 2vw, 14px); 
                    margin-bottom: clamp(15px, 3vw, 20px); 
                }
                .news-image { 
                    margin-bottom: clamp(20px, 4vw, 30px); 
                    text-align: center; 
                }
                .news-image img { 
                    width: 100%; 
                    max-width: 100%; 
                    height: auto; 
                    border-radius: clamp(6px, 1.5vw, 8px); 
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
                }
                .news-body { line-height: 1.6; color: #333; }
                .short-description { margin-bottom: clamp(18px, 3vw, 25px); }
                .short-description p { 
                    font-size: clamp(0.95rem, 2.5vw, 1.1rem); 
                    color: #333; 
                    font-weight: 700; 
                    line-height: 1.6; 
                    text-align: justify; 
                }
                
                .full-description { max-height: none !important; overflow: visible !important; opacity: 1 !important; }

                .full-description p { 
                    margin-bottom: clamp(12px, 2vw, 15px); 
                    font-size: clamp(0.9rem, 2vw, 1rem); 
                    text-align: justify; 
                }
                .full-description h1, .full-description h2, .full-description h3, .full-description h4, .full-description h5, .full-description h6 { 
                    margin-top: clamp(18px, 3vw, 25px); 
                    margin-bottom: clamp(12px, 2vw, 15px); 
                    color: #333; 
                    word-wrap: break-word; 
                    font-size: clamp(1.2rem, 3vw, 1.5rem);
                }
                .full-description ul, .full-description ol { 
                    margin: clamp(12px, 2vw, 15px) 0; 
                    padding-left: clamp(20px, 3vw, 25px); 
                }
                .full-description li { 
                    margin-bottom: 5px; 
                    font-size: clamp(0.9rem, 2vw, 1rem);
                }
                
                /* --- Back to Top & Messages --- */
                .message-popup { 
                    position: fixed; 
                    top: clamp(10px, 2vw, 20px); 
                    right: clamp(10px, 2vw, 20px); 
                    left: clamp(10px, 2vw, 20px); 
                    max-width: clamp(300px, 80vw, 400px); 
                    margin: 0 auto; 
                    padding: clamp(12px, 2vw, 15px) clamp(15px, 2.5vw, 20px); 
                    border-radius: clamp(6px, 1vw, 8px); 
                    color: white; 
                    font-weight: 600; 
                    font-size: clamp(0.8rem, 2vw, 0.95rem); 
                    z-index: 1000; 
                    animation: slideIn 0.3s ease; 
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2); 
                }
                .message-popup.success { background: #28a745; }
                .message-popup.error { background: #dc3545; }
                @keyframes slideIn { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .back-to-top { 
                    position: fixed; 
                    bottom: clamp(20px, 3vw, 30px); 
                    right: clamp(20px, 3vw, 30px); 
                    width: clamp(45px, 8vw, 50px); 
                    height: clamp(45px, 8vw, 50px); 
                    background: #9a6b2f; 
                    color: white; 
                    border: none; 
                    border-radius: 50%; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
                    opacity: 0; 
                    visibility: hidden; 
                    transform: translateY(20px); 
                    transition: all 0.3s ease; 
                    z-index: 999; 
                }
                .back-to-top svg {
                    width: clamp(20px, 4vw, 24px);
                    height: clamp(20px, 4vw, 24px);
                }
                .back-to-top.show { opacity: 1; visibility: visible; transform: translateY(0); }
                .back-to-top:hover { background: #7a5525; transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.3); }
                .back-to-top:active { transform: translateY(-1px); }
                
                /* ======================================================= */
                /* NEW COMMENT SECTION STYLES */
                /* ======================================================= */

                .comments-section {
                    max-width: 800px;
                    margin: clamp(30px, 5vw, 40px) auto; 
                    padding: 0 clamp(12px, 3vw, 20px);
                    font-family: 'Poppins', sans-serif;
                    color: #3c2f1b;
                }
                .comments-header {
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 10px;
                    color: #a76f2e; 
                    border-bottom: 1px solid #ddd; 
                    padding-bottom: clamp(6px, 1.5vw, 8px); 
                    margin-bottom: clamp(15px, 3vw, 20px);
                }
                .comments-header h2 { 
                    font-size: clamp(20px, 4vw, 24px); 
                    font-weight: 600; 
                    margin: 0;
                }
                .login-dropdown { 
                    font-size: clamp(13px, 2.5vw, 15px); 
                    cursor: pointer; 
                }
                
                #comment-count-text {
                    font-size: clamp(13px, 2.5vw, 15px);
                    margin-bottom: 15px;
                }

                .comment-box {
                    border: 1px solid #bfa27d; 
                    border-radius: clamp(6px, 1.5vw, 8px); 
                    padding: 0;
                    background: #fff; 
                    margin-bottom: clamp(15px, 3vw, 20px); 
                    overflow: hidden;
                }
                .comment-box textarea {
                    width: 100%; 
                    height: clamp(100px, 20vw, 120px); 
                    border: none; 
                    padding: clamp(8px, 2vw, 10px); 
                    resize: none;
                    font-size: clamp(13px, 2.5vw, 15px); 
                    outline: none; 
                    background: transparent; 
                    box-sizing: border-box;
                     font-family: 'Pontano Sans', sans-serif;
                }
                .comment-toolbar {
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 10px;
                    border-top: 1px solid #bfa27d; 
                    padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px); 
                    box-sizing: border-box;
                }
                .toolbar-icons { 
                    display: flex;
                    flex-wrap: wrap;
                    gap: clamp(4px, 1vw, 8px);
                }
                .toolbar-icons i { 
                    cursor: pointer; 
                    color: #5b4633; 
                    font-size: clamp(12px, 2.5vw, 14px);
                }
                .comment-box button {
                    background-color: #b58b52; 
                    color: #fff; 
                    border: none; 
                    border-radius: clamp(4px, 1vw, 5px);
                    padding: clamp(6px, 1.5vw, 8px) clamp(15px, 3vw, 20px); 
                    cursor: pointer; 
                    font-size: clamp(12px, 2.5vw, 14px); 
                    transition: background-color 0.3s;
                    white-space: nowrap;
                }
                .comment-box button:hover:not(:disabled) { background-color: #a3763e; }
                .comment-box button:disabled { background-color: #ccc; cursor: not-allowed; }

                .signup-section { 
                    margin-top: clamp(20px, 4vw, 25px); 
                }
                .signup-section p { 
                    font-size: clamp(12px, 2.5vw, 14px); 
                    margin-bottom: clamp(8px, 2vw, 10px); 
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 10px;
                }
                .share-icons { 
                    display: inline-flex; 
                    align-items: center; 
                    gap: clamp(6px, 1.5vw, 10px); 
                    flex-wrap: wrap;
                }
                .share-icons i {
                    border: 1px solid #bfa27d; 
                    border-radius: 50%; 
                    padding: clamp(5px, 1vw, 6px);
                    font-size: clamp(12px, 2.5vw, 14px); 
                    color: #5b4633; 
                    transition: 0.3s; 
                    cursor: pointer;
                }
                .share-icons i:hover { background: #bfa27d; color: #fff; }

                .input-field {
                    width: 100%; 
                    border: 1px solid #bfa27d; 
                    border-radius: clamp(4px, 1vw, 5px);
                    padding: clamp(8px, 2vw, 10px); 
                    margin-bottom: clamp(10px, 2vw, 12px); 
                    outline: none; 
                    font-size: clamp(12px, 2.5vw, 14px);
                }

                .acknowledge { 
                    display: flex; 
                    align-items: center; 
                    font-size: clamp(11px, 2.5vw, 13px); 
                    color: #5b4633; 
                    margin-bottom: clamp(15px, 3vw, 20px); 
                }
                .acknowledge input { 
                    margin-right: clamp(4px, 1vw, 6px); 
                    flex-shrink: 0;
                }
                .or-login { 
                    text-align: center; 
                    margin: clamp(8px, 2vw, 10px) 0; 
                    font-size: clamp(12px, 2.5vw, 14px); 
                    color: #5b4633; 
                }
                .login-icons { 
                    display: flex; 
                    justify-content: center; 
                    gap: clamp(12px, 2.5vw, 15px); 
                    flex-wrap: wrap;
                }
                .login-icons i {
                    border: 1px solid #bfa27d; 
                    border-radius: 50%; 
                    padding: clamp(5px, 1vw, 6px);
                    font-size: clamp(12px, 2.5vw, 14px); 
                    color: #5b4633; 
                    transition: 0.3s; 
                    cursor: pointer;
                }
                .login-icons i:hover { background: #bfa27d; color: #fff; }

                .comments-sort { 
                    text-align: right; 
                    margin-top: clamp(20px, 4vw, 25px); 
                    font-size: clamp(12px, 2.5vw, 14px); 
                    color: #5b4633; 
                }
                .user-comment {
                    border: 1px solid #bfa27d; 
                    border-radius: clamp(8px, 2vw, 10px); 
                    padding: clamp(12px, 2.5vw, 15px);
                    margin-top: clamp(12px, 2.5vw, 15px); 
                    font-size: clamp(12px, 2.5vw, 14px); 
                    background: #fff;
                }
                .user-comment .header { 
                    display: flex; 
                    justify-content: space-between; 
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 5px; 
                    color: #5b4633; 
                }
                .user-comment .username { 
                    font-weight: 600; 
                    font-size: clamp(12px, 2.5vw, 14px);
                }
                .user-comment .date { 
                    font-size: clamp(11px, 2vw, 12px); 
                }
                .user-comment .text { 
                    color: #333; 
                    margin-bottom: clamp(8px, 2vw, 10px); 
                    line-height: 1.5; 
                    word-wrap: break-word; 
                    font-size: clamp(12px, 2.5vw, 14px);
                }
                .user-comment .like { 
                    font-size: clamp(11px, 2.5vw, 13px); 
                    color: #a76f2e; 
                    cursor: pointer; 
                }
                
                /* ======================================================= */
                /* POPUP STYLES (from your provided HTML/CSS) */
                /* ======================================================= */

                .subscribe-popup {
                    position: fixed; 
                    left: 0; 
                    bottom: -100%; 
                    width: 100%; 
                    background: #292929;
                    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4); 
                    z-index: 9999;
                    transition: bottom 1s ease; 
                    font-family: 'Inter', sans-serif;
                }
                .subscribe-popup.active { bottom: 0; }
                .popup-inner {
                    max-width: 600px; 
                    margin: auto; 
                    padding: clamp(25px, 4vw, 35px) clamp(15px, 3vw, 25px); 
                    display: flex;
                    flex-direction: column; 
                    gap: clamp(12px, 2vw, 16px); 
                    text-align: center;
                }
                .popup-inner .text-content {
                    width: 100%;
                }
                .popup-inner h2 { 
                    font-size: clamp(18px, 3.5vw, 22px); 
                    font-weight: 700; 
                    margin-bottom: clamp(4px, 1vw, 6px); 
                    color: #ae8a4c; 
                    line-height: 1.3;
                }
                .popup-inner p { 
                    font-size: clamp(13px, 2.5vw, 15px); 
                    color: #fff; 
                    margin-bottom: clamp(14px, 2.5vw, 18px); 
                    line-height: 1.5;
                }
                .popup-inner form { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    width: 100%; 
                }
                .popup-inner label { 
                    font-size: clamp(11px, 2vw, 13px); 
                    font-weight: 1000; 
                    margin-bottom: 5px; 
                    color: #ae8a4c; 
                }
                .popup-inner input[type="email"] {
                    width: 100%; 
                    max-width: 380px; 
                    padding: clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 14px); 
                    border: 1.5px solid #ccc;
                    border-radius: clamp(8px, 1.5vw, 10px); 
                    font-size: clamp(12px, 2.5vw, 14px); 
                    outline: none; 
                    transition: all 0.3s ease; 
                    background: #fdfdfd;
                    box-sizing: border-box;
                }
                .popup-inner input[type="email"]:focus { 
                    border-color: #000; 
                    background: #fff; 
                    box-shadow: 0 0 6px rgba(0, 0, 0, 0.1); 
                }
                .popup-inner button {
                    background: #ae8a4c; 
                    color: #fff; 
                    border: none; 
                    border-radius: clamp(8px, 1.5vw, 10px);
                    padding: clamp(12px, 2.5vw, 15px) clamp(40px, 10vw, 155px); 
                    font-size: clamp(13px, 2.5vw, 15px); 
                    font-weight: 600; 
                    cursor: pointer;
                    transition: all 0.3s ease; 
                    margin-top: clamp(8px, 2vw, 10px); 
                    letter-spacing: 0.5px;
                    width: 100%; 
                    max-width: 380px;
                    box-sizing: border-box;
                }
                .popup-inner button:hover:not(:disabled) { background: #9a6b2f; }
                .popup-inner button:disabled { background: #6c757d; }

                .overlay {
                    position: fixed; 
                    inset: 0; 
                    background: rgba(0, 0, 0, 0.7); 
                    opacity: 0;
                    visibility: hidden; 
                    transition: opacity 0.6s ease; 
                    z-index: 9998;
                }
                .overlay.active { opacity: 1; visibility: visible; }
                .popup-inner::before {
                    content: ""; 
                    width: clamp(50px, 10vw, 60px); 
                    height: clamp(3px, 0.6vw, 4px); 
                    background: #ccc; 
                    border-radius: 2px;
                    margin: 0 auto clamp(8px, 2vw, 10px); 
                    display: block;
                }
                #popup-message-container { 
                    width: 100%; 
                    max-width: 380px; 
                    margin: -5px auto 0; 
                }
                
                /* ======================================================= */
                /* RESPONSIVE BREAKPOINTS */
                /* ======================================================= */
                
                @media (max-width: 768px) {
                    .comments-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .toolbar-icons {
                        order: 1;
                        width: 100%;
                    }
                    
                    .comment-box button {
                        order: 2;
                        width: 100%;
                        margin-top: 8px;
                    }
                    
                    .comment-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .signup-section p {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .share-icons {
                        margin-left: 0;
                    }
                }
                
                @media (max-width: 600px) {
                    .popup-inner { 
                        padding: clamp(20px, 4vw, 25px) clamp(12px, 3vw, 15px); 
                    }
                    .popup-inner input[type="email"], 
                    .popup-inner button { 
                        width: 100%; 
                        max-width: 100%; 
                        padding-left: clamp(12px, 2.5vw, 14px); 
                        padding-right: clamp(12px, 2.5vw, 14px); 
                    }
                    .popup-inner h2 { 
                        font-size: clamp(17px, 3.5vw, 20px); 
                    }
                    .popup-inner p { 
                        font-size: clamp(12px, 2.5vw, 14px); 
                    }
                    
                    .news-meta {
                        flex-direction: column;
                        gap: 8px;
                    }
                }
                
                @media (max-width: 480px) {
                    .news-detail, 
                    body .main-content { 
                        padding: 12px; 
                    }
                    .comments-section { 
                        padding: 0 12px; 
                    }
                    
                    .back-to-top {
                        bottom: 15px;
                        right: 15px;
                        width: 45px;
                        height: 45px;
                    }
                    
                    .user-comment .header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
                
                @media (max-width: 360px) {
                    .news-detail h1 {
                        font-size: 1.3rem;
                    }
                    
                    .category-tag {
                        font-size: 10px;
                        padding: 4px 8px;
                    }
                    
                    .comments-header h2 {
                        font-size: 18px;
                    }
                    
                    .comment-box textarea {
                        height: 90px;
                    }
                }
                
                /* Landscape orientation adjustments for mobile */
                @media (max-height: 500px) and (orientation: landscape) {
                    .popup-inner {
                        padding: 15px 20px;
                        gap: 10px;
                    }
                    
                    .popup-inner h2 {
                        margin-bottom: 3px;
                    }
                    
                    .popup-inner p {
                        margin-bottom: 10px;
                    }
                    
                    .comment-box textarea {
                        height: 80px;
                    }
                }
            </style>
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
            initializeScrollPopup();
            
        }, 100);
        
    } catch (err) {
        console.error('Error loading news details:', err);
        updateTopbarTitle("Error Loading News");
        document.getElementById("newsDetails").innerHTML = `<p style="color:#b00">Failed to load news: ${err.message}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadNewsDetails);