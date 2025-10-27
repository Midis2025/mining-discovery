async function loadReports() {
  const API_ROOT = "https://admins.miningdiscovery.com";
  const url = `${API_ROOT}/api/reports?populate[reports_image]=true`;
  const reportsContainer = document.getElementById("reports");

  if (!reportsContainer) {
    console.warn("Reports container not found");
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    console.log('✅ Reports loaded:', payload.data?.length || 0);

    let sections = payload.data || [];

    if (sections.length === 0) {
      reportsContainer.innerHTML = '<p style="text-align:center; color:#999;">No reports available</p>';
      return;
    }

    const view = sections.map((item) => {
      // Use the report ID in the link query
      const imageUrl = item.reports_image?.url || '';
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_ROOT}${imageUrl}`;
      return `
        <div class="section-box">
          <img src="${fullImageUrl}" alt="${item.title || 'Report'}">
          <p>
            <a href="/full-news.html?reportId=${item.id}">
              ${item.title || ""}
            </a>
          </p>
        </div>
      `;
    });

    reportsContainer.innerHTML = view.join("");
  } catch (err) {
    console.error("❌ Error loading reports:", err);
    reportsContainer.innerHTML = `<p style="color:#b00; text-align:center;">Failed to load reports.</p>`;
  }
}

// Make function globally accessible
window.loadReports = loadReports;