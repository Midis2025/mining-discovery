async function loadCeoProfiles() {
    try {
      const res = await fetch("https://admins.miningdiscovery.com/api/ceo-profiles?populate=*");
      const json = await res.json();
      const ceos = json.data;

      const container = document.getElementById("ceo-container");
      container.innerHTML = "";

      ceos.forEach(ceo => {
        const { name, designation, ceo_image, ceo_pdf } = ceo;

        const imageUrl = ceo_image?.url 
          ? ceo_image.url 
          : ceo_image?.formats?.thumbnail?.url 
          ? ceo_image.formats.thumbnail.url 
          : "./image/default.png";

        const pdfUrl = ceo_pdf?.[0]?.url || "#";

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
          <img src="${imageUrl}" alt="${name}">
          <div class="name">${name}</div>
          <div class="title">
            <a href="${pdfUrl}" target="_blank">${designation}</a>
          </div>
          <p><a href="${pdfUrl}" target="_blank">Profile</a></p>
        `;

        container.appendChild(card);
      });
    } catch (err) {
      console.error("Error loading CEO profiles:", err);
    }
  }

  loadCeoProfiles();