/********************************************************************
 * Header Dropdown Initializer
 * Loads news categories for header dropdown on all pages
 ********************************************************************/

const API_ROOT_HEADER = "https://admins.miningdiscovery.com";

// Helper: Convert to array
function toArrayHeader(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  return [x];
}

// Helper: Slugify
function safeSlugifyHeader(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Fetch news categories
async function fetchNewsCategoriesForHeader() {
  try {
    const res = await fetch(`${API_ROOT_HEADER}/api/news-categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const payload = json?.data ?? json;
    return toArrayHeader(payload);
  } catch (error) {
    console.error("Error fetching news categories for header:", error);
    return [];
  }
}

// Define custom order for categories
const CATEGORY_ORDER = [
  'latest-news',
  'gold-news',
  'silver-news',
  'copper-news',
  'precious-metals',
  'corporate-news',
  'world-news',
  'leadership-thoughts',
  'morning-chatter',
  'announcement',
  'popular-this-week',
  'projects',
  'research-reports',
  'sponsored-post'
];

// Populate dropdown menu
function populateHeaderDropdown(categories) {
  const dropdownMenu1 = document.getElementById("dropdownMenu1");

  if (!dropdownMenu1) {
    console.warn("dropdownMenu1 not found in header");
    return;
  }

  const menuItems = categories.map((item) => {
    const src = item?.attributes ?? item ?? {};
    const title = src.title ?? src.category ?? src.name ?? `Category ${item?.id ?? ""}`;
    const slug = src.slug ?? (src.category ? safeSlugifyHeader(src.category) : null);

    if (!title || !slug) return null;

    return {
      title,
      slug,
      href: `newss.html?category=${encodeURIComponent(slug)}`
    };
  }).filter(Boolean);

  // Sort menu items according to CATEGORY_ORDER
  menuItems.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.slug);
    const indexB = CATEGORY_ORDER.indexOf(b.slug);

    // If both are in the order list, sort by position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only A is in the list, A comes first
    if (indexA !== -1) return -1;

    // If only B is in the list, B comes first
    if (indexB !== -1) return 1;

    // If neither is in the list, maintain original order (alphabetical fallback)
    return a.title.localeCompare(b.title);
  });

  // Clear existing content
  dropdownMenu1.innerHTML = "";

  // Add menu items
  menuItems.forEach((item) => {
    const a = document.createElement("a");
    a.textContent = item.title;
    a.href = item.href;
    a.dataset.slug = item.slug;
    a.className = "dropdown-item";
    dropdownMenu1.appendChild(a);
  });

  console.log(`Header dropdown populated with ${menuItems.length} categories in custom order`);
}

// Initialize header dropdown
async function initHeaderDropdown() {
  try {
    const categories = await fetchNewsCategoriesForHeader();
    if (categories && categories.length > 0) {
      populateHeaderDropdown(categories);
    } else {
      console.warn("No categories loaded for header dropdown");
    }
  } catch (error) {
    console.error("Error initializing header dropdown:", error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeaderDropdown);
} else {
  // DOM already loaded
  initHeaderDropdown();
}
