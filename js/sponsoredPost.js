async function loadSponsoredPosts() {
  const topPostContainer = document.getElementById("sponsoredTop");
  const gridContainer = document.getElementById("sponsoredGrid");

  if (!topPostContainer || !gridContainer) return;

  // Show loading state
  topPostContainer.innerHTML = "<p style=\"color:#999; text-align:center;\">Loading sponsored posts...</p>";
  gridContainer.innerHTML = "<p style=\"color:#999; text-align:center;\">Loading...</p>";

  const fetchWithRetry = async (urlToFetch, retries = 3, timeout = 10000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const res = await fetch(urlToFetch, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        if (!data?.data?.[0]) {
          throw new Error("Invalid response structure");
        }
        
        return data;
      } catch (err) {
        console.warn(`Attempt ${attempt + 1} failed:`, err.message);
        if (attempt === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
      }
    }
  };

  try {
    const url =
      "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories" +
      "?filters[slug][$eq]=sponsored-post&populate[news_sections][populate]=*";

    const data = await fetchWithRetry(url);

    // Get posts and sort them by publish_on date (latest first)
    const posts = (data?.data?.[0]?.news_sections || [])
      .filter(post => post && post.title) // Filter out empty/invalid posts
      .sort((a, b) => new Date(b.publish_on || 0) - new Date(a.publish_on || 0));

    if (posts.length === 0) {
      topPostContainer.innerHTML = "<p style=\"color:#999;\">No sponsored posts available</p>";
      gridContainer.innerHTML = "";
      return;
    }

    // 🟢 Top Post - fully clickable
    const top = posts[0];
    const topDocId = top.documentId || top.id || "";
    const topImageUrl = top.image?.url || top.image?.formats?.small?.url || './image/placeholder.jpg';

    topPostContainer.innerHTML = `
      <div class="sec1 clickable-post" data-url="/page/article/${topDocId}?category=sponsored-post" style="cursor: pointer;">
        <img src="${topImageUrl}" alt="Sponsored Post" loading="lazy" />
      </div>
      <div class="sec2 clickable-post" data-url="/page/article/${topDocId}?category=sponsored-post" style="cursor: pointer;">
        <span class="tag">SPONSORED POST</span>
        <p class="post-text">${escapeHtml(top.short_description || top.title || '')}</p>
        <a href="/page/article/${topDocId}?category=sponsored-post">
          <button class="btn-more">More → </button>
        </a>
      </div>
    `;

    // 🟢 Grid Cards - next 5 posts
    gridContainer.innerHTML = posts
      .slice(1, 6)
      .map(
        (post) => {
          const docId = post.documentId || post.id || "";
          const imageUrl = post.image?.url || post.image?.formats?.small?.url || './image/placeholder.jpg';
          return `
            <div class="card1 clickable-post" data-url="/page/article/${docId}?category=sponsored-post" style="cursor: pointer;">
              <img src="${imageUrl}" alt="${escapeHtml(post.title)}" loading="lazy" />
              <span class="tag-post">SPONSORED POST</span>
              <h4>${escapeHtml(post.title)}</h4>
              <a href="/page/article/${docId}?category=sponsored-post">
                <button class="btn-more">More →</button>
              </a>
            </div>
          `;
        }
      )
      .join("");

    // 🟢 Add click event listeners to all clickable posts
    document.querySelectorAll('.clickable-post').forEach(element => {
      element.addEventListener('click', function(e) {
        if (
          e.target.tagName === 'BUTTON' ||
          e.target.tagName === 'A' ||
          e.target.closest('button') ||
          e.target.closest('a')
        ) {
          return;
        }
        const url = this.getAttribute('data-url');
        if (url) {
          window.location.href = url;
        }
      });
    });

  } catch (err) {
    console.error("Error loading sponsored posts:", err);
    const errorMessage = `
      <div style="padding: 15px; text-align: center;">
        <p style="color: #b00; margin-bottom: 10px;">Failed to load sponsored posts. Please try again later.</p>
        <button onclick="loadSponsoredPosts()" style="
          background: #ae8a4c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
        ">Retry</button>
      </div>
    `;
    if (topPostContainer) topPostContainer.innerHTML = errorMessage;
    if (gridContainer) gridContainer.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", loadSponsoredPosts);