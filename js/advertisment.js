async function loadAdvertisements() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/advertisements?populate[ads_image]=true";
  const advertisementsContainer = document.getElementById("advertisements");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    console.log("payload", payload.data);

    let sections = payload.data;

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
    console.error(err);
    advertisementsContainer.innerHTML = `<p style="color:#b00">Failed to load ads.</p>`;
  }
}