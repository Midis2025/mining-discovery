/* -------------------------
   MENU TOGGLE
------------------------- */
function toggleMenu() {
  const header = document.querySelector(".main-header");
  if (header) header.classList.toggle("mobile-active");
}

function toggleDropdown() {
  const dropdown = document.getElementById("dropdownMenu");
  const header = document.getElementById("newsToggle");
  if (dropdown) dropdown.classList.toggle("show");
  if (header) header.classList.toggle("rotate");
}

function serviceDropdown() {
      const dropdown = document.getElementById("dropdownMenu2");
      const header = document.getElementById("serviceToggle");
      dropdown.classList.toggle("show");
      header.classList.toggle("rotate");
    }

    function magazineDropdown() {
      const dropdown = document.getElementById("dropdownMenu3");
      const header = document.getElementById("magazineToggle");
      dropdown.classList.toggle("show");
      header.classList.toggle("rotate");
    }
    // subscribe popup
    
/* -------------------------
   CAROUSELS
------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("carousel");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");

  if (carousel && prev && next) {
    prev.addEventListener("click", () => {
      carousel.scrollBy({ left: -260, behavior: "smooth" });
    });
    next.addEventListener("click", () => {
      carousel.scrollBy({ left: 260, behavior: "smooth" });
    });
  }

  const slider = document.getElementById("videoSlider");
  const leftBtn = document.querySelector(".arrow.left");
  const rightBtn = document.querySelector(".arrow.right");

  if (slider && leftBtn && rightBtn) {
    leftBtn.addEventListener("click", () => {
      slider.scrollBy({ left: -300, behavior: "smooth" });
    });
    rightBtn.addEventListener("click", () => {
      slider.scrollBy({ left: 300, behavior: "smooth" });
    });
  }
});

/* -------------------------
   ANIMATED SEARCH TEXT
------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const messages = [
    "Search gold prices",
    "Search silver value",
    "Search copper rates",
   
    "Search latest news",
  ];

  let index = 0;
  const animatedText = document.getElementById("animatedText");

  if (animatedText) {
    setInterval(() => {
      index = (index + 1) % messages.length;
      animatedText.innerText = messages[index];
      animatedText.style.animation = "none"; // reset animation
      void animatedText.offsetWidth; // reflow to restart
      animatedText.style.animation = "slideText 5s ease-in-out infinite";
    }, 5000);
  }
});

/* -------------------------
   YOUTUBE IFRAME LOADER
------------------------- */
function loadIframe(el) {
  el.outerHTML = `
    <iframe width="560" height="315"
      src="https://www.youtube.com/embed/pzxdSK6t2Eo?autoplay=1"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>`;
}

function loadIframe2(el) {
  el.outerHTML = `
    <iframe width="560" height="315"
      src="https://www.youtube.com/embed/D2S9tbVMDRQ?si=oYaYU3_svLfnWTij"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen>
    </iframe>`;
}

/* -------------------------
   YOUTUBE POPUP
------------------------- */

window.addEventListener("load", () => {
  const popup = document.getElementById("popup");
  const closeBtn = document.getElementById("closeBtn");
  const youtubeIframe = document.getElementById("youtube-video");

  if (!popup || !closeBtn || !youtubeIframe) return;

  // ✅ New YouTube video link
  const youtubeLink = "https://www.youtube.com/embed/fEkZCZDaJ9M?autoplay=1";

  // Check if popup already shown in this session
  if (!sessionStorage.getItem("youtubePopupShown")) {
    setTimeout(() => {
      youtubeIframe.src = youtubeLink;
      popup.style.display = "block";
      sessionStorage.setItem("youtubePopupShown", "true"); // mark as shown
    }, 4000);
  }

  // Close popup
  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
    youtubeIframe.src = ""; // Stop video
  });
});
/* -------------------------
   EXTRA NEWS (STATIC DEMO)
------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const moreCards = [
    {
      image: "./image/pexels-castorlystock-5139206 1.png",
      title: "New Goldmine Discovery in Australia",
      description:
        "Exploration companies have uncovered new gold veins in the Kalgoorlie region, expected to boost local economies.",
      date: "July 25, 2025",
      author: "AURA MINES",
    },
    {
      image: "./image/pexels-castorlystock-5139206 1.png",
      title: "Silver Demand Soars",
      description:
        "Investors rush toward silver as green energy demand spikes globally. Analysts predict a 10% increase in demand.",
      date: "July 26, 2025",
      author: "SILVERSTREAM INC",
    },
  ];

  const showMoreBtn = document.querySelector(".btn-more");
  const container = document.getElementById("news-container");

  if (showMoreBtn && container) {
    showMoreBtn.addEventListener("click", function () {
      moreCards.forEach((card) => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("news-card");
        cardDiv.innerHTML = `
          <img src="${card.image}" alt="">
          <div class="text-content">
            <h3>${card.title}</h3>
            <p>${card.description} <span>read more.....</span></p>
            <span>${card.date}</span>
            <p>By: ${card.author}</p>
          </div>`;
        container.appendChild(cardDiv);
      });

      showMoreBtn.style.display = "none"; // hide button after showing
    });
  }

  // Show hidden extra news
  const showMoreExtra = document.getElementById("showMoreBtn");
  if (showMoreExtra) {
    showMoreExtra.addEventListener("click", function () {
      const extraNews = document.querySelectorAll(".extra-news");
      extraNews.forEach((section) => {
        section.style.display = "block"; // Keep natural block layout
        section.style.opacity = "0"; // Start invisible
        section.style.transition = "opacity 0.4s ease"; // Smooth fade
        requestAnimationFrame(() => {
          section.style.opacity = "1"; // Fade in
        });
      });

      this.style.display = "none"; // Hide button after showing
    });
  }
});

/* -------------------------
   FETCH TOP 2 MAGAZINES
------------------------- */
async function loadTopMagazines() {
  try {
    const res = await fetch(
      "https://admins.miningdiscovery.com/api/magazines?populate=*"
    );
    const json = await res.json();
    let magazines = json.data;

    if (!magazines || !magazines.length) return;

    // ✅ sort by publishDate (latest first)
    magazines.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

    // ✅ pick only top 2
    const topMagazines = magazines.slice(0, 2);

    const container = document.getElementById("magazines-home");
    if (!container) return;
    container.innerHTML = "";

    topMagazines.forEach((mag, index) => {
      const title = mag.Title || "Untitled";
      const publishDate = new Date(mag.publishDate).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
      );

      const imgUrl =
        mag.coverImage?.formats?.medium?.url ||
        mag.coverImage?.url ||
        "./image/slider2.png";

      const pdfUrl = mag.pdf?.url || "#";

      container.innerHTML += `
        <div class="box${index + 1}">
          <img src="${imgUrl}" alt="${title}">
          <div class="content">
            <h4>${title} (${publishDate})</h4>
            <button onclick="window.open('${pdfUrl}', '_blank')">View More</button>
          </div>
        </div>`;
    });
  } catch (err) {
    console.error("Error loading top magazines:", err);
    const container = document.getElementById("magazines-home");
    if (container)
      container.innerHTML = `<p style="color:#b00">Failed to load magazines.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadTopMagazines);
// video slider
function loadIframe(el) {
  const videoId = el.getAttribute("data-video"); // YouTube video ID
  const thumbnail = el.querySelector("img").src; // preserve thumbnail
  const card = el.closest(".video-card");

  const iframeWrapper = document.createElement("div");
  iframeWrapper.classList.add("video-iframe-wrapper");

  iframeWrapper.innerHTML = `
    <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
    <button class="close-btn" onclick="closeIframe(this, '${videoId}', '${thumbnail}')">×</button>
  `;

  el.replaceWith(iframeWrapper);
}

function closeIframe(btn, videoId, thumbnail) {
  const wrapper = btn.parentElement;
  const card = wrapper.closest(".video-card");

  card.querySelector(".video-info").insertAdjacentHTML("afterbegin", `
    <div class="video-thumbnail" data-video="${videoId}" onclick="loadIframe(this)">
      <img src="${thumbnail}" alt="Video Thumbnail">
      <div class="play-button">▶</div>
    </div>
  `);

  wrapper.remove();
}


