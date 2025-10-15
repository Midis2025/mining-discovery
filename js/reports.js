async function loadReports() {
  const url = "https://admins.miningdiscovery.com/api/reports?populate[reports_image]=true";
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
      return `
        <div class="section-box">
          <img src="${item.reports_image?.url || ''}" alt="${item.title || 'Report'}">
          <p>
            <a href="full-news.html?reportId=${item.id}">
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