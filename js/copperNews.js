async function loadCopperNews() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=copper-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][fields][3]=short_description&populate[news_sections][populate][image]=true";

  const copperNewsContainer = document.getElementById("copperNews");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    console.log("firstcopper", payload.data[0].news_sections);

    let sections = payload?.data?.[0]?.news_sections;

    // Sort by publish date
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
      const docId = item.documentId || "";

      return `
        <div class="right-box">
          <h4>
            ${docId 
              ? `<a href="news-details.html?id=${docId}" class="copper-link">${title}</a>` 
              : title}
          </h4>
          <span>${date}  |  ${escapeHtml(author)}</span>
        </div>`;
    });

    copperNewsContainer.innerHTML += view.join("");
  } catch (err) {
    console.error(err);
    copperNewsContainer.innerHTML = `<p style="color:#b00">Failed to load news.</p>`;
  }
}
