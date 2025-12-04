async function loadCopperNews() {
  const copperNewsContainer = document.getElementById("copperNews");
  if (!copperNewsContainer) return;

  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=copper-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][fields][3]=short_description&populate[news_sections][populate][image]=true";

  const fetchWithRetry = async (urlToFetch, retries = 3, timeout = 10000) => {
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
        console.warn(`Attempt ${attempt + 1} failed for copper news:`, err.message);
        if (attempt === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  };

  try {
    const payload = await fetchWithRetry(url);
    let sections = payload?.data?.[0]?.news_sections;

    if (!sections || sections.length === 0) {
      throw new Error("No copper news sections found");
    }

    // Sort by publish date (newest first)
    const sortedSections = sections.sort((a, b) => {
      const dateA = new Date(a.publish_on || 0).getTime();
      const dateB = new Date(b.publish_on || 0).getTime();
      return dateB - dateA;
    });

    // Take top 5
    const view = sortedSections.slice(0, 5).map((item) => {
      const title = item.title || "Untitled";
      const author = item.author || "Unknown";
      const date = formatDate(item.publish_on);
      const docId = item.documentId || item.id;

      if (!docId) {
        return `
          <div class="right-box">
            <h4>${escapeHtml(title)}</h4>
            <span>${date}  |  ${escapeHtml(author)}</span>
          </div>`;
      }

      return `
        <div class="right-box">
          <h4>
            <a href="/page/article/${docId}" class="copper-link">${escapeHtml(title)}</a>
          </h4>
          <span>${date}  |  ${escapeHtml(author)}</span>
        </div>`;
    });

    copperNewsContainer.innerHTML = view.join("");
  } catch (err) {
    console.error("Error loading copper news:", err);
    copperNewsContainer.innerHTML = `
      <div style="padding: 15px; text-align: center;">
        <p style="color: #b00; margin-bottom: 10px;">Failed to load copper news.</p>
        <button onclick="loadCopperNews()" style="
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
