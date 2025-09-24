async function loadLatestNews() {
const url =
  "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories" +
  "?filters[slug][$eq]=latest-news" +
  "&populate[news_sections][fields][0]=title" +
  "&populate[news_sections][fields][1]=author" +
  "&populate[news_sections][fields][2]=publish_on" +
  "&populate[news_sections][fields][3]=short_description" +
  "&populate[news_sections][populate][image]=true" +
  "&pagination[page]=1" +          // 👈 first page
  "&pagination[pageSize]=5";       // 👈 5 items per page


  const latestNewsContainer = document.getElementById("latestNews");
  const mainCardContainer = document.getElementById("mainCard");
  const tickerContainer = document.getElementById("newsTicker"); // NEW: scrolling ticker

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    let sections = payload?.data?.[0]?.news_sections;

    // Fallback for Strapi v4
    if (!Array.isArray(sections)) {
      const v4Data = payload?.data?.[0]?.attributes?.news_sections?.data || [];
      sections = v4Data.map((x) => x.attributes);
    }

    if (!sections || !sections.length) {
      if (latestNewsContainer) latestNewsContainer.innerHTML = "<p>No news found.</p>";
      if (mainCardContainer) mainCardContainer.innerHTML = "<p>No featured news available.</p>";
      if (tickerContainer) tickerContainer.innerHTML = "<p>No news available.</p>";
      return;
    }

    // Debug: Log the sections before sorting
    console.log("Raw sections data:", sections);
    
    // Enhanced sorting to ensure newest first - handle null/undefined dates better
    const sortedSections = sections.sort((a, b) => {
      // Handle different possible date field locations
      const publishDateA = a.publish_on || a.publishedAt || a.createdAt;
      const publishDateB = b.publish_on || b.publishedAt || b.createdAt;
      
      // Handle cases where dates might be null/undefined
      if (!publishDateA && !publishDateB) return 0;
      if (!publishDateA) return 1; // A goes to end
      if (!publishDateB) return -1; // B goes to end
      
      const dateA = new Date(publishDateA);
      const dateB = new Date(publishDateB);
      
      // Check for invalid dates
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      // Sort newest first (descending order) - this includes full datetime comparison
      const timeDiff = dateB.getTime() - dateA.getTime();
      
      // If dates are exactly the same (same timestamp), use ID as secondary sort
      // Higher ID numbers usually mean newer entries in most CMS systems
      if (timeDiff === 0) {
        const idA = parseInt(a.id || a.documentId || 0);
        const idB = parseInt(b.id || b.documentId || 0);
        console.log(`Same timestamp detected. Using ID fallback: A(${idA}) vs B(${idB})`);
        return idB - idA; // Higher ID first
      }
      
      // Enhanced logging for same-date articles
      const sameDate = dateA.toDateString() === dateB.toDateString();
      console.log(`Comparing: ${a.title?.substring(0, 40)}... vs ${b.title?.substring(0, 40)}...`);
      console.log(`  Date A: ${dateA.toISOString()} (${dateA.getTime()})`);
      console.log(`  Date B: ${dateB.toISOString()} (${dateB.getTime()})`);
      console.log(`  Same date: ${sameDate}, Time difference: ${timeDiff}ms (${timeDiff > 0 ? 'B newer' : timeDiff < 0 ? 'A newer' : 'same time'})`);
      
      return timeDiff;
    });

    // Debug: Log the sorted order
    console.log("Sorted sections:", sortedSections.map(s => ({
      title: s.title,
      publish_on: s.publish_on,
      publishedAt: s.publishedAt,
      createdAt: s.createdAt
    })));

    const topEight = sortedSections.slice(0, 8);

    /* ========================
       Render Featured Main Card (Newest News)
    ========================= */
    if (mainCardContainer && topEight.length > 0) {
      const featuredItem = topEight[0]; // This is guaranteed to be the newest
      
      console.log("=== MAIN CARD RENDERING ===");
      console.log("Featured item being rendered:", featuredItem.title);
      console.log("Featured item publish date:", featuredItem.publish_on || featuredItem.publishedAt || featuredItem.createdAt);
      
      const title = featuredItem.title || "Untitled";
      const rawAuthor = featuredItem.author || "";
      const author =
        rawAuthor.trim().replace(/^by:\s*/i, "") || "ARRAS MINERALS";
      const description = featuredItem.short_description || "";
      const docId = featuredItem.documentId || "";

      const imageUrl =
        featuredItem.image?.data?.attributes?.url ||
        featuredItem.image?.url ||
        "./image/Your paragraph text (14).png";

      const absoluteImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `https://acceptable-desire-0cca5bb827.strapiapp.com${imageUrl}`;

      // Handle different possible date field locations
      const publishDate = featuredItem.publish_on || featuredItem.publishedAt || featuredItem.createdAt;
      const dateStr = publishDate
        ? new Date(publishDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";

      // Clear and rebuild the main card container
      mainCardContainer.innerHTML = "";
      setTimeout(() => {
        mainCardContainer.innerHTML = `
          <div class="featured-card" data-id="${docId}">
            <img src="${absoluteImageUrl}" alt="${title}" />
            <div class="main-card-content">
              <h2>${title}</h2>
              <p>${description}</p>
              <p class="date"><span>${dateStr}</span> By: ${author}</p>
            </div>
          </div>
        `;

        // Make whole featured card clickable
        const featuredCard = mainCardContainer.querySelector(".featured-card");
        if (featuredCard && docId) {
          featuredCard.addEventListener("click", () => {
            window.location.href = `news-details.html?id=${docId}`;
          });
        }
        
        console.log("Main card updated with:", title);
      }, 100);
    }

    /* ========================
       Render Remaining Latest Items (2nd-8th newest)
    ========================= */
    const remainingItems = topEight.slice(1);
    if (latestNewsContainer) {
      latestNewsContainer.innerHTML = remainingItems
        .map((item) => {
          const title = item.title || "Untitled";
          const rawAuthor = item.author || "";
          const author =
            rawAuthor.trim().replace(/^by:\s*/i, "") || null;
          const docId = item.documentId || "";

          // Handle different possible date field locations
          const publishDate = item.publish_on || item.publishedAt || item.createdAt;
          const dateStr = publishDate
            ? new Date(publishDate).toLocaleDateString()
            : "";

          return `
            <div class="latest-item" data-id="${docId}">
              <p class="latest-title">${title}</p>
              <p class="date">${dateStr}${
            author ? ` <span class="author">By: ${author}</span>` : ""
          }</p>
            </div>
          `;
        })
        .join("");

      // Make all latest items clickable
      latestNewsContainer.querySelectorAll(".latest-item").forEach((item) => {
        const id = item.getAttribute("data-id");
        if (id) {
          item.style.cursor = "pointer";
          item.addEventListener("click", () => {
            window.location.href = `news-details.html?id=${id}`;
          });
        }
      });
    }

    /* ========================
       Render Ticker News Titles (All top 8)
    ========================= */
    if (tickerContainer) {
      const tickerItems = topEight
        .map((item) => {
          const title = item.title || "Untitled";
          const docId = item.documentId || "";
          return `
            <div class="scrolling-content" data-id="${docId}">
              <p>${title}</p>
            </div>
          `;
        })
        .join("");

      // Duplicate items for seamless loop
      tickerContainer.innerHTML = tickerItems + tickerItems;

      // Make ticker items clickable
      tickerContainer.querySelectorAll(".scrolling-content").forEach((el) => {
        const id = el.getAttribute("data-id");
        if (id) {
          el.style.cursor = "pointer";
          el.addEventListener("click", () => {
            window.location.href = `news-details.html?id=${id}`;
          });
        }
      });
    }

    // Optional: Log the featured item for debugging
    console.log("Featured news item details:", {
      title: topEight[0]?.title,
      publish_on: topEight[0]?.publish_on,
      publishedAt: topEight[0]?.publishedAt,
      createdAt: topEight[0]?.createdAt
    });
    
  } catch (err) {
    console.error("Error loading news:", err);
    if (latestNewsContainer)
      latestNewsContainer.innerHTML = `<p style="color:#b00">Failed to load news.</p>`;
    if (mainCardContainer)
      mainCardContainer.innerHTML = `<p style="color:#b00">Failed to load featured news.</p>`;
    if (tickerContainer)
      tickerContainer.innerHTML = `<p style="color:#b00">Failed to load news ticker.</p>`;
  }
}