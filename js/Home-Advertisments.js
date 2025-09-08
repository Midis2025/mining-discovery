
async function loadBanner() {
  const containers = document.querySelectorAll('.banner');
  if (!containers.length) return;

  try {
    const res = await fetch('https://admins.miningdiscovery.com/api/Home-Advertisments?populate=*');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const ad = data.data && data.data[0];

    if (!ad) {
      containers.forEach(c => c.innerHTML = `<p style="color:#b00">No advertisements available</p>`);
      return;
    }

    const adUrl = ad.ad_url || "#";
    const title = ad.title || "Advertisement";
    const imageObj = ad.home_image && ad.home_image[0];
    const imgUrl = imageObj ? imageObj.formats?.large?.url || imageObj.url : null;

    containers.forEach(container => {
      if (imgUrl) {
        container.innerHTML = `
          <a href="${adUrl}" target="_blank" style="display:block;">
            <img src="${imgUrl}" alt="${title}" style="width:100%; display:block; border-radius:8px;" />
          </a>
        `;
      } else {
        container.innerHTML = `
          <a href="${adUrl}" target="_blank" style="display:block; text-align:center; background:#f3f3f3; padding:20px; border-radius:8px; text-decoration:none; color:#000; font-weight:600;">
            ${title}
          </a>
        `;
      }
    });

  } catch (err) {
    console.error('Error loading banner:', err);
    containers.forEach(c => c.innerHTML = `<p style="color:#b00">Failed to load banner</p>`);
  }
}

// Load banner after DOM is ready
document.addEventListener("DOMContentLoaded", loadBanner);