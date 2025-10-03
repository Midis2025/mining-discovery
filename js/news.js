/********************************************************************
 * Config & Globals
 ********************************************************************/
const API_ROOT = "https://acceptable-desire-0cca5bb827.strapiapp.com";

let allCategories = [];
let currentCategorySlug = "latest-news";
let currentPage = 1;
const pageSize = 5;
let totalItems = 0;

/********************************************************************
 * Utilities
 ********************************************************************/
function toArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  return [x];
}

function safeSlugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
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

function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("category");
  return (slug && slug.trim()) ? decodeURIComponent(slug.trim()) : "latest-news";
}

function setActiveMenuItem(slug) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (!dropdownMenu) return;
  dropdownMenu.querySelectorAll("a[data-slug]").forEach(a => {
    if (a.dataset.slug === slug) a.classList.add("active");
    else a.classList.remove("active");
  });
}

/********************************************************************
 * PDF Utilities
 ********************************************************************/
function resolvePdfUrl(raw) {
  console.log('PDF raw data:', raw);
  
  if (!raw) {
    return null;
  }
  
  let url = null;
  
  // Handle array structure
  if (Array.isArray(raw) && raw.length > 0) {
    const firstItem = raw[0];
    if (firstItem?.attributes?.url) {
      url = firstItem.attributes.url;
    } else if (firstItem?.url) {
      url = firstItem.url;
    } else if (firstItem?.data?.attributes?.url) {
      url = firstItem.data.attributes.url;
    }
  }
  // Handle object structure
  else if (typeof raw === 'object') {
    if (raw?.data?.attributes?.url) {
      url = raw.data.attributes.url;
    } else if (raw?.attributes?.url) {
      url = raw.attributes.url;
    } else if (raw?.url) {
      url = raw.url;
    } else if (raw?.data?.[0]?.attributes?.url) {
      url = raw.data[0].attributes.url;
    } else if (Array.isArray(raw?.data) && raw.data.length > 0) {
      const firstItem = raw.data[0];
      if (firstItem?.attributes?.url) {
        url = firstItem.attributes.url;
      } else if (firstItem?.url) {
        url = firstItem.url;
      }
    }
  }
  
  if (!url) {
    return null;
  }
  
  return absUrl(url);
}

function isValidPdfUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed !== '' && 
         trimmed !== 'null' && 
         trimmed !== 'undefined' &&
         (trimmed.startsWith('http://') || trimmed.startsWith('https://'));
}

function showMessage(message, type = 'info') {
  const existingMsg = document.querySelector('.pdf-toast-message');
  if (existingMsg) existingMsg.remove();
  
  const toast = document.createElement('div');
  toast.className = `pdf-toast-message ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#2196f3'};
    color: white;
    border-radius: 4px;
    z-index: 10000;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animation styles
if (!document.getElementById('pdf-toast-styles')) {
  const style = document.createElement('style');
  style.id = 'pdf-toast-styles';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

/********************************************************************
 * API Builders
 ********************************************************************/
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

/********************************************************************
 * Renderers
 ********************************************************************/
function buildNewsCard({ title, author, publish_on, short_description, imageUrl, docId, pdfUrl }) {
  const safeTitle = escapeHTML(title || "Untitled");
  const safeAuthor = escapeHTML(author || "");
  const safeDate = fmtDate(publish_on);
  const safeDesc = escapeHTML(truncateWords(short_description || ""));
  const imgSrc = imageUrl || "./image/pexels-castorlystock-5139206 1.png";
  const safeDocId = escapeHTML(docId || "");
  const safePdfUrl = pdfUrl ? escapeHTML(pdfUrl) : "";
  
  const dataAttrs = `data-doc-id="${safeDocId}"${safePdfUrl ? ` data-pdf-url="${safePdfUrl}"` : ''}`;
  
  // Add PDF indicator if PDF is available
  const pdfIndicator = safePdfUrl ? '<span class="pdf-badge" title="PDF available"></span>' : '';

  return `
    <div class="news-card clickable-card" ${dataAttrs} style="cursor: pointer;">
      <img src="${imgSrc}" alt="">
      <div class="text-content">
        <h3>${safeTitle} ${pdfIndicator}</h3>
        <hr class="custom-line">
        <p>${safeDesc} <span><a href="javascript:void(0)" class="read-more-inline"></a></span></p>
        <span>${safeDate}</span>
        <p>${safeAuthor || "ARRAS MINERALS"}</p>
      </div>
    </div>
  `;
}

function buildNextNewsCard({ title, short_description, imageUrl, docId, pdfUrl }) {
  const safeTitle = escapeHTML(title || "Untitled");
  const safeDesc = escapeHTML(truncateWords(short_description || ""));
  const imgSrc = imageUrl || "./image/pexels-castorlystock-5139206 1.png";
  const safeDocId = escapeHTML(docId || "");
  const safePdfUrl = pdfUrl ? escapeHTML(pdfUrl) : "";
  
  const dataAttrs = `data-doc-id="${safeDocId}"${safePdfUrl ? ` data-pdf-url="${safePdfUrl}"` : ''}`;
  
  // Add PDF indicator
  const pdfIndicator = safePdfUrl ? '<span class="pdf-badge" title="PDF available">📄</span>' : '';

  return `
    <div class="gold-card clickable-card" ${dataAttrs} style="cursor: pointer;">
      <img src="${imgSrc}" alt="">
      <h3>${safeTitle} ${pdfIndicator}</h3>
      <p>${safeDesc}</p>
    </div>
  `;
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

/********************************************************************
 * Parsing & Extraction
 ********************************************************************/
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
    
    // Extract image URL
    const imageUrl = sec?.image?.data?.attributes?.url || 
                     s?.image?.data?.attributes?.url || 
                     s?.image?.url || null;
    
    // Extract PDF URL using the resolver
    const pdfRaw = sec?.pdf || s?.pdf;
    const pdfUrl = resolvePdfUrl(pdfRaw);

    return {
      title: s.title,
      author: s.author,
      publish_on: s.publish_on,
      short_description: s.short_description,
      imageUrl: absUrl(imageUrl),
      pdfUrl: pdfUrl,
      docId: sec?.documentId || s?.documentId || null,
    };
  });

  return sections.sort(
    (a, b) => new Date(b.publish_on || 0).getTime() - new Date(a.publish_on || 0).getTime()
  );
}

/********************************************************************
 * Interaction: Cards
 ********************************************************************/
function attachCardClickHandlers(container) {
  if (!container) return;
  const clickableCards = container.querySelectorAll(".clickable-card:not([data-click-attached])");
  
  clickableCards.forEach((card) => {
    card.addEventListener("click", handleCardClick);
    card.setAttribute('data-click-attached', 'true');
  });
  
  console.log(`Attached click handlers to ${clickableCards.length} cards`);
}

function handleCardClick(event) {
  const card = event.currentTarget;
  const pdfUrl = card.getAttribute("data-pdf-url");
  const docId = card.getAttribute("data-doc-id");

  console.log('Card clicked - PDF URL:', pdfUrl, 'Doc ID:', docId);

  // Priority: PDF first, then news details
  if (isValidPdfUrl(pdfUrl)) {
    console.log('Opening PDF:', pdfUrl);
    
    try {
      const newWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.log('Popup blocked, showing confirmation');
        
        const shouldNavigate = confirm(
          'Popup blocked. Click OK to open the PDF in the current tab, or Cancel to stay on this page.'
        );
        
        if (shouldNavigate) {
          window.location.href = pdfUrl;
        }
      } else {
        console.log('PDF opened successfully');
        showMessage('PDF opened in new tab', 'success');
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      showMessage('Unable to open PDF', 'error');
    }
  } else if (docId && docId !== "null" && docId !== "") {
    console.log('Opening news details for:', docId);
    window.location.href = `news-details.html?id=${docId}`;
  } else {
    console.warn('No PDF or document ID available');
  }
}

/********************************************************************
 * "Most Read" & "Next Category"
 ********************************************************************/
async function fetchAndRenderMostRead() {
  const container = document.querySelector(".cards");
  if (!container) return;
  const mostReadItems = [];

  const first4Categories = allCategories.slice(0, 4);
  for (const cat of first4Categories) {
    const src = cat?.attributes ?? cat ?? {};
    const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
    if (!slug) continue;

    try {
      const res = await fetch(buildCategoryEndpoint(slug, 1));
      if (!res.ok) continue;
      const data = await res.json();
      const sections = extractSectionsFromResponse(data, slug);
      if (sections.length > 0) mostReadItems.push(sections[0]);
    } catch (err) {
      console.error("Error fetching most read news for", slug, err);
    }
  }

  if (mostReadItems.length) {
    const html = mostReadItems
      .map(
        (item) => `
        <div class="card clickable-card" 
             data-doc-id="${item.docId}" 
             data-pdf-url="${item.pdfUrl || ''}"
             data-click-attached="false">
          <div class="head-sec"><p>${escapeHTML(item.title)}</p></div>
          <p class="center">${escapeHTML(item.short_description || '')}</p>
          <small>${fmtDate(item.publish_on)}<br/>By: ${escapeHTML(item.author || "Mining Discovery")}</small>
        </div>
      `
      )
      .join("");
    container.innerHTML = html;
    attachCardClickHandlers(container);
  }
}

function getNextCategoryInfo(currentSlug) {
  if (!allCategories.length) return null;
  const currentIndex = allCategories.findIndex((cat) => {
    const src = cat?.attributes ?? cat ?? {};
    const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
    return slug === currentSlug;
  });
  const nextIndex = currentIndex === -1 || currentIndex === allCategories.length - 1 ? 0 : currentIndex + 1;
  const nextCategory = allCategories[nextIndex];
  const src = nextCategory?.attributes ?? nextCategory ?? {};
  return {
    name: src.title ?? src.category ?? src.name ?? "Unknown Category",
    slug: src.slug ?? (src.category ? safeSlugify(src.category) : null),
  };
}

function updateNextCategoryDisplay() {
  const nextCategoryEl = document.getElementById("nextCategoryTitle");
  if (!nextCategoryEl) return;
  const nextCategoryInfo = getNextCategoryInfo(currentCategorySlug);
  nextCategoryEl.textContent = nextCategoryInfo?.name || "No Next Category";
}

/********************************************************************
 * Category Fetch + Page Wiring
 ********************************************************************/
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
    console.log('Sections with PDF data:', sections.filter(s => s.pdfUrl).length);
    
    renderNewsSections(sections, append);

    if (!append) await fetchAndRenderMostRead();

    const categories = toArray(data?.data || []);
    const currentCategory = categories.find((cat) => {
      const src = cat?.attributes ?? cat ?? {};
      const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
      return slug === currentCategorySlug;
    });

    const headingEl = document.getElementById("categoryTitle");
    if (headingEl) {
      const categoryName =
        currentCategory?.attributes?.title ??
        currentCategory?.attributes?.name ??
        currentCategory?.attributes?.category ??
        currentCategorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      headingEl.textContent = categoryName;
    }

    updateNextCategoryDisplay();

    const nextCategoryInfo = getNextCategoryInfo(currentCategorySlug);
    if (nextCategoryInfo?.slug) {
      const nextEndpoint = buildCategoryEndpoint(nextCategoryInfo.slug, 1);
      const res2 = await fetch(nextEndpoint);
      const nextData = await res2.json();
      const nextSections = extractSectionsFromResponse(nextData, nextCategoryInfo.slug);
      renderNextCategoryPreview(nextSections);
    }

    const showMoreBtn = document.querySelector(".btn-more");
    if (showMoreBtn) {
      const shownCount = currentPage * pageSize;
      showMoreBtn.style.display = shownCount >= totalItems ? "none" : "block";
    }

    setActiveMenuItem(currentCategorySlug);
  } catch (err) {
    console.error("Error fetching news for", slug, err);
  }
}

/********************************************************************
 * Dropdown Menu (Navigation)
 ********************************************************************/
function generateDropdownMenu(categories) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  const dropdownMenu1 = document.getElementById("dropdownMenu1");

  const menuItems = categories.map((item) => {
    const src = item?.attributes ?? item ?? {};
    const title = src.title ?? src.category ?? src.name ?? `Category ${item?.id ?? ""}`;
    const slug = src.slug ?? (src.category ? safeSlugify(src.category) : null);
    if (!title || !slug) return null;

    return {
      title,
      slug,
      href: `newss.html?category=${encodeURIComponent(slug)}`
    };
  }).filter(Boolean);

  if (dropdownMenu) {
    if (dropdownMenu.tagName.toLowerCase() === "a") {
      const nav = document.createElement("nav");
      nav.id = dropdownMenu.id;
      dropdownMenu.replaceWith(nav);
    }

    const menu = document.getElementById("dropdownMenu");
    menu.innerHTML = "";

    menuItems.forEach((item) => {
      const a = document.createElement("a");
      a.textContent = item.title;
      a.href = item.href;
      a.dataset.slug = item.slug;
      a.className = "dropdown-item";
      menu.appendChild(a);
    });

    menu.addEventListener("click", handleMenuClick);
  }

  if (dropdownMenu1) {
    dropdownMenu1.innerHTML = "";

    menuItems.forEach((item) => {
      const a = document.createElement("a");
      a.textContent = item.title;
      a.href = item.href;
      a.dataset.slug = item.slug;
      a.className = "dropdown-item";
      dropdownMenu1.appendChild(a);
    });

    dropdownMenu1.addEventListener("click", handleMenuClick);
  }
}

function handleMenuClick(e) {
  const link = e.target.closest("a[data-slug]");
  if (!link) return;

  const url = new URL(link.href, window.location.href);
  const samePage = url.pathname === window.location.pathname;

  const slug = link.dataset.slug || "latest-news";

  if (samePage) {
    e.preventDefault();
    window.history.pushState({ slug }, "", `?category=${encodeURIComponent(slug)}`);
    fetchAndRenderCategory(slug, 1, false);
  }
}

/********************************************************************
 * Show More
 ********************************************************************/
function handleShowMoreClick() {
  fetchAndRenderCategory(currentCategorySlug, currentPage + 1, true);
}

/********************************************************************
 * Boot
 ********************************************************************/
document.addEventListener("DOMContentLoaded", async () => {
  try {
    allCategories = await newsCategory();
    console.log("Categories loaded:", allCategories.length);
    generateDropdownMenu(allCategories);

    const initialSlug = getSlugFromURL();

    await fetchAndRenderMostRead();
    await fetchAndRenderCategory(initialSlug, 1);

    const showMoreBtn = document.querySelector(".btn-more");
    if (showMoreBtn) showMoreBtn.addEventListener("click", handleShowMoreClick);

    const dropdownToggle = document.getElementById("dropdownToggle");
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle("show");
        dropdownToggle.setAttribute(
          "aria-expanded",
          dropdownMenu.classList.contains("show") ? "true" : "false"
        );
      });

      document.addEventListener("click", (e) => {
        const inside = dropdownMenu.contains(e.target) || dropdownToggle.contains(e.target);
        if (!inside) {
          dropdownMenu.classList.remove("show");
          dropdownToggle.setAttribute("aria-expanded", "false");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          dropdownMenu.classList.remove("show");
          dropdownToggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    window.addEventListener("popstate", (event) => {
      const slug = event.state?.slug || getSlugFromURL();
      fetchAndRenderCategory(slug, 1, false);
    });
  } catch (err) {
    console.error("Init error:", err);
  }
});

// Add CSS for PDF badge
const pdfBadgeStyle = document.createElement('style');
pdfBadgeStyle.textContent = `
  .pdf-badge {
    display: inline-block;
    margin-left: 6px;
    font-size: 14px;
    opacity: 0.8;
    vertical-align: middle;
    transition: opacity 0.2s, transform 0.2s;
  }
  
  .clickable-card:hover .pdf-badge {
    opacity: 1;
    transform: scale(1.1);
  }
`;
document.head.appendChild(pdfBadgeStyle);