async function loadLatestNews() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=latest-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][fields][3]=short_description&populate[news_sections][populate][image]=true";

  const latestNewsContainer = document.getElementById("latestNews");
  const mainCardContainer = document.getElementById("mainCard"); // For the featured main card
 
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    // Try Strapi v5 (flat)
    let sections = payload?.data?.[0]?.news_sections;

    // Fallback to Strapi v4 style if needed
    if (!Array.isArray(sections)) {
      const v4Data =
        payload?.data?.[0]?.attributes?.news_sections?.data || [];
      sections = v4Data.map((x) => x.attributes);
    }

    if (!sections || !sections.length) {
      latestNewsContainer.innerHTML = "<p>No news found.</p>";
      if (mainCardContainer) {
        mainCardContainer.innerHTML = "<p>No featured news available.</p>";
      }
      return;
    }

    // 🔥 Sort by publish_on (newest first) before slicing
    const sortedSections = sections.sort((a, b) => {
      const dateA = new Date(a.publish_on || 0).getTime();
      const dateB = new Date(b.publish_on || 0).getTime();
      return dateB - dateA; // descending order (newest first)
    });

    // 🆕 Render the first item (index 0) as main card
    if (mainCardContainer && sortedSections.length > 0) {
      const featuredItem = sortedSections[0];
      const title = featuredItem.title || "Untitled";
      const rawAuthor = featuredItem.author || "";
      const author = rawAuthor.trim().replace(/^by:\s*/i, "") || "ARRAS MINERALS";
      const description = featuredItem.short_description || "";
      const docId = featuredItem.documentId || "";

      // Get image URL
      const imageUrl = featuredItem.image?.data?.attributes?.url || 
                      featuredItem.image?.url || 
                      "./image/Your paragraph text (14).png";
      
      const absoluteImageUrl = imageUrl.startsWith('http') ? 
                               imageUrl : 
                               `https://acceptable-desire-0cca5bb827.strapiapp.com${imageUrl}`;

      const dateStr = featuredItem.publish_on
        ? new Date(featuredItem.publish_on).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : "";

      mainCardContainer.innerHTML = `
        <div>
          <img src="${absoluteImageUrl}" alt="${title}" />
          <div class="main-card-content">
            <h2>
              ${docId 
                ? `<a href="news-details.html?id=${docId}" class="main-title-link">${title}</a>` 
                : title}
            </h2>
            <p>${description}</p>
            ${docId ? `<a href="news-details.html?id=${docId}" class="read-more-main">Read Full Article</a>` : ''}
            <p class="date"><span>${dateStr}</span> By: ${author}</p>
          </div>
        </div>
      `;
    }

    // 🔄 Render remaining items (1-5) as latest news list
    const remainingItems = sortedSections.slice(1, 5); // Skip first item, take next 4
    
    const html = remainingItems
      .map((item) => {
        const title = item.title || "Untitled";
        const rawAuthor = item.author || "";
        const author = rawAuthor.trim().replace(/^by:\s*/i, "") || null;
        const docId = item.documentId || "";

        const dateStr = item.publish_on
          ? new Date(item.publish_on).toLocaleDateString()
          : "";

        return `
          <div class="latest-item">
            ${docId 
              ? `<a href="news-details.html?id=${docId}" class="latest-title-link">${title}</a>` 
              : title}
            <p class="date">
              ${dateStr}${author ? ` <span class="author">By: ${author}</span>` : ""}
            </p>
          </div>
        `;
      })
      .join("");

    latestNewsContainer.innerHTML = html; // set once ✅
  } catch (err) {
    console.error(err);
    latestNewsContainer.innerHTML =
      `<p style="color:#b00">Failed to load news.</p>`;
    if (mainCardContainer) {
      mainCardContainer.innerHTML =
        `<p style="color:#b00">Failed to load featured news.</p>`;
    }
  }
}
