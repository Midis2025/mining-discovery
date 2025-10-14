async function loadAdvertisements() {
  const url = "https://admins.miningdiscovery.com/api/advertisements?populate[ads_image]=true";
  const advertisementsContainer = document.getElementById("advertisements");

  if (!advertisementsContainer) {
    console.warn("Advertisements container not found");
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    console.log("✅ Advertisements loaded:", payload.data?.length || 0);

    let sections = payload.data || [];

    if (sections.length === 0) {
      advertisementsContainer.innerHTML = '<p style="text-align:center; color:#999;">No ads available</p>';
      return;
    }

    const view = sections.map((item) => {
      const imageUrl = item.ads_image?.url || "";
      const adUrl = item.ad_url || "#";

      return `
        <div class="left-ad">
          <a href="${adUrl}" target="_blank" rel="noopener noreferrer">
            <img src="${imageUrl}" alt="${item.alt_text || "Advertisement"}" class="logo-img" />
          </a>
        </div>
      `;
    });

    advertisementsContainer.innerHTML = view.join("");
  } catch (err) {
    console.error("❌ Error loading advertisements:", err);
    advertisementsContainer.innerHTML = `<p style="color:#b00; text-align:center;">Failed to load ads.</p>`;
  }
}

// Make function globally accessible
window.loadAdvertisements = loadAdvertisements;