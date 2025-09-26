const API_ROOT = "https://admins.miningdiscovery.com";

// ✅ Convert Strapi Rich Text (JSON) to HTML
function renderRichText(node) {
  if (!node) return "";

  if (Array.isArray(node)) {
    return node.map(renderRichText).join("");
  }

  // Paragraphs
  if (node.type === "paragraph") {
    const inner = renderRichText(node.children);
    return inner.trim() ? `<p>${inner}</p>` : "";
  }

  // Headings
  if (node.type && node.type.startsWith("heading")) {
    const level = node.level || 2;
    return `<h${level}>${renderRichText(node.children)}</h${level}>`;
  }

  // Lists
  if (node.type === "list") {
    const tag = node.format === "ordered" ? "ol" : "ul";
    return `<${tag}>${renderRichText(node.children)}</${tag}>`;
  }

  if (node.type === "list-item") {
    return `<li>${renderRichText(node.children)}</li>`;
  }

  // Text
  if (node.text !== undefined) {
    let text = node.text;
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    return text;
  }

  // Children fallback
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
  if (image.formats?.large?.url) return image.formats.large.url;
  if (image.formats?.medium?.url) return image.formats.medium.url;
  if (image.formats?.small?.url) return image.formats.small.url;
  if (image.formats?.thumbnail?.url) return image.formats.thumbnail.url;
  if (image.url) return image.url;
  return "";
}

// ✅ Format plain text description to HTML
function formatPlainDescription(description) {
  if (!description) return "";
  
  return description
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => {
      // Skip image markdown lines
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
  
  // Also update the document title for better SEO/browser tab
  document.title = title ? `${title} - Mining Discovery` : "News - Mining Discovery";
}

// ✅ Load comments from localStorage
function loadComments(newsId) {
  const savedComments = localStorage.getItem(`comments_${newsId}`);
  return savedComments ? JSON.parse(savedComments) : [];
}

// ✅ Save comment to localStorage
function saveComment(newsId, commentData) {
  const comments = loadComments(newsId);
  const newComment = {
    id: Date.now(),
    name: commentData.name,
    email: commentData.email,
    comment: commentData.comment,
    createdAt: new Date().toISOString()
  };
  
  comments.unshift(newComment); // Add to beginning
  localStorage.setItem(`comments_${newsId}`, JSON.stringify(comments));
  return newComment;
}

// ✅ Render comments section
function renderCommentsSection(newsId) {
  return `
    <div class="comment-box">
      <h3>COMMENT (<span id="comment-count">0</span>)</h3>
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

// ✅ Render individual comment
function renderComment(comment) {
  const now = new Date(comment.createdAt || Date.now());
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return `
    <div class="comment">
      <div style="display: flex; justify-content: space-between;">
        <span class="username">${comment.name || 'Anonymous'}</span>
        <span class="date">${date} at ${time}</span>
      </div>
      <p>${comment.comment}</p>
    </div>
  `;
}

// Global variables for comment management
let allComments = [];
let visibleComments = 3; // Show only top 3 comments initially

// ✅ Load and display comments
function displayComments(newsId) {
  const commentList = document.getElementById('comment-list');
  const commentCount = document.getElementById('comment-count');
  
  try {
    allComments = loadComments(newsId);
    
    // Update count
    commentCount.textContent = allComments.length;
    
    // Display comments
    renderComments();
    
    // Handle save info checkbox
    handleSaveInfo();
    
  } catch (error) {
    console.error('Error loading comments:', error);
    commentList.innerHTML = '<div class="error-message">Error loading comments.</div>';
    commentCount.textContent = '0';
  }
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
  
  // Show/Hide "Show More" button
  if (allComments.length > visibleComments && !showAll) {
    showMoreBtn.style.display = 'block';
  } else {
    showMoreBtn.style.display = 'none';
  }
}

// ✅ Show all comments function (called from button)
function showAllComments() {
  renderComments(true);
  document.getElementById('show-more').style.display = 'none';
}

// ✅ Handle save info checkbox
function handleSaveInfo() {
  const saveInfoCheckbox = document.getElementById('save-info');
  const nameInput = document.getElementById('commentName');
  const emailInput = document.getElementById('commentEmail');
  
  // Load saved info
  const savedName = localStorage.getItem('commentName');
  const savedEmail = localStorage.getItem('commentEmail');
  
  if (savedName && savedEmail) {
    nameInput.value = savedName;
    emailInput.value = savedEmail;
    saveInfoCheckbox.checked = true;
  }
  
  // Save info when checkbox changes
  saveInfoCheckbox.addEventListener('change', function() {
    if (this.checked) {
      localStorage.setItem('commentName', nameInput.value);
      localStorage.setItem('commentEmail', emailInput.value);
    } else {
      localStorage.removeItem('commentName');
      localStorage.removeItem('commentEmail');
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
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    const formData = new FormData(form);
    const commentData = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      comment: formData.get('comment').trim()
    };
    
    // Simulate a short delay for better UX
    setTimeout(() => {
      try {
        const newComment = saveComment(newsId, commentData);
        
        // Add the new comment to the beginning of allComments array
        allComments.unshift(newComment);
        
        // Update comment count
        document.getElementById('comment-count').textContent = allComments.length;
        
        // Re-render comments
        renderComments();
        
        // Reset form
        form.reset();
        
        // Handle save info
        const saveInfoCheckbox = document.getElementById('save-info');
        if (saveInfoCheckbox.checked) {
          localStorage.setItem('commentName', commentData.name);
          localStorage.setItem('commentEmail', commentData.email);
        }
        
        // Restore saved info if checkbox was checked
        handleSaveInfo();
        
        // Show success message
        showMessage('Comment posted successfully!', 'success');
        
      } catch (error) {
        console.error('Error posting comment:', error);
        showMessage('Error posting comment. Please try again.', 'error');
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
      }
    }, 500); // Small delay for better UX
  });
}

// ✅ Show success/error messages
function showMessage(message, type) {
  // Remove existing messages
  const existingMessage = document.querySelector('.message-popup');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-popup ${type}`;
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

async function loadNewsDetails() {
  const { id, category } = getQueryParams();
  
  if (!id) {
    document.getElementById("newsDetails").innerHTML = `<p>Invalid news item.</p>`;
    updateTopbarTitle("Invalid News Item");
    return;
  }

  try {
    let newsSection = null;

    // If it's a sponsored post, fetch from sponsored posts API
    if (category === 'sponsored-post') {
      const res = await fetch(`${API_ROOT}/api/news-categories?filters[slug][$eq]=sponsored-post&populate[news_sections][populate]=*`);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const posts = data?.data?.[0]?.news_sections || [];
      newsSection = posts.find(post => post.id.toString() === id);
      
      if (!newsSection) {
        throw new Error('Sponsored post not found');
      }
    } else {
      // Try direct news section fetch for other categories
      let res = await fetch(`${API_ROOT}/api/news-sections/${id}?populate=image`);
      
      if (!res.ok) {
        // Fallback to news endpoint
        res = await fetch(`${API_ROOT}/api/news?populate=news_sections.image`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const newsData = await res.json();
        const newsItem = newsData.data[0]; 
        newsSection = newsItem.news_sections.find(section => section.id == id);
        
        if (!newsSection) {
          throw new Error('News section not found');
        }
      } else {
        const data = await res.json();
        newsSection = data.data;
      }
    }

    console.log('News section data:', newsSection);

    // ✅ Update topbar title with actual news title
    updateTopbarTitle(newsSection.title);

    // Format publish date
    const publishDate = newsSection.publish_on ? 
      new Date(newsSection.publish_on).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '';

    // ✅ Get best image URL
    const imageUrl = getImageUrl(newsSection.image);

    // ✅ Parse description - handle both JSON and plain text
    let descriptionHTML = "";
    if (newsSection.description) {
      try {
        // Try to parse as JSON first (rich text)
        const parsed = JSON.parse(newsSection.description);
        descriptionHTML = renderRichText(parsed);
      } catch (e) {
        // If JSON parse fails, treat as plain text
        descriptionHTML = formatPlainDescription(newsSection.description);
      }
    }

    // Determine category display name
    const categoryDisplay = category ? category.toUpperCase().replace('-', ' ') : 'NEWS';

    // Render HTML with comments section
    document.getElementById("newsDetails").innerHTML = `
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
              <p><strong>${newsSection.short_description}</strong></p>
            </div>
          ` : ''}

          ${descriptionHTML ? `
            <div class="full-description">
              ${descriptionHTML}
            </div>
          ` : ''}
        </div>
      </div>
      
      ${renderCommentsSection(id)}
      
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Pontano+Sans:wght@300;400;600;700&display=swap');
        
        body {
          font-family: 'Pontano Sans', sans-serif;
        }
      
      <style>
        .news-detail {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .news-header {
          margin-bottom: 30px;
        }
        
        .category-tag {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .news-detail h1 {
          font-size: 2.5em;
          font-weight: bold;
          color: #333;
          line-height: 1.2;
          margin-bottom: 15px;
        }
        
        .news-meta {
          display: flex;
          gap: 20px;
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
          max-width: 600px;
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
          font-size: 1.1em;
          color: #555;
        }
        
        .full-description p {
          margin-bottom: 15px;
          font-size: 16px;
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
        }
        
        .full-description ul,
        .full-description ol {
          margin: 15px 0;
          padding-left: 25px;
        }
        
        .full-description li {
          margin-bottom: 5px;
        }
        
        /* Comments Section Styles */
        .comment-box {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          max-width: 700px;
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
        }

        .comment-box p {
          font-size: 14px;
          margin-bottom: 15px;
          color: #666;
        }

        .comment-form {
          margin-bottom: 30px;
        }

        .input-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .input-row input {
          flex: 1;
          padding: 10px;
          border: 1px solid #c7a979;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
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
          resize: none;
          font-size: 14px;
          margin-bottom: 10px;
          font-family: 'Pontano Sans', sans-serif;
          box-sizing: border-box;
          outline: none;
        }

        #commentText:focus {
          border-color: #9a6b2f;
        }

        .post-btn {
          background: #3a2b12;
          color: #fff;
          border: none;
          padding: 6px 20px;
          border-radius: 12px;
          cursor: pointer;
          float: right;
          font-family: 'Pontano Sans', sans-serif;
          font-size: 14px;
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
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox input[type="checkbox"] {
          margin: 0;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 15px;
          color: #333;
          font-weight: 600;
        }

        .comment {
          border: 1px solid #e0d1b3;
          border-radius: 10px;
          padding: 15px;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 10px;
          background: #fefefe;
        }

        .username {
          font-weight: bold;
          color: #333;
        }

        .date {
          font-size: 12px;
          color: gray;
        }

        .comment p {
          margin: 8px 0 0 0;
          color: #555;
        }

        #show-more {
          display: none;
          margin: 10px auto;
          background: #9a6b2f;
          color: #fff;
          border: none;
          padding: 8px 20px;
          border-radius: 12px;
          cursor: pointer;
          text-align: center;
          font-family: 'Pontano Sans', sans-serif;
          font-size: 14px;
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
        }

        .error-message {
          color: #dc3545;
        }
        
        .message-popup {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 4px;
          color: white;
          font-weight: 600;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }
        
        .message-popup.success {
          background: #28a745;
        }
        
        .message-popup.error {
          background: #dc3545;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .news-detail,
          .comments-section {
            padding: 15px;
          }
          
          .news-detail h1 {
            font-size: 2em;
          }
          
          .news-meta {
            flex-direction: column;
            gap: 10px;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .comments-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .message-popup {
            left: 20px;
            right: 20px;
            top: 10px;
          }
        }
      </style>
    `;
    
    // Initialize comments functionality
    await displayComments(id);
    handleCommentSubmission(id);
    
  } catch (err) {
    console.error('Error loading news details:', err);
    updateTopbarTitle("Error Loading News");
    document.getElementById("newsDetails").innerHTML = `<p style="color:#b00">Failed to load news: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadNewsDetails);