async function loadPopularNews() {
  const container = document.getElementById("carousel");
  if (!container) return;

  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=silver-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][populate][image]=true";

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
        console.warn(`Attempt ${attempt + 1} failed for silver news:`, err.message);
        if (attempt === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  };

  try {
    const payload = await fetchWithRetry(url);

    // Strapi v5 (flat) or v4 (attributes) shape
    let sections = payload?.data?.[0]?.news_sections;
    if (!Array.isArray(sections)) {
      const v4Data = payload?.data?.[0]?.attributes?.news_sections?.data || [];
      sections = v4Data.map((x) => x.attributes);
    }

    if (!sections?.length) {
      container.innerHTML = `<p style="color:#999; text-align:center;">No silver news available.</p>`;
      return;
    }

    // newest first
    sections.sort((a, b) => new Date(b.publish_on || 0) - new Date(a.publish_on || 0));

    // Build top 4
    const cardsHtml = sections.slice(0, 4).map((item) => {
      const title  = item.title || "Untitled";
      const author = (item.author || "").trim().replace(/^by:\s*/i, "");
      const date   = formatDate(item.publish_on);
      const imgUrl = getImageUrl(item) || "./image/slider2.png";
      
      // Get the article ID (try both v4 and v5 Strapi formats)
      const articleId = item.documentId || item.id;
      if (!articleId) {
        return `
          <div class="team-card">
            <img src="${imgUrl}" alt="card" loading="lazy" />
            <p>${escapeHtml(title)}</p>
            <div class="meta">
              <small>${date}</small>
              <small>${author ? ` ${escapeHtml(author)}` : ""}</small>
            </div>
          </div>
        `;
      }

      return `
        <a href="/page/article/${articleId}" class="team-card-link" style="text-decoration: none; color: inherit; display: block;">
          <div class="team-card">
            <img src="${imgUrl}" alt="card" loading="lazy" />
            <p>${escapeHtml(title)}</p>
            <div class="meta">
              <small>${date}</small>
              <small>${author ? ` ${escapeHtml(author)}` : ""}</small>
            </div>
          </div>
        </a>
      `;
    }).join("");

    container.innerHTML = cardsHtml;

  } catch (err) {
    console.error("Error loading silver news:", err);
    container.innerHTML = `
      <div style="padding: 15px; text-align: center;">
        <p style="color: #b00; margin-bottom: 10px;">Failed to load silver news.</p>
        <button onclick="loadPopularNews()" style="
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
  }
}

/* ---------- helpers ---------- */
function getImageUrl(item) {
  // Handle common Strapi shapes (v5/v4, single/array)
  let m = item?.image ?? item?.cover ?? item?.thumbnail ?? null;
  if (!m) return null;
  if (Array.isArray(m)) m = m[0] || null;

  let url = m?.url || m?.data?.attributes?.url || m?.formats?.thumbnail?.url || null;
  if (url && url.startsWith("/")) {
    url = "https://acceptable-desire-0cca5bb827.strapiapp.com" + url;
  }
  return url;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.getDate();
  const ord = (n) => {
    const s = ["th","st","nd","rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  const month = d.toLocaleString("en-GB", { month: "long" });
  const year  = d.getFullYear();
  return `${day}${ord(day)} ${month} ${year}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'" :'&#39;'}[c]
  ));
}