async function loadMagazines() {
  try {
    const res = await fetch("https://admins.miningdiscovery.com/api/magazines?populate=*");
    const json = await res.json();
    const magazines = json.data;

    const container = document.getElementById("magazines-container");
    if (!container) return console.warn("magazines-container not found in DOM");
    container.innerHTML = "";

    magazines.forEach((mag, index) => {
      const title = mag.Title || "Untitled Magazine";
      const publishDate = mag.publishDate
        ? new Date(mag.publishDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Unknown Date";

      const pdfUrl = mag.pdf?.url || "#";
      const imgUrl = mag.coverImage?.formats?.medium?.url || mag.coverImage?.url || "./fallback.jpg";

      // Create magazine card
      const card = document.createElement("div");
      card.classList.add("edition-card");
      card.innerHTML = `
        <img src="${imgUrl}" class="thumb" alt="${title}" />
        <p>${title} (${publishDate})</p>
        <button>View More</button>
      `;

      // Click → show magazine details
      card.addEventListener("click", () => showMagazineDetail(mag));
      container.appendChild(card);
      

      // Show first magazine by default
      if (index === 0) showMagazineDetail(mag);
    });
  } catch (err) {
    console.error("Error loading magazines:", err);
  }
}

function showMagazineDetail(mag) {
  const detailContainer = document.getElementById("magazine-detail");
  if (!detailContainer) return console.warn("magazine-detail container not found in DOM");

  const title = mag.Title || "Untitled Magazine";
  const publishDate = mag.publishDate
    ? new Date(mag.publishDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Unknown Date";

  const pdfUrl = mag.pdf?.url || "#";
  const imgUrl = mag.coverImage?.formats?.medium?.url || mag.coverImage?.url || "./fallback.jpg";
  
  // Correct field name to match backend
  const description = mag.Description || "No description available.";

  // Parse features if available
  const featuresArray = mag.features
    ? mag.features.split('\n').map(f => f.trim()).filter(f => f.length > 0)
    : [];

  const featuresHtml = featuresArray.length
    ? featuresArray.map(f => `<li>${f}</li>`).join('')
    : '<li>No features available.</li>';

  detailContainer.innerHTML = `
    <div class="magazine-info">
      <h3>${title} (${publishDate})</h3>
      <p class="produced-by">Produced by Mining Discovery</p>
      <p class="desc">${description}</p>
      <ul class="features-list">
        ${featuresHtml}
      </ul>
      <div class="button">
        <button class="btn subscribe">Subscribe to Get the Access</button>
      </div>
    </div>

    <div class="magazine-cover">
      <img src="${imgUrl}" alt="${title}" id="mainMagazine" />
      <div class="btns">
        <button class="btn" onclick="window.open('${pdfUrl}', '_blank')">Download PDF</button>
        <button class="btn subscribe">Subscribe to Get the Access</button>
      </div>
    </div>
  `;
}

// Load magazines after DOM is ready
document.addEventListener("DOMContentLoaded", loadMagazines);