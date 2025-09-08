async function loadMagazines() {
  try {
    const res = await fetch("https://admins.miningdiscovery.com/api/magazines?populate=*");
    const json = await res.json();
    const magazines = json.data;

    const container = document.getElementById("magazines-container");
    container.innerHTML = "";

    magazines.forEach(mag => {
      const title = mag.Title;
      const publishDate = new Date(mag.publishDate)
        .toLocaleDateString("en-US", { month: "long", year: "numeric" });

      // ✅ Use PDF link
      const pdfUrl = mag.pdf?.url ? mag.pdf.url : "#";

      // ✅ Use cover image (prefer medium, fallback to original)
      const imgUrl =
        mag.coverImage?.formats?.medium?.url ||
        mag.coverImage?.url ||
        "./fallback.jpg";

      const card = `
        <div class="edition-card">
          <img src="${imgUrl}" class="thumb" alt="${title}" />
          <p>${title} (${publishDate})</p>
          <button onclick="window.open('${pdfUrl}', '_blank')">View More</button>
        </div>
      `;

      container.innerHTML += card;
    });
  } catch (err) {
    console.error("Error loading magazines:", err);
  }
}

loadMagazines();