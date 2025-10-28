const API_BASE = "https://admins.miningdiscovery.com";

/* ---------- helpers ---------- */
const abs = (url) => {
  if (!url) return null;
  try { return new URL(url, API_BASE).href; } catch { return url; }
};
const fmtMonthYear = (d) =>
  isNaN(d?.getTime()) ? "Unknown Date" :
  d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

function parseFeatures(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .flatMap(item => typeof item === "string" ? item : (item?.text ?? ""))
      .join("\n");
  }
  if (typeof raw !== "string") {
    try { return parseFeatures(JSON.parse(raw)); } catch { return []; }
  }
  return raw
    .split(/\r?\n|•|·|–|—/g)
    .map(s => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/* Build a features UL with strong inline overrides to defeat external clamps */
function buildFeaturesList(features) {
  const ul = document.createElement("ul");
  ul.className = "features-list";
  ul.setAttribute("data-count", features.length);
  ul.setAttribute("style", [
    "max-height:none!important",
    "overflow:visible!important",
    "display:block!important",
    "padding-left:1.2rem",
    "margin:12px 0",
    "list-style:disc outside",
    // undo common clamp styles
    "-webkit-line-clamp:unset!important",
    "line-clamp:unset!important",
    "-webkit-box-orient:unset!important",
  ].join(";"));

  if (!features.length) {
    const li = document.createElement("li");
    li.textContent = "No features available.";
    ul.appendChild(li);
    return ul;
  }

  features.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    li.setAttribute("style", [
      "display:list-item!important",
      "white-space:normal!important",
      "max-height:none!important",
      "overflow:visible!important",
      // undo truncation on li as well
      "-webkit-line-clamp:unset!important",
      "line-clamp:unset!important",
    ].join(";"));
    ul.appendChild(li);
  });

  return ul;
}

/* ---------- UI ---------- */
function magazineCardHTML({ imgUrl, title, publishDate }) {
  return `
    <img src="${imgUrl}" class="thumb" alt="${title}" />
    <p>${title} (${publishDate})</p>
    <button type="button" class="view-more">View More</button>
  `;
}

function showMagazineDetail(mag) {
  const detailContainer = document.getElementById("magazine-detail");
  if (!detailContainer) return console.warn("magazine-detail container not found in DOM");

  const title = mag.Title || "Untitled Magazine";
  const publishDate = fmtMonthYear(mag.publishDate ? new Date(mag.publishDate) : null);
  const pdfUrl = abs(mag.pdf?.url) || "#";
  const imgUrl = abs(
    mag.coverImage?.formats?.medium?.url ||
    mag.coverImage?.url ||
    "./fallback.jpg"
  );
  const description = (mag.Description || "No description available.").trim();
  const featuresArray = parseFeatures(mag.features);

  // Left column
  const info = document.createElement("div");
  info.className = "magazine-info";
  info.innerHTML = `
    <h3>${title} (${publishDate})</h3>
    <p class="produced-by">Produced by Mining Discovery</p>
    <p class="desc">${description}</p>
  `;
  // Insert features list (with clamp overrides)
  info.appendChild(buildFeaturesList(featuresArray));

  const btnWrap = document.createElement("div");
  btnWrap.className = "button";
  btnWrap.innerHTML = `
    <button class="btn" type="button">Download PDF</button>
  `;
  btnWrap.querySelector("button").addEventListener("click", () => {
    window.open(pdfUrl, "_blank");
  });
  info.appendChild(btnWrap);

  // Right column
  const cover = document.createElement("div");
  cover.className = "magazine-cover";
  cover.innerHTML = `
    <img src="${imgUrl}" alt="${title}" id="mainMagazine" />
    <div class="btns"></div>
  `;

  // Mount
  detailContainer.innerHTML = "";
  detailContainer.appendChild(info);
  detailContainer.appendChild(cover);

  // For quick verification in console:
  console.debug(`Rendered ${featuresArray.length} features for:`, title, featuresArray);
}

/* ---------- main ---------- */
async function loadMagazines() {
  try {
    const res = await fetch(`${API_BASE}/api/magazines?populate=*`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const magazines = Array.isArray(json?.data) ? json.data : [];

    const container = document.getElementById("magazines-container");
    if (!container) return console.warn("magazines-container not found in DOM");
    container.innerHTML = "";

    // Sort by date ascending; latest will be last, which we’ll open by default
    magazines.sort((a, b) =>
      new Date(a.publishDate || 0) - new Date(b.publishDate || 0)
    );

    magazines.forEach((mag, idx) => {
      const title = mag.Title || "Untitled Magazine";
      const publishDate = fmtMonthYear(mag.publishDate ? new Date(mag.publishDate) : null);
      const imgUrl = abs(
        mag.coverImage?.formats?.medium?.url ||
        mag.coverImage?.url ||
        "./fallback.jpg"
      );

      const card = document.createElement("div");
      card.classList.add("edition-card");
      card.innerHTML = magazineCardHTML({ imgUrl, title, publishDate });

      card.addEventListener("click", () => showMagazineDetail(mag));
      card.querySelector(".view-more")?.addEventListener("click", (e) => {
        e.stopPropagation();
        showMagazineDetail(mag);
      });

      container.appendChild(card);

      if (idx === magazines.length - 1) showMagazineDetail(mag);
    });
  } catch (err) {
    console.error("Error loading magazines:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadMagazines);