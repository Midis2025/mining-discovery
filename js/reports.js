async function loadReports() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/reports?populate[reports_image]=true";
  const reportsContainer = document.getElementById("reports");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    console.log('payload+reports', payload.data);

    let sections = payload.data;

    const view = sections.map((item) => {
      // Use the report ID in the link query
      return `
        <div class="section-box">
          <img src="${item.reports_image?.url || ''}" alt="">
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
    console.error(err);
    reportsContainer.innerHTML = `<p style="color:#b00">Failed to load reports.</p>`;
  }
}