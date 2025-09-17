// JS - Morning Chatter Script with PDF Support (Fixed Version)
const API_ROOT = "https://acceptable-desire-0cca5bb827.strapiapp.com";
const ENDPOINT =
  API_ROOT +
  "/api/news-categories?filters[slug][$eq]=evening-chatter" +
  "&populate[news_sections][fields][0]=title" +
  "&populate[news_sections][fields][1]=author" +
  "&populate[news_sections][fields][2]=publish_on" +
  "&populate[news_sections][fields][3]=short_description" +
  "&populate[news_sections][populate][image]=true" +
  "&populate[news_sections][populate][pdf]=true";

const BATCH = 5;
const DESC_WORD_LIMIT = 30;

const morningChatterNewsContainer = document.getElementById("morningChatterNews");
const showMoreBtn = document.getElementById("showMoreBtn");

let _items = [];
let _nextIndex = 0;

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripTags(html = "") {
  return String(html).replace(/<\/?[^>]+(>|$)/g, "");
}

function truncateWords(text = "", limit = 30) {
  const words = String(text).trim().split(/\s+/);
  if (words.length <= limit) return String(text).trim();
  return words.slice(0, limit).join(" ");
}

function fmtDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function resolveImageUrl(raw) {
  if (!raw) return "./image/mrng.png";
  
  const url = raw?.data?.attributes?.url || 
              raw?.attributes?.url || 
              raw?.url || 
              null;
              
  if (!url) return "./image/mrng.png";
  return url.startsWith("http") ? url : API_ROOT + url;
}

function resolvePdfUrl(raw) {
  console.log('PDF raw data:', raw); // Debug log
  
  if (!raw) {
    console.log('No PDF raw data');
    return null;
  }
  
  let url = null;
  
  // Handle array structure (which seems to be the case based on logs)
  if (Array.isArray(raw) && raw.length > 0) {
    const firstItem = raw[0];
    console.log('First PDF item in array:', firstItem); // Debug log
    
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
      // Handle nested array structure
      url = raw.data[0].attributes.url;
    }
  }
  
  console.log('Extracted PDF URL:', url); // Debug log
  
  if (!url) {
    console.log('No URL found in PDF data structure');
    return null;
  }
  
  const fullUrl = url.startsWith("http") ? url : API_ROOT + url;
  console.log('Final PDF URL:', fullUrl); // Debug log
  
  return fullUrl;
}

function normalizeSections(payload) {
  try {
    console.log('Full API payload:', payload); // Debug log
    
    const cat = payload?.data?.[0];
    if (!cat) return [];
    
    let nodes = [];

    // Handle different Strapi response structures
    if (cat?.attributes?.news_sections?.data) {
      nodes = cat.attributes.news_sections.data.map((n) => n?.attributes || n);
    } else if (cat?.attributes?.news_sections) {
      nodes = Array.isArray(cat.attributes.news_sections) ? cat.attributes.news_sections : [];
    } else if (cat?.news_sections) {
      nodes = Array.isArray(cat.news_sections) ? cat.news_sections : [];
    }

    console.log('Raw nodes:', nodes); // Debug log

    const normalizedItems = nodes.map((a, index) => {
      console.log(`Processing item ${index}:`, a); // Debug log
      console.log(`PDF data for item ${index}:`, a?.pdf); // Debug log
      
      const item = {
        title: a?.title || "",
        author: a?.author || "",
        publish_on: a?.publish_on || a?.publishOn || "",
        short_description: a?.short_description || a?.shortDescription || "",
        imageUrl: resolveImageUrl(a?.image),
        pdfUrl: resolvePdfUrl(a?.pdf),
        documentId: a?.documentId || a?.id || "",
      };
      
      console.log(`Normalized item ${index}:`, item); // Debug log
      return item;
    });

    // Sort by publish_on (newest first)
    const sortedItems = normalizedItems.sort((a, b) => {
      const dateA = new Date(a.publish_on || 0).getTime();
      const dateB = new Date(b.publish_on || 0).getTime();
      return dateB - dateA;
    });

    console.log('Final normalized items:', sortedItems); // Debug log
    return sortedItems;
    
  } catch (error) {
    console.error("Error normalizing sections:", error);
    return [];
  }
}

function cardHTML(item) {
  const title = escapeHtml(item.title || "Untitled");
  const author = escapeHtml(item.author || "Unknown");
  const date = fmtDate(item.publish_on);
  const docId = escapeHtml(item.documentId || "");

  const descPlain = stripTags(item.short_description || "");
  const descLimited = truncateWords(descPlain, DESC_WORD_LIMIT);
  const desc = escapeHtml(descLimited);
  
  const pdfUrl = item.pdfUrl ? escapeHtml(item.pdfUrl) : "";
  const dataAttrs = `data-doc-id="${docId}"${pdfUrl ? ` data-pdf-url="${pdfUrl}"` : ''}`;

  // Add visual indicator for PDF availability
  const pdfIndicator = pdfUrl ? '<span class="pdf-indicator" style="color: #d4af37; font-size: 12px;"></span>' : '';

  return `
    <div class="news-card clickable-card" ${dataAttrs} style="cursor: pointer;">
      <img src="${item.imageUrl}" alt="${title}" class="card-clickable">
      <div class="text-content">
        <h3 class="card-clickable">${title}${pdfIndicator}</h3>
        <hr class="custom-line">
        <p class="card-clickable">${desc} <span><a href="javascript:void(0)" class="read-more-inline card-clickable">read more.....</a></span></p>
        <span>${date}</span>
        <p>${author}</p>
      </div>
    </div>
  `;
}

function handleCardClick(event) {
  try {
    const target = event.target;
    const card = event.currentTarget;
    
    // Check if clicked element is clickable
    if (!target.classList.contains('card-clickable') && 
        !target.classList.contains('clickable-card')) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const pdfUrl = card.getAttribute('data-pdf-url');
    const docId = card.getAttribute('data-doc-id');
    
    console.log('Card clicked - PDF URL:', pdfUrl, 'Doc ID:', docId); // Debug log
    
    // Priority: PDF first, then news details
    if (pdfUrl && pdfUrl.trim() !== '' && pdfUrl !== 'null') {
      console.log('Opening PDF in new tab:', pdfUrl);
      
      // Try to open PDF in new tab
      const newWindow = window.open(pdfUrl, '_blank');
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        console.log('Popup blocked, trying direct navigation');
        // Fallback: try direct navigation
        window.location.href = pdfUrl;
      }
      
    } else if (docId && docId.trim() !== '' && docId !== 'null') {
      console.log('Opening news details for:', docId);
      window.location.href = `news-details.html?id=${docId}`;
    } else {
      console.warn('No PDF or document ID available for this card');
      alert('No PDF or detailed content available for this item.');
    }
  } catch (error) {
    console.error('Error handling card click:', error);
    alert('Error opening content. Please try again.');
  }
}

function attachCardClickHandlers() {
  if (!morningChatterNewsContainer) return;
  
  const newCards = morningChatterNewsContainer.querySelectorAll('.clickable-card:not(.click-handler-attached)');
  
  newCards.forEach(card => {
    card.addEventListener('click', handleCardClick);
    card.classList.add('click-handler-attached');
  });
  
  console.log(`Attached click handlers to ${newCards.length} new cards`);
}

function renderNextBatch() {
  if (!_items.length || !morningChatterNewsContainer) return;

  const slice = _items.slice(_nextIndex, _nextIndex + BATCH);
  if (!slice.length) return;

  try {
    morningChatterNewsContainer.insertAdjacentHTML(
      "beforeend",
      slice.map(cardHTML).join("")
    );

    attachCardClickHandlers();

    _nextIndex += slice.length;
    
    if (showMoreBtn) {
      showMoreBtn.style.display = _nextIndex >= _items.length ? "none" : "block";
    }
    
    console.log(`Rendered batch: ${slice.length} items (${_nextIndex}/${_items.length} total)`);
  } catch (error) {
    console.error('Error rendering batch:', error);
  }
}

async function morningChatterNews() {
  if (!morningChatterNewsContainer) {
    console.error('morningChatterNewsContainer not found');
    return;
  }

  if (showMoreBtn) showMoreBtn.disabled = true;

  try {
    console.log('Fetching from:', ENDPOINT); // Debug log
    const res = await fetch(ENDPOINT);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    _items = normalizeSections(payload);
    _nextIndex = 0;
    morningChatterNewsContainer.innerHTML = "";

    if (!_items.length) {
      morningChatterNewsContainer.innerHTML = `<p>No Morning Chatter news found.</p>`;
      if (showMoreBtn) showMoreBtn.style.display = "none";
      return;
    }

    console.log("Morning Chatter items loaded:", _items.map(item => ({
      title: item.title.substring(0, 50) + (item.title.length > 50 ? '...' : ''),
      has_pdf: !!item.pdfUrl,
      pdf_url: item.pdfUrl,
      date: fmtDate(item.publish_on)
    })));

    renderNextBatch();
    if (showMoreBtn) showMoreBtn.disabled = false;
    
  } catch (err) {
    console.error('Error loading Morning Chatter news:', err);
    morningChatterNewsContainer.innerHTML = `<p style="color:#b00;">Failed to load news. Please check console for details.</p>`;
    if (showMoreBtn) showMoreBtn.style.display = "none";
  }
}

// Add CSS for PDF indicator
const style = document.createElement('style');
style.textContent = `
  .pdf-indicator {
    margin-left: 8px;
    font-weight: bold;
  }
  .clickable-card:hover .pdf-indicator {
    color: #f4d03f !important;
  }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM loaded, initializing Morning Chatter...');
  
  // Initialize
  morningChatterNews();
  
  // Add show more button handler
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", renderNextBatch);
  }
});