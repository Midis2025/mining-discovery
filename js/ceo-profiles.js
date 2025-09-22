async function loadCeoProfiles() {
  try {
    const res = await fetch("https://admins.miningdiscovery.com/api/ceo-profiles?populate=*");
    const json = await res.json();
    const ceos = json.data;

    const container = document.getElementById("slider"); // flex slider container
    container.innerHTML = "";

    // Cache main profile elements
    const mainImg = document.getElementById("mainProfileImg");
    const mainName = document.getElementById("mainProfileName");
    const mainTitle = document.getElementById("mainProfileTitle");
    const mainDesc = document.getElementById("mainProfileDesc");
    const mainBtn = document.getElementById("mainProfileBtn");

    ceos.forEach((ceo, index) => {
      const { name, designation, shortDescription, ceo_image, ceo_pdf } = ceo;

      // Handle image fallback
      const imageUrl = ceo_image?.url 
        ? ceo_image.url 
        : ceo_image?.formats?.thumbnail?.url 
        ? ceo_image.formats.thumbnail.url 
        : "./image/default.png";

      // PDF link
      const pdfUrl = ceo_pdf?.[0]?.url || "#";

      // Create card
      const card = document.createElement("div");
      card.classList.add("profile-card");

      card.innerHTML = `
        <img src="${imageUrl}" alt="${name}">
        <h4>${name}</h4>
        <small>${designation || ""}</small>
        <p>${shortDescription || ""}</p>
        <button class="profile-btn">View Profile</button>
      `;

      // On card click → update main profile
      card.addEventListener("click", () => {
        mainImg.src = imageUrl;
        mainName.textContent = name;
        mainTitle.textContent = designation || "";
        mainDesc.textContent = shortDescription || "";
        mainBtn.href = pdfUrl;
        mainBtn.target = "_blank"; // open in new tab
      });

      container.appendChild(card);

      // ✅ Show the first CEO by default
      if (index === 0) {
        mainImg.src = imageUrl;
        mainName.textContent = name;
        mainTitle.textContent = designation || "";
        mainDesc.textContent = shortDescription || "";
        mainBtn.href = pdfUrl;
        mainBtn.target = "_blank";
      }
    });
  } catch (err) {
    console.error("Error loading CEO profiles:", err);
  }
}

loadCeoProfiles();