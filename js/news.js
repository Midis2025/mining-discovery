const API_ROOT = "https://acceptable-desire-0cca5bb827.strapiapp.com";

// Global variables
let allCategories = [];
let currentCategorySlug = "latest-news";
let currentPage = 1;
const pageSize = 5;
let totalItems = 0;

function toArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  return [x];
}

async function newsCategory() {
  try {
    const res = await fetch(`${API_ROOT}/api/news-categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const payload = json?.data ?? json;
    return toArray(payload);
  } catch (error) {
    console.error("Error fetching news categories:", error);
    return [];
  }
}

function safeSlugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildCategoryEndpoint(slug, page = 1) {
  const finalSlug = slug || "latest-news";
  const encSlug = encodeURIComponent(finalSlug);

  return (
    API_ROOT +
    `/api/news-categories?filters[slug][$eq]=${encSlug}` +
    `&populate[news_sections][fields][0]=title` +
    `&populate[news_sections][fields][1]=author` +
    `&populate[news_sections][fields][2]=publish_on` +
    `&populate[news_sections][fields][3]=short_description` +
    `&populate[news_sections][populate][image]=true` +
    `&populate[news_sections][populate][pdf]=true` +
    `&pagination[pageSize]=${pageSize}&pagination[page]=${page}`
  );
}

function absUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ROOT}${url}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function escapeHTML(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncateWords(str, maxWords = 15) {
  const words = String(str || "").split(/\s+/);
  if (words.length <= maxWords) return str || "";
  return words.slice(0, maxWords).join(" ");
}

function buildNewsCard({
  title,
  author,
  publish_on,
  short_description,
  imageUrl,
  docId,
  pdfUrl,
}) {
  const safeTitle = escapeHTML(title || "Untitled");
  const safeAuthor = escapeHTML(author || "");
  const safeDate = fmtDate(publish_on);
  const safeDesc = escapeHTML(truncateWords(short_description || ""));
  const imgSrc = imageUrl || "./image/pexels-castorlystock-5139206 1.png";
  const safeDocId = escapeHTML(docId || "");
  const safePdfUrl = pdfUrl ? escapeHTML(pdfUrl) : null;
  const dataAttrs = `data-doc-id="${safeDocId}" ${
    safePdfUrl ? `data-pdf-url="${safePdfUrl}"` : ""
  }`;

  return `
    <div class="news-card clickable-card" ${dataAttrs} style="cursor: pointer;">
      <img src="${imgSrc}" alt="">
      <div class="text-content">
        <h3>${safeTitle}</h3>
        <hr class="custom-line">
        <p>${safeDesc} <span><a href="javascript:void(0)" class="read-more-inline"></a></span></p>
        <span>${safeDate}</span>
        <p>${safeAuthor || "ARRAS MINERALS"}</p>
      </div>
    </div>
  `;
}

function buildNextNewsCard({
  title,
  short_description,
  imageUrl,
  docId,
  pdfUrl,
}) {
  const safeTitle = escapeHTML(title || "Untitled");
  const safeDesc = escapeHTML(truncateWords(short_description || ""));
  const imgSrc = imageUrl || "./image/pexels-castorlystock-5139206 1.png";
  const safeDocId = escapeHTML(docId || "");
  const safePdfUrl = pdfUrl ? escapeHTML(pdfUrl) : null;
  const dataAttrs = `data-doc-id="${safeDocId}" ${
    safePdfUrl ? `data-pdf-url="${safePdfUrl}"` : ""
  }`;

  return `
    <div class="gold-card clickable-card" ${dataAttrs} style="cursor: pointer;">
      <img src="${imgSrc}" alt="">
      <h3>${safeTitle}</h3>
      <p>${safeDesc}</p>
    </div>
  `;
}

function extractSectionsFromResponse(apiJson, targetSlug) {
  const categories = toArray(apiJson?.data || []);
  const targetCategory = categories.find((cat) => {
    const src = cat?.attributes ?? cat ?? {};
    const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
    return slug === targetSlug;
  });

  if (!targetCategory) return [];

  const bucket = targetCategory?.attributes ?? targetCategory ?? {};
  const rawSections = bucket?.news_sections || [];

  const sections = toArray(rawSections).map((sec) => {
    const s = sec?.attributes ?? sec ?? {};
    const imageUrl =
      sec?.image?.data?.attributes?.url ||
      s?.image?.data?.attributes?.url ||
      s?.image?.url ||
      null;
    const pdfUrl =
      sec?.pdf?.data?.attributes?.url ||
      s?.pdf?.data?.attributes?.url ||
      s?.pdf?.url ||
      null;

    return {
      title: s.title,
      author: s.author,
      publish_on: s.publish_on,
      short_description: s.short_description,
      imageUrl: absUrl(imageUrl),
      pdfUrl: absUrl(pdfUrl),
      docId: sec?.documentId || s?.documentId || null,
    };
  });

  return sections.sort((a, b) => {
    const da = new Date(a.publish_on || 0).getTime();
    const db = new Date(b.publish_on || 0).getTime();
    return db - da;
  });
}

function renderNewsSections(sections, append = false) {
  const container = document.getElementById("newsContainer");
  if (!container) return;
  if (!sections.length && !append) {
    container.innerHTML = `<p>No news available for this category.</p>`;
    return;
  }

  const html = sections.map(buildNewsCard).join("");
  if (append) {
    container.insertAdjacentHTML("beforeend", html);
  } else {
    container.innerHTML = html;
  }
  attachCardClickHandlers(container);
}

function renderNextCategoryPreview(sections) {
  const nextNewsContainer = document.getElementById("nextNewsContainer");
  if (!nextNewsContainer || !sections.length) return;
  const nextNewsCard = sections.slice(0, 3).map(buildNextNewsCard).join("");
  nextNewsContainer.innerHTML = nextNewsCard;
  attachCardClickHandlers(nextNewsContainer);
}

function attachCardClickHandlers(container) {
  if (!container) return;
  const clickableCards = container.querySelectorAll(".clickable-card");
  clickableCards.forEach((card) => {
    card.addEventListener("click", handleCardClick);
  });
}

function handleCardClick(event) {
  const card = event.currentTarget;
  const pdfUrl = card.getAttribute("data-pdf-url");
  const docId = card.getAttribute("data-doc-id");

  if (pdfUrl && pdfUrl !== "null" && pdfUrl !== "") {
    window.open(pdfUrl, "_blank");
  } else if (docId && docId !== "null" && docId !== "") {
    window.location.href = `news-details.html?id=${docId}`;
  }
}

function getNextCategoryInfo(currentSlug) {
  if (!allCategories.length) return null;
  const currentIndex = allCategories.findIndex((cat) => {
    const src = cat?.attributes ?? cat ?? {};
    const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
    return slug === currentSlug;
  });
  const nextIndex =
    currentIndex === -1 || currentIndex === allCategories.length - 1
      ? 0
      : currentIndex + 1;
  const nextCategory = allCategories[nextIndex];
  const src = nextCategory?.attributes ?? nextCategory ?? {};
  return {
    name: src.title ?? src.category ?? src.name ?? "Unknown Category",
    slug: src.slug ?? (src.category ? safeSlugify(src.category) : null),
  };
}

function updateNextCategoryDisplay() {
  const nextCategoryEl = document.getElementById("nextCategoryTitle");
  if (nextCategoryEl) {
    const nextCategoryInfo = getNextCategoryInfo(currentCategorySlug);
    nextCategoryEl.textContent =
      nextCategoryInfo?.name || "No Next Category";
  }
}

async function fetchAndRenderCategory(slug, page = 1, append = false) {
  const endpoint = buildCategoryEndpoint(slug, page);
  currentCategorySlug = slug || "latest-news";
  currentPage = page;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    totalItems = data?.meta?.pagination?.total || 0;

    const sections = extractSectionsFromResponse(data, currentCategorySlug);
    renderNewsSections(sections, append);

    const categories = toArray(data?.data || []);
    const currentCategory = categories.find((cat) => {
      const src = cat?.attributes ?? cat ?? {};
      const slug =
        src.slug ?? (src.category ? safeSlugify(src.category) : null);
      return slug === currentCategorySlug;
    });
    const categoryName =
      currentCategory?.attributes?.title ||
      currentCategory?.attributes?.name ||
      currentCategory?.attributes?.category ||
      currentCategorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) =>
        c.toUpperCase()
      );

    const headingEl = document.getElementById("categoryTitle");
    if (headingEl) headingEl.textContent = categoryName;

    updateNextCategoryDisplay();

    const nextCategoryInfo = getNextCategoryInfo(currentCategorySlug);
    if (nextCategoryInfo?.slug) {
      const nextEndpoint = buildCategoryEndpoint(nextCategoryInfo.slug, 1);
      const res2 = await fetch(nextEndpoint);
      const nextData = await res2.json();
      const nextSections = extractSectionsFromResponse(
        nextData,
        nextCategoryInfo.slug
      );
      renderNextCategoryPreview(nextSections);
    }

    const showMoreBtn = document.querySelector(".btn-more");
    if (showMoreBtn) {
      const shownCount = currentPage * pageSize;
      showMoreBtn.style.display =
        shownCount >= totalItems ? "none" : "block";
    }
  } catch (err) {
    console.error("Error fetching news for", slug, err);
  }
}

function generateDropdownMenu(categories) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.innerHTML = "";
  categories.forEach((item) => {
    const src = item?.attributes ?? item ?? {};
    const title =
      src.title ?? src.category ?? src.name ?? `Category ${item?.id ?? ""}`;
    const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
    if (!title) return;
    const a = document.createElement("a");
    a.textContent = title;
    a.href = "javascript:void(0)";
    a.dataset.slug = slug || "";
    dropdownMenu.appendChild(a);
  });
  dropdownMenu.addEventListener("click", async (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    const slug = link.dataset.slug || "latest-news";
    await fetchAndRenderCategory(slug, 1, false);
  });
}

function handleShowMoreClick() {
  fetchAndRenderCategory(currentCategorySlug, currentPage + 1, true);
}

document.addEventListener("DOMContentLoaded", async () => {
  const dropdownToggle = document.getElementById("dropdownToggle");
  const dropdownMenu = document.getElementById("dropdownMenu");

  allCategories = await newsCategory();
  generateDropdownMenu(allCategories);
  await fetchAndRenderCategory("latest-news", 1);

  const showMoreBtn = document.querySelector(".btn-more");
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", handleShowMoreClick);
  }

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
      dropdownToggle.setAttribute(
        "aria-expanded",
        dropdownMenu.classList.contains("show") ? "true" : "false"
      );
    });
  }

  document.addEventListener("click", (e) => {
    if (dropdownMenu && dropdownToggle) {
      const inside =
        dropdownMenu.contains(e.target) || dropdownToggle.contains(e.target);
      if (!inside) {
        dropdownMenu.classList.remove("show");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdownMenu && dropdownToggle) {
      dropdownMenu.classList.remove("show");
      dropdownToggle.setAttribute("aria-expanded", "false");
    }
  });
});