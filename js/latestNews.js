async function loadLatestNews() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=latest-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][fields][3]=short_description&populate[news_sections][populate][image]=true";

  const latestNewsContainer = document.getElementById("latestNews");
  const mainCardContainer = document.getElementById("mainCard"); // For the featured main card

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    let sections = payload?.data?.[0]?.news_sections;

    // Fallback for Strapi v4
    if (!Array.isArray(sections)) {
      const v4Data = payload?.data?.[0]?.attributes?.news_sections?.data || [];
      sections = v4Data.map((x) => x.attributes);
    }

    if (!sections || !sections.length) {
      latestNewsContainer.innerHTML = "<p>No news found.</p>";
      if (mainCardContainer) mainCardContainer.innerHTML = "<p>No featured news available.</p>";
      return;
    }

    // Sort newest first
    const sortedSections = sections.sort((a, b) => new Date(b.publish_on || 0) - new Date(a.publish_on || 0));

    const topEight = sortedSections.slice(0, 8);

    // Render featured main card
    if (mainCardContainer && topEight.length > 0) {
      const featuredItem = topEight[0];
      const title = featuredItem.title || "Untitled";
      const rawAuthor = featuredItem.author || "";
      const author = rawAuthor.trim().replace(/^by:\s*/i, "") || "ARRAS MINERALS";
      const description = featuredItem.short_description || "";
      const docId = featuredItem.documentId || "";

      const imageUrl = featuredItem.image?.data?.attributes?.url ||
                       featuredItem.image?.url ||
                       "./image/Your paragraph text (14).png";

      const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://acceptable-desire-0cca5bb827.strapiapp.com${imageUrl}`;

      const dateStr = featuredItem.publish_on
        ? new Date(featuredItem.publish_on).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : "";

      mainCardContainer.innerHTML = `
        <div class="featured-card" data-id="${docId}">
          <img src="${absoluteImageUrl}" alt="${title}" />
          <div class="main-card-content">
            <h2>${title}</h2>
            <p>${description}</p>
            <p class="date"><span>${dateStr}</span> By: ${author}</p>
          </div>
        </div>
      `;

      // Make whole featured card clickable
      const featuredCard = mainCardContainer.querySelector(".featured-card");
      if (featuredCard && docId) {
        featuredCard.addEventListener("click", () => {
          window.location.href = `news-details.html?id=${docId}`;
        });
      }
    }

    // Render remaining latest news items
    const remainingItems = topEight.slice(1);
    latestNewsContainer.innerHTML = remainingItems.map(item => {
      const title = item.title || "Untitled";
      const rawAuthor = item.author || "";
      const author = rawAuthor.trim().replace(/^by:\s*/i, "") || null;
      const docId = item.documentId || "";

      const dateStr = item.publish_on ? new Date(item.publish_on).toLocaleDateString() : "";

      return `
        <div class="latest-item" data-id="${docId}">
          <p class="latest-title">${title}</p>
          <p class="date">${dateStr}${author ? ` <span class="author">By: ${author}</span>` : ""}</p>
        </div>
      `;
    }).join("");

    // Make all latest items clickable
    latestNewsContainer.querySelectorAll(".latest-item").forEach(item => {
      const id = item.getAttribute("data-id");
      if (id) {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => {
          window.location.href = `news-details.html?id=${id}`;
        });
      }
    });

  } catch (err) {
    console.error(err);
    latestNewsContainer.innerHTML = `<p style="color:#b00">Failed to load news.</p>`;
    if (mainCardContainer) mainCardContainer.innerHTML = `<p style="color:#b00">Failed to load featured news.</p>`;
  }
}