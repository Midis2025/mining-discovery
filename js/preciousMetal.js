async function loadPreciousMetalNews() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=precious-metals&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][fields][3]=short_description&populate[news_sections][populate][image]=true";

  const preciousMetalNewsContainer = document.getElementById("preciousMetalNews");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    let sections = payload?.data?.[0]?.news_sections;

    const sortedSections = sections.sort((a, b) => {
      const dateA = new Date(a.publish_on || 0).getTime();
      const dateB = new Date(b.publish_on || 0).getTime();
      return dateB - dateA; // descending order (newest first)
    });

    const view = sortedSections.slice(0, 1).map((item) => {
      const title = item.title || "Untitled";
      const author = item.author || "Unknown";
      const date = formatDate(item.publish_on);
      const docId = item.documentId || "";
      const imageUrl = item.image?.url || "./image/slider2.png";
      const description = item.short_description || "";

      return `
        <img src="${imageUrl}" alt="card" />
        <div class="world-news">
          <p>
            ${docId 
              ? `<a href="news-details.html?id=${docId}" class="precious-link">${title}</a>` 
              : title}
          </p>
          ${description ? `<p class="description">${escapeHtml(description)}</p>` : ""}
          <small>${date}</small>
          <div class="author">By: ${escapeHtml(author)}</div>
          ${
            docId
              ? `<a href="news-details.html?id=${docId}"></a>`
              : ""
          }
        </div>
      `;
    });

    preciousMetalNewsContainer.innerHTML = view.join("");
  } catch (err) {
    console.error(err);
    preciousMetalNewsContainer.innerHTML = `<p style="color:#b00">Failed to load news.</p>`;
  }
}