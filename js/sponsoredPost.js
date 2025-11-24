async function loadSponsoredPosts() {
  try {
    const url =
      "https://admins.miningdiscovery.com/api/news-categories" +
      "?filters[slug][$eq]=sponsored-post&populate[news_sections][populate]=*";

    const res = await fetch(url);
    const data = await res.json();

    // Get posts and sort them by publish_on date (latest first)
    const posts = (data?.data?.[0]?.news_sections || []).sort(
      (a, b) => new Date(b.publish_on) - new Date(a.publish_on)
    );

    const topPostContainer = document.getElementById("sponsoredTop");
    const gridContainer = document.getElementById("sponsoredGrid");

    if (posts.length === 0) {
      topPostContainer.innerHTML = "<p>No sponsored posts available</p>";
      gridContainer.innerHTML = "";
      return;
    }

    // 🟢 Top Post - fully clickable
    const top = posts[0];
    topPostContainer.innerHTML = `
      <div class="sec1 clickable-post" data-url=".//page/article/${top.id}?category=sponsored-post" style="cursor: pointer;">
        <img src="${top.image?.url || top.image?.formats?.small?.url || './image/placeholder.jpg'}" />
      </div>
      <div class="sec2 clickable-post" data-url=".//page/article/${top.id}?category=sponsored-post" style="cursor: pointer;">
        <span class="tag">SPONSORED POST</span>
        <p class="post-text">${top.short_description || ''}</p>
        <a href=".//page/article/${top.id}?category=sponsored-post">
          <button class="btn-more">More → </button>
        </a>
      </div>
    `;

    // 🟢 Grid Cards - next 5 posts
    gridContainer.innerHTML = posts
      .slice(1, 6)
      .map(
        (post) => `
          <div class="card1 clickable-post" data-url=".//page/article/${post.id}?category=sponsored-post" style="cursor: pointer;">
            <img src="${post.image?.url || post.image?.formats?.small?.url || './image/placeholder.jpg'}" />
            <span class="tag-post">SPONSORED POST</span>
            <h4>${post.title}</h4>
            <a href=".//page/article/${post.id}?category=sponsored-post">
              <button class="btn-more">More →</button>
            </a>
          </div>
        `
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
    console.error("Error loading sponsored posts", err);
  }
}

document.addEventListener("DOMContentLoaded", loadSponsoredPosts);