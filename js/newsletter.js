const container = document.getElementById("newsletterContainer");

async function fetchNewsletters() {
  try {
    const res = await fetch("https://admins.miningdiscovery.com/api/post-newsletters?populate=*");
    const data = await res.json();

    // Group newsletters by category
    const grouped = data.data.reduce((acc, newsletter) => {
      const category = newsletter.newsletter_category.name;
      if (!acc[category]) acc[category] = {
        newsletters: [],
        updatedAt: newsletter.newsletter_category.updatedAt || newsletter.newsletter_category.createdAt
      };
      acc[category].newsletters.push(newsletter);
      return acc;
    }, {});

    // Sort categories by latest updatedAt (newest month first)
    const sortedCategories = Object.entries(grouped)
      .sort(([, a], [, b]) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Render categories and newsletters
    sortedCategories.forEach(([categoryName, catData]) => {
      const newsletters = catData.newsletters;

      // Category title
      const catTitle = document.createElement("h3");
      catTitle.textContent = categoryName;
      container.appendChild(catTitle);

      // Newsletter container
      const newsletterDiv = document.createElement("div");
      newsletterDiv.className = "newsletter-container";

      newsletters.forEach(news => {
        const card = document.createElement("div");
        card.className = "newsletter-card";

        const img = document.createElement("img");
        img.src = news.coverImage 
          ? news.coverImage.url 
          : "https://via.placeholder.com/150x200?text=No+Image";
        img.alt = news.title;
        img.style.cursor = "pointer";

        // Open PDF in new tab on click
        img.onclick = () => {
          window.open(news.pdfFile.url, "_blank");
        };

        card.appendChild(img);
        newsletterDiv.appendChild(card);
      });

      container.appendChild(newsletterDiv);
    });

  } catch (error) {
    console.error("Error fetching newsletters:", error);
  }
}

fetchNewsletters();
