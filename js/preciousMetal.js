async function loadPreciousMetalNews() {
  const preciousMetalNewsContainer = document.getElementById("preciousMetalNews");
  
  if (!preciousMetalNewsContainer) return;

  // Show loading state
  preciousMetalNewsContainer.innerHTML = `<p style="color:#999; text-align:center;">Loading precious metals news...</p>`;

  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=precious-metals&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][fields][3]=short_description&populate[news_sections][populate][image]=true";

  const fetchWithRetry = async (urlToFetch, retries = 3, timeout = 8000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const res = await fetch(urlToFetch, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        if (!data?.data?.[0]?.news_sections) {
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
    const payload = await fetchWithRetry(url);
    let sections = payload?.data?.[0]?.news_sections;

    if (!sections || sections.length === 0) {
      throw new Error("No precious metals news sections found");
    }

    const sortedSections = sections.sort((a, b) => {
      const dateA = new Date(a.publish_on || 0).getTime();
      const dateB = new Date(b.publish_on || 0).getTime();
      return dateB - dateA; // descending order (newest first)
    });

    const view = sortedSections.slice(0, 1).map((item) => {
      const title = item.title || "Untitled";
      const author = item.author || "Unknown";
      const date = formatDate(item.publish_on);
      const docId = item.documentId || item.id || "";
      const imageUrl = item.image?.url || "./image/slider2.png";
      const description = item.short_description || "";

      return `
        <img src="${imageUrl}" alt="card" loading="lazy" />
        <div class="world-news">
          <p>
            ${docId 
              ? `<a href="/page/article/${docId}" class="precious-link">${escapeHtml(title)}</a>` 
              : escapeHtml(title)}
          </p>
          ${description ? `<p class="description">${escapeHtml(description)}</p>` : ""}
          <small>${date}</small>
          <div class="author">${escapeHtml(author)}</div>
          ${
            docId
              ? `<a href="/page/article/${docId}"></a>`
              : ""
          }
        </div>
      `;
    });

    preciousMetalNewsContainer.innerHTML = view.join("");
  } catch (err) {
    console.error("Error loading precious metals news:", err);
    preciousMetalNewsContainer.innerHTML = `
      <div style="padding: 15px; text-align: center;">
        <p style="color: #b00; margin-bottom: 10px;">Failed to load precious metals news.</p>
        <button onclick="loadPreciousMetalNews()" style="
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