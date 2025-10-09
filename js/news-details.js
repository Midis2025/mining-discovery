const API_ROOT = "https://admins.miningdiscovery.com";

// --- Configuration ---
const CONFIG = {
    API_BASE_URL: `${API_ROOT}/api`,
    REQUEST_TIMEOUT: 8000, // 8 seconds
    SCROLL_THRESHOLD: 40, // Show popup at 40% scroll
    SUBSCRIPTION_KEY: 'mining_discovery_subscribed' // Key for checking subscription status
};

// --- Global State Variables for Popup ---
let popupShown = false;

// --- CRITICAL: Original Subscription Box Content Getter ---
let originalSubscribeBoxContent = null;
function getOriginalSubscribeBoxContent() {
    if (!originalSubscribeBoxContent) {
        const staticPopup = document.getElementById('popup2');
        if (staticPopup) {
            const staticBox = staticPopup.querySelector('.subscribe-box');
            if (staticBox) {
                // Store the original content
                originalSubscribeBoxContent = staticBox.innerHTML;
            }
        }
    }
    return originalSubscribeBoxContent;
}

// CRITICAL: Restores the original form content and re-attaches listeners
function resetSubscribeBox() {
    const subscribeBox = document.querySelector('#popup2 .subscribe-box');
    const content = getOriginalSubscribeBoxContent();

    if (subscribeBox && content && subscribeBox.innerHTML !== content) {
        // Restore content
        subscribeBox.innerHTML = content;
        
        // Re-attach listeners after restoring innerHTML
        const closeBtn = subscribeBox.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.onclick = window.closePopup;
        }
        const subscribeBtn = subscribeBox.querySelector('button[onclick="subscribe()"]');
        if (subscribeBtn) {
            subscribeBtn.onclick = window.subscribe;
        }
    }
}


// --- Subscription Popup Functions ---

function isUserSubscribed() {
    return sessionStorage.getItem(CONFIG.SUBSCRIPTION_KEY) === 'true';
}

function markUserSubscribed() {
    sessionStorage.setItem(CONFIG.SUBSCRIPTION_KEY, 'true');
}

function showSubscriptionPopup() {
    const popup = document.getElementById('popup2'); 
    
    if (popup && !popupShown && !isUserSubscribed()) {
        resetSubscribeBox(); // Ensure form is visible
        popup.style.display = 'flex'; 
        popupShown = true;
        document.body.style.overflow = 'hidden'; 
        console.log('Subscription Popup displayed.');
    }
}

function hideSubscriptionPopup() {
    const popup = document.getElementById('popup2');
    if (popup) {
        popup.style.display = 'none';
        document.body.style.overflow = 'auto'; 
    }
}

function showSubscriptionSuccess() {
    const subscribeBox = document.querySelector('#popup2 .subscribe-box');
    if (subscribeBox) {
        // Replace current content with success message and 'Continue Reading' button
        subscribeBox.innerHTML = `
            <span class="close-btn" onclick="window.closePopup()">&times;</span> 
            <div style="padding: 20px; text-align: center;">
                <div style="font-size: 48px; color: #4CAF50; margin-bottom: 15px;">✓</div>
                <h2 style="font-size: 22px; margin: 5px 0 8px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; 
                           background: linear-gradient(90deg, #ffda8b, #ae8a4c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    Subscription Successful!
                </h2>
                <p style="color: #ddd; margin: 15px 0;">Thank you! Click below to continue reading the article.</p>
                <button onclick="window.closePopup()" style="
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #ffd27d, #ae8a4c);
                    color: #111;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 10px;
                ">Continue Reading</button>
            </div>
        `;
    }
    
    setTimeout(() => {
        hideSubscriptionPopup();
    }, 2500);
}

function showSubscriptionError(message) {
    const subscribeBox = document.querySelector('#popup2 .subscribe-box');
    if (subscribeBox) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'subscription-error';
        errorDiv.style.cssText = 'color: #ff6b6b; background: rgba(255, 107, 107, 0.1); padding: 10px; border-radius: 8px; font-size: 13px; margin-top: 10px; border: 1px solid rgba(255, 107, 107, 0.3);';
        errorDiv.textContent = message;
        
        subscribeBox.querySelectorAll('.subscribe-warning, .subscription-error').forEach(el => el.remove());
        
        const formGroup = subscribeBox.querySelector('.form-group');
        if (formGroup) {
            formGroup.insertAdjacentElement('afterend', errorDiv);
        } else {
             subscribeBox.appendChild(errorDiv);
        }
       
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Make closePopup global for use by the dynamically rendered button and 'x'
window.closePopup = function() {
    if (isUserSubscribed()) {
        hideSubscriptionPopup();
        resetSubscribeBox(); 
    } else {
        const subscribeBox = document.querySelector('#popup2 .subscribe-box');
        if (subscribeBox) {
            const existingWarning = subscribeBox.querySelector('.subscribe-warning');
            if (!existingWarning) {
                const warning = document.createElement('p');
                warning.className = 'subscribe-warning';
                warning.style.cssText = 'color: #ffd27d; font-size: 13px; margin: 10px 0 0; animation: shake 0.5s;'; 
                warning.textContent = 'Please subscribe to continue reading';
                
                subscribeBox.querySelectorAll('.subscription-error').forEach(el => el.remove());
                
                const formGroup = subscribeBox.querySelector('.form-group');
                if (formGroup) {
                    formGroup.insertAdjacentElement('afterend', warning);
                } else {
                    subscribeBox.appendChild(warning);
                }

                if (!document.getElementById('shake-style')) {
                    const style = document.createElement('style');
                    style.id = 'shake-style';
                    style.textContent = `
                      @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                      }
                    `;
                    document.head.appendChild(style);
                }
                
                setTimeout(() => warning.remove(), 3000);
            }
        }
    }
};

// --- CRITICAL FIX: SUBSCRIBE FUNCTION with Enhanced Debugging ---
window.subscribe = async function() {
    const emailInput = document.querySelector('#popup2 #email');
    const email = emailInput ? emailInput.value.trim() : '';
    const subscribeButton = document.querySelector('#popup2 .subscribe-box button');
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showSubscriptionError('Please enter a valid email address');
        return;
    }
    
    if (subscribeButton) {
        subscribeButton.disabled = true;
        subscribeButton.textContent = 'Subscribing...';
        subscribeButton.style.opacity = '0.7';
    }

    // --- ENHANCED DEBUGGING ---
    const apiURL = `${CONFIG.API_BASE_URL}/subscribers`;
    const payload = JSON.stringify({ data: { email: email } });
    console.log('API Request URL:', apiURL);
    console.log('API Request Payload:', payload);
    // --- END ENHANCED DEBUGGING ---
    
    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload // Use the logged payload
        });
        
        console.log('API Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response Body:', errorText);
            
            let errorMessage = `Subscription failed (Status ${response.status}).`;
            try {
                // Attempt to parse JSON response for detailed Strapi error
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error?.message || errorData.message || errorMessage; 
            } catch (e) {
                // If parsing fails, the raw text or default message is used
                if (errorText.length > 0) {
                    // Include raw error if it's not empty, but keep it brief for user
                    errorMessage = `Subscription failed. Details: ${errorText.substring(0, 50)}...`;
                }
            }
            throw new Error(errorMessage);
        }
        
        // Success
        markUserSubscribed();
        showSubscriptionSuccess();
        
    } catch (error) {
        // Log the full error object for debugging (including network errors)
        console.error('Subscription error caught (Network or Logic):', error);
        
        if (subscribeButton) {
            subscribeButton.disabled = false;
            subscribeButton.textContent = 'Subscribe';
            subscribeButton.style.opacity = '1';
        }
        
        showSubscriptionError(
            // Use the captured error message from the try block, or a generic network failure message
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
    
    // CRITICAL STEP: Capture original content before it might be modified
    getOriginalSubscribeBoxContent(); 

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
            scrollCheckEnabled = false; // Only show once per session
        }
    }

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 100);
    }, { passive: true });

    setTimeout(handleScroll, 500);
}

// ---------------------------------------------------------------------------------
// The rest of your functions (loadNewsDetails, renderRichText, etc.) follow:
// ---------------------------------------------------------------------------------

// ✅ Convert Strapi Rich Text (JSON) to HTML
function renderRichText(node) {
    if (!node) return "";
    if (Array.isArray(node)) {
        return node.map(renderRichText).join("");
    }
    if (node.type === "paragraph") {
        const inner = renderRichText(node.children);
        return inner.trim() ? `<p>${inner}</p>` : "";
    }
    if (node.type && node.type.startsWith("heading")) {
        const level = node.level || 2;
        return `<h${level}>${renderRichText(node.children)}</h${level}>`;
    }
    if (node.type === "list") {
        const tag = node.format === "ordered" ? "ol" : "ul";
        return `<${tag}>${renderRichText(node.children)}</${tag}>`;
    }
    if (node.type === "list-item") {
        return `<li>${renderRichText(node.children)}</li>`;
    }
    if (node.text !== undefined) {
        let text = node.text;
        if (node.bold) text = `<strong>${text}</strong>`;
        if (node.italic) text = `<em>${text}</em>`;
        if (node.underline) text = `<u>${text}</u>`;
        return text;
    }
    if (node.children) {
        return renderRichText(node.children);
    }
    return "";
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get("id"),
        category: params.get("category")
    };
}

// ✅ Pick the best available image format
function getImageUrl(image) {
    if (!image) return "";
    
    if (Array.isArray(image)) {
        image = image[0];
    }
    
    if (image.data) {
        image = image.data;
        if (Array.isArray(image)) {
            image = image[0];
        }
    }
    
    if (image.attributes) {
        image = image.attributes;
    }
    
    let url = null;
    if (image.formats?.large?.url) url = image.formats.large.url;
    else if (image.formats?.medium?.url) url = image.formats.medium.url;
    else if (image.formats?.small?.url) url = image.formats.small.url;
    else if (image.formats?.thumbnail?.url) url = image.formats.thumbnail.url;
    else if (image.url) url = image.url;
    
    if (url && url.startsWith("/")) {
        url = API_ROOT + url;
    }
    
    return url || "";
}

// ✅ Format plain text description to HTML
function formatPlainDescription(description) {
    if (!description) return "";
    
    return description
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => {
            if (paragraph.startsWith('![')) {
                return '';
            }
            return `<p>${paragraph}</p>`;
        })
        .join('');
}

// ✅ Update topbar with news title
function updateTopbarTitle(title) {
    const topbarElement = document.querySelector('.topbar h1');
    if (topbarElement) {
        topbarElement.textContent = title || "News Article";
    }
    
    document.title = title ? `${title} - Mining Discovery` : "News - Mining Discovery";
}

// ✅ Load comments from memory (not localStorage)
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
        name: commentData.name,
        email: commentData.email,
        comment: commentData.comment,
        createdAt: new Date().toISOString()
    };
    
    comments.unshift(newComment);
    window.commentsStore[`comments_${newsId}`] = comments;
    return newComment;
}

// ✅ Render comments section
function renderCommentsSection(newsId) {
    return `
        <div class="comment-box">
            <h3>COMMENT <span id="comment-count"></h3>
            <p>Your email address will not be published. Required fields are marked *</p>

            <form id="commentForm" class="comment-form">
                <div class="input-row">
                    <input type="text" id="commentName" name="name" placeholder="Name*" required>
                    <input type="email" id="commentEmail" name="email" placeholder="Email*" required>
                </div>

                <textarea id="commentText" name="comment" placeholder="Add comment here..." required></textarea>
                <button type="submit" class="post-btn" id="submitComment">
                    <span class="btn-text">POST</span>
                    <span class="btn-loading" style="display: none;">POSTING...</span>
                </button>
                <div style="clear: both;"></div>

                <div class="checkbox">
                    <input type="checkbox" id="save-info">
                    <label for="save-info">Save my name and email in this browser for the next time I comment.</label>
                </div>
            </form>

            <div class="comment-header">
                <span>Most Recent</span>
            </div>

            <div id="comment-list">
                <div class="loading-comments">Loading comments...</div>
            </div>
            <button id="show-more" onclick="showAllComments()" style="display: none;">Show More</button>
        </div>
    `;
}

// Global variables for comment management
let allComments = [];
let visibleComments = 3;

// ✅ Load and display comments
function displayComments(newsId) {
    const commentList = document.getElementById('comment-list');
    const commentCount = document.getElementById('comment-count');
    
    try {
        allComments = loadComments(newsId);
        commentCount.textContent = allComments.length;
        renderComments();
        handleSaveInfo();
    } catch (error) {
        console.error('Error loading comments:', error);
        commentList.innerHTML = '<div class="error-message">Error loading comments.</div>';
        commentCount.textContent = '0';
    }
}

// ✅ Render individual comment
function renderComment(comment) {
    const now = new Date(comment.createdAt || Date.now());
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `
        <div class="comment">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <span class="username">${comment.name || 'Anonymous'}</span>
                <span class="date">${date} at ${time}</span>
            </div>
            <p>${comment.comment}</p>
        </div>
    `;
}

// ✅ Render comments (top 3 by default)
function renderComments(showAll = false) {
    const commentList = document.getElementById('comment-list');
    const showMoreBtn = document.getElementById('show-more');
    
    if (allComments.length === 0) {
        commentList.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
        showMoreBtn.style.display = 'none';
        return;
    }
    
    const commentsToShow = showAll ? allComments : allComments.slice(0, visibleComments);
    commentList.innerHTML = commentsToShow.map(renderComment).join('');
    
    if (allComments.length > visibleComments && !showAll) {
        showMoreBtn.style.display = 'block';
    } else {
        showMoreBtn.style.display = 'none';
    }
}

// ✅ Show all comments function
window.showAllComments = function() {
    renderComments(true);
    document.getElementById('show-more').style.display = 'none';
}

// ✅ Handle save info checkbox (using in-memory storage)
function handleSaveInfo() {
    const saveInfoCheckbox = document.getElementById('save-info');
    const nameInput = document.getElementById('commentName');
    const emailInput = document.getElementById('commentEmail');
    
    if (!window.savedUserInfo) {
        window.savedUserInfo = { name: '', email: '' };
    }
    
    if (window.savedUserInfo.name && window.savedUserInfo.email) {
        nameInput.value = window.savedUserInfo.name;
        emailInput.value = window.savedUserInfo.email;
        saveInfoCheckbox.checked = true;
    }
    
    saveInfoCheckbox.addEventListener('change', function() {
        if (this.checked) {
            window.savedUserInfo = {
                name: nameInput.value,
                email: emailInput.value
            };
        } else {
            window.savedUserInfo = { name: '', email: '' };
        }
    });
}

// ✅ Handle comment form submission
function handleCommentSubmission(newsId) {
    const form = document.getElementById('commentForm');
    const submitBtn = document.getElementById('submitComment');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        
        const formData = new FormData(form);
        const commentData = {
            name: formData.get('name').trim(),
            email: formData.get('email').trim(),
            comment: formData.get('comment').trim()
        };
        
        setTimeout(() => {
            try {
                const newComment = saveComment(newsId, commentData);
                allComments.unshift(newComment);
                document.getElementById('comment-count').textContent = allComments.length;
                renderComments();
                form.reset();
                
                const saveInfoCheckbox = document.getElementById('save-info');
                if (saveInfoCheckbox.checked) {
                    window.savedUserInfo = {
                        name: commentData.name,
                        email: commentData.email
                    };
                }
                
                handleSaveInfo();
                showMessage('Comment posted successfully!', 'success');
            } catch (error) {
                console.error('Error posting comment:', error);
                showMessage('Error posting comment. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
            }
        }, 500);
    });
}

// ✅ Show success/error messages
function showMessage(message, type) {
    const existingMessage = document.querySelector('.message-popup');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-popup ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// ✅ Back to Top functionality
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) {
        console.error('Back to top button not found');
        return;
    }
    
    console.log('Back to top button initialized');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ✅ Fetch all news sections from all categories for navigation
async function fetchAllNewsSections(category) {
    try {
        // Fetch all news categories with their sections
        const url = `${API_ROOT}/api/news-categories?populate[news_sections][fields][0]=id&populate[news_sections][fields][1]=documentId&populate[news_sections][fields][2]=title&populate[news_sections][fields][3]=publish_on&populate[news_sections][fields][4]=slug`;
        
        const res = await fetch(url);
        if (!res.ok) {
            console.error('Failed to fetch sections:', res.status);
            return [];
        }
        
        const data = await res.json();
        let allSections = [];
        
        // Loop through all categories and collect their news sections
        if (data?.data && Array.isArray(data.data)) {
            data.data.forEach(categoryItem => {
                let sections = categoryItem?.news_sections;
                
                // Handle Strapi v4 structure
                if (!Array.isArray(sections) && categoryItem?.attributes?.news_sections) {
                    const v4Data = categoryItem.attributes.news_sections.data || [];
                    sections = v4Data.map((x) => ({
                        id: x.id,
                        documentId: x.documentId,
                        ...x.attributes
                    }));
                }
                
                if (Array.isArray(sections)) {
                    allSections = allSections.concat(sections);
                }
            });
        }
        
        return allSections;
    } catch (error) {
        console.error('Error fetching news sections:', error);
        return [];
    }
}

// ✅ Initialize navigation buttons
async function initNavigation(currentId, category) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!prevBtn || !nextBtn) {
        console.error('Navigation buttons not found in DOM');
        return;
    }
    
    console.log('Navigation buttons found, initializing...');
    
    // Hide buttons initially
    prevBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
    
    const allSections = await fetchAllNewsSections(category);
    
    console.log('Fetched sections:', allSections.length);
    
    if (allSections.length === 0) {
        console.log('No sections found');
        return;
    }
    
    // Sort by publish date (newest first) to match the carousel order
    allSections.sort((a, b) => new Date(b.publish_on || 0) - new Date(a.publish_on || 0));
    
    const currentIndex = allSections.findIndex(section => 
        section.id?.toString() === currentId.toString() || 
        section.documentId?.toString() === currentId.toString()
    );
    
    console.log('Current index:', currentIndex, 'of', allSections.length);
    
    if (currentIndex === -1) {
        console.log('Current article not found in sections');
        return;
    }
    
    // Handle Previous Button
    if (currentIndex > 0) {
        prevBtn.classList.remove('hidden');
        console.log('Previous button shown');
        prevBtn.onclick = () => {
            const prevSection = allSections[currentIndex - 1];
            const articleId = prevSection.id || prevSection.documentId;
            const categoryParam = category ? `&category=${category}` : '';
            window.location.href = `news-details.html?id=${articleId}${categoryParam}`;
        };
    }
    
    // Handle Next Button
    if (currentIndex < allSections.length - 1) {
        nextBtn.classList.remove('hidden');
        console.log('Next button shown');
        nextBtn.onclick = () => {
            const nextSection = allSections[currentIndex + 1];
            const articleId = nextSection.id || nextSection.documentId;
            const categoryParam = category ? `&category=${category}` : '';
            window.location.href = `news-details.html?id=${articleId}${categoryParam}`;
        };
    }
}

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

        // Fetch all news categories with their sections
        const url = `${API_ROOT}/api/news-categories?populate[news_sections][populate]=*`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        // Search through all categories to find the article
        if (data?.data && Array.isArray(data.data)) {
            for (const categoryItem of data.data) {
                let sections = categoryItem?.news_sections;
                
                // Handle Strapi v4 structure
                if (!Array.isArray(sections) && categoryItem?.attributes?.news_sections) {
                    const v4Data = categoryItem.attributes.news_sections.data || [];
                    sections = v4Data.map((x) => ({
                        id: x.id,
                        documentId: x.documentId,
                        ...x.attributes
                    }));
                }
                
                // Search for the article in this category's sections
                if (Array.isArray(sections)) {
                    const found = sections.find(section => 
                        section.id?.toString() === id || 
                        section.documentId?.toString() === id
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

        updateTopbarTitle(newsSection.title);

        const publishDate = newsSection.publish_on ? 
            new Date(newsSection.publish_on).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : '';

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

        // --- Render Article and appended elements (Styles are included inline in HTML for simplicity) ---
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

                    ${descriptionHTML ? `
                        <div class="full-description">
                            ${descriptionHTML}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="nav-buttons">
                <button id="prevBtn" class="nav-btn prev-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                    <span>Previous</span>
                </button>
                <button id="nextBtn" class="nav-btn next-btn">
                    <span>Next</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>
            
            ${renderCommentsSection(id)}
            
            <button id="backToTop" class="back-to-top" title="Back to top">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
            </button>
            
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Pontano+Sans:wght@300;400;600;700&display=swap');
                
                * {
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Pontano Sans', sans-serif;
                    margin: 0;
                    padding: 0;
                }
            
                .news-detail {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Pontano Sans', sans-serif;
                }
                
                .news-header {
                    margin-bottom: 30px;
                }
                
                .category-tag {
                    display: inline-block;
                    background-color:#ae8a4c;
                    color: white;
                    padding: 5px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                
                .news-detail h1 {
                    font-weight: bold;
                    color: #333;
                    line-height: 1.2;
                    margin-bottom: 15px;
                    word-wrap: break-word;
                }
                
                .news-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
                
                .news-image {
                    margin-bottom: 30px;
                    text-align: center;
                }
                
                .news-image img {
                    width: 100%;
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                
                .news-body {
                    line-height: 1.6;
                    color: #333;
                }
                
                .short-description {
                    margin-bottom: 25px;
                }
                
                .short-description p {
                    font-size: clamp(1rem, 2vw, 1.1rem);
                    color: #333;
                    font-weight: 700;
                    line-height: 1.6;
                }
                
                .full-description p {
                    margin-bottom: 15px;
                    font-size: clamp(0.95rem, 1.5vw, 1rem);
                    text-align: justify;
                }
                
                .full-description h1,
                .full-description h2,
                .full-description h3,
                .full-description h4,
                .full-description h5,
                .full-description h6 {
                    margin-top: 25px;
                    margin-bottom: 15px;
                    color: #333;
                    word-wrap: break-word;
                }
                
                .full-description ul,
                .full-description ol {
                    margin: 15px 0;
                    padding-left: 25px;
                }
                
                .full-description li {
                    margin-bottom: 5px;
                }
                
                /* Comments Section */
                .comment-box {
                    background: #fff;
                    border-radius: 8px;
                    padding: 20px;
                    max-width: 100%;
                    margin: 50px auto 0;
                    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
                }

                .comment-box h3 {
                    color: #9a6b2f;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #9a6b2f;
                    display: inline-block;
                    padding-bottom: 5px;
                    font-family: 'Pontano Sans', sans-serif;
                    font-size: clamp(1rem, 2vw, 1.2rem);
                }

                .comment-box > p {
                    font-size: clamp(0.8rem, 1.5vw, 0.875rem);
                    margin-bottom: 15px;
                    color: #666;
                }

                .comment-form {
                    margin-bottom: 30px;
                }

                .input-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .input-row input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #c7a979;
                    border-radius: 20px;
                    outline: none;
                    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
                    font-family: 'Pontano Sans', sans-serif;
                }

                .input-row input:focus {
                    border-color: #9a6b2f;
                }

                #commentText {
                    width: 100%;
                    height: 100px;
                    padding: 10px;
                    border: 1px solid #c7a979;
                    border-radius: 8px;
                    resize: vertical;
                    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
                    margin-bottom: 10px;
                    font-family: 'Pontano Sans', sans-serif;
                    outline: none;
                }

                #commentText:focus {
                    border-color: #9a6b2f;
                }

                .post-btn {
                    background: #3a2b12;
                    color: #fff;
                    border: none;
                    padding: 8px 24px;
                    border-radius: 12px;
                    cursor: pointer;
                    float: right;
                    font-family: 'Pontano Sans', sans-serif;
                    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
                    transition: background-color 0.3s;
                }

                .post-btn:hover:not(:disabled) {
                    background: #2d1f0a;
                }

                .post-btn:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                }

                .checkbox {
                    margin: 20px 0;
                    font-size: clamp(0.8rem, 1.5vw, 0.875rem);
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                }

                .checkbox input[type="checkbox"] {
                    margin: 0;
                    margin-top: 3px;
                    flex-shrink: 0;
                }

                .checkbox label {
                    line-height: 1.4;
                }

                .comment-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: clamp(0.8rem, 1.5vw, 0.9rem);
                    margin-bottom: 15px;
                    color: #333;
                    font-weight: 600;
                }

                .comment {
                    border: 1px solid #e0d1b3;
                    border-radius: 10px;
                    padding: 15px;
                    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
                    line-height: 1.5;
                    margin-bottom: 10px;
                    background: #fefefe;
                }

                .username {
                    font-weight: bold;
                    color: #333;
                    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
                }

                .date {
                    font-size: clamp(0.75rem, 1.2vw, 0.85rem);
                    color: gray;
                }

                .comment p {
                    margin: 8px 0 0 0;
                    color: #555;
                    word-wrap: break-word;
                }

                #show-more {
                    display: none;
                    width: 100%;
                    max-width: 200px;
                    margin: 10px auto;
                    background: #9a6b2f;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-family: 'Pontano Sans', sans-serif;
                    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
                    transition: background-color 0.3s;
                }

                #show-more:hover {
                    background: #7a5525;
                }

                .loading-comments,
                .no-comments,
                .error-message {
                    text-align: center;
                    padding: 30px 20px;
                    color: #666;
                    font-style: italic;
                    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
                }

                .error-message {
                    color: #dc3545;
                }
                
                .message-popup {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    left: 20px;
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 15px 20px;
                    border-radius: 4px;
                    color: white;
                    font-weight: 600;
                    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                
                .message-popup.success {
                    background: #28a745;
                }
                
                .message-popup.error {
                    background: #dc3545;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                /* Back to Top Button */
                .back-to-top {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 50px;
                    height: 50px;
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
                
                .back-to-top.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                
                .back-to-top:hover {
                    background: #7a5525;
                    transform: translateY(-3px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                }
                
                .back-to-top:active {
                    transform: translateY(-1px);
                }
                
                /* Navigation Buttons */
                .nav-buttons {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    max-width: 800px;
                    margin: 40px auto 20px;
                    padding: 0 20px;
                }
                
                .nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: #3a2b12;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-family: 'Pontano Sans', sans-serif;
                    font-size: clamp(0.9rem, 1.5vw, 1rem);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .nav-btn.hidden {
                    display: none;
                }
                
                .nav-btn:hover {
                    background: #2d1f0a;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                
                .nav-btn:active {
                    transform: translateY(0);
                }
                
                .nav-btn svg {
                    flex-shrink: 0;
                }
                
                .prev-btn {
                    margin-right: auto;
                }
                
                .next-btn {
                    margin-left: auto;
                }
                
                /* Tablet Responsive */
                @media (max-width: 768px) {
                    .news-detail,
                    .comment-box {
                        padding: 15px;
                    }
                    
                    .news-detail h1 {
                        margin-bottom: 12px;
                    }
                    
                    .news-meta {
                        gap: 10px;
                    }
                    
                    .input-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    
                    .post-btn {
                        float: none;
                        width: 100%;
                        margin-top: 10px;
                    }
                    
                    .full-description p {
                        text-align: left;
                    }
                }
                
                /* Mobile Responsive */
                @media (max-width: 480px) {
                    .news-detail,
                    .comment-box {
                        padding: 12px;
                    }
                    
                    .category-tag {
                        font-size: 11px;
                        padding: 4px 10px;
                    }
                    
                    .news-header {
                        margin-bottom: 20px;
                    }
                    
                    .news-image {
                        margin-bottom: 20px;
                    }
                    
                    .short-description {
                        margin-bottom: 20px;
                    }
                    
                    .comment-box {
                        margin-top: 30px;
                    }
                    
                    #commentText {
                        min-height: 80px;
                    }
                    
                    .checkbox {
                        align-items: flex-start;
                    }
                    
                    .message-popup {
                        top: 10px;
                        left: 10px;
                        right: 10px;
                    }
                    
                    .back-to-top {
                        bottom: 20px;
                        right: 20px;
                        width: 45px;
                        height: 45px;
                    }
                    
                    .nav-buttons {
                        padding: 0 12px;
                        gap: 10px;
                    }
                    
                    .nav-btn {
                        padding: 10px 16px;
                        font-size: 0.85rem;
                    }
                    
                    .nav-btn span {
                        display: none;
                    }
                    
                    .nav-btn svg {
                        width: 24px;
                        height: 24px;
                    }
                }
                
                /* Very small screens */
                @media (max-width: 360px) {
                    .news-detail,
                    .comment-box {
                        padding: 10px;
                    }
                    
                    .input-row input,
                    #commentText {
                        font-size: 14px;
                    }
                }
            </style>
        `;
        
        // --- Initialization Sequence ---
        
        // Wait for DOM to be ready before attaching handlers
        setTimeout(async () => {
            await displayComments(id);
            handleCommentSubmission(id);
            
            // Initialize other DOM-dependent features
            initBackToTop();
            await initNavigation(id, category);
            
            // Initialize the SCROLL POPUP handler AFTER content is loaded
            if (!isUserSubscribed()) {
                initializeScrollPopup();
            } else {
                console.log('User already subscribed. Popup functionality disabled.');
            }
            
        }, 100);
        
    } catch (err) {
        console.error('Error loading news details:', err);
        updateTopbarTitle("Error Loading News");
        document.getElementById("newsDetails").innerHTML = `<p style="color:#b00">Failed to load news: ${err.message}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadNewsDetails);