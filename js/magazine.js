async function loadMagazines() {
  try {
    const res = await fetch("https://admins.miningdiscovery.com/api/magazines?populate=*");
    const json = await res.json();
    const magazines = json.data;

    const container = document.getElementById("magazines-container");
    container.innerHTML = "";

    magazines.forEach((mag, index) => {
      const title = mag.Title || "Untitled Magazine";
      const publishDate = mag.publishDate
        ? new Date(mag.publishDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Unknown Date";

      // ✅ PDF & Cover
      const pdfUrl = mag.pdf?.url || "#";
      const imgUrl = mag.coverImage?.formats?.medium?.url || mag.coverImage?.url || "./fallback.jpg";

      // ✅ Card (clickable)
      const card = document.createElement("div");
      card.classList.add("edition-card");
      card.innerHTML = `
        <img src="${imgUrl}" class="thumb" alt="${title}" />
        <p>${title} (${publishDate})</p>
        <button>View More</button>
      `;

      // 👉 When clicked → show magazine details
      card.addEventListener("click", () => showMagazineDetail(mag));

      container.appendChild(card);

      // Show the first magazine by default
      if (index === 0) {
        showMagazineDetail(mag);
      }
    });
  } catch (err) {
    console.error("Error loading magazines:", err);
  }
}

function showMagazineDetail(mag) {
  const detailContainer = document.getElementById("magazine-detail");

  const title = mag.Title || "Untitled Magazine";
  const publishDate = mag.publishDate
    ? new Date(mag.publishDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Unknown Date";

  const pdfUrl = mag.pdf?.url || "#";
  const imgUrl = mag.coverImage?.formats?.medium?.url || mag.coverImage?.url || "./fallback.jpg";
  const description = mag.description || "No description available.";

  detailContainer.innerHTML = `
    <div class="magazine-info">
      <h3>${title} (${publishDate})</h3>
      <p class="produced-by">Produced by Mining Discovery</p>
      <p class="desc">${description}</p>
      <p class="toggle-btn">View more ▼</p>
      <ul class="features-list">
        <li>Global Mining Trends & Insights...</li>
        <li>Rare Earths and Critical Minerals Outlook...</li>
        <li>Gold, Lithium & Copper Market Shifts..</li>
        <li>Geopolitics and Commodity Price Impacts...</li>
        <li>Sustainability and Green Mining Innovations...</li>
        <li>Key Corporate Moves and Industry Highlights...</li>
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

loadMagazines();