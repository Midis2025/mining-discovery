/* ================= config ================= */
const HOST = 'https://admins.miningdiscovery.com';
const API_BASE = `${HOST}/api`;   // API endpoints
/* ========================================= */

/* ================ helpers ================= */
function toAbsoluteUrl(url) {
  if (!url) return null;
  // Strapi asset URLs are usually like /uploads/...
  return url.startsWith('http') ? url : `${HOST}${url}`;
}

// Safely read fields whether your API returns flat objects or Strapi-style nested attributes
function getAttr(obj, path, fallback = undefined) {
  return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj) ?? fallback;
}

function getTitle(item) {
  return item?.title ?? getAttr(item, 'attributes.title') ?? 'Untitled';
}

function getCoverImageUrl(item) {
  const flatMedium = getAttr(item, 'coverImage.formats.medium.url');
  const flatUrl = getAttr(item, 'coverImage.url');
  const nestedMedium = getAttr(item, 'attributes.coverImage.data.attributes.formats.medium.url');
  const nestedUrl = getAttr(item, 'attributes.coverImage.data.attributes.url');
  return toAbsoluteUrl(flatMedium || flatUrl || nestedMedium || nestedUrl) || 'placeholder.jpg';
}

function getPdfUrl(item) {
  const flatPdf = getAttr(item, 'pdfFile.url');
  const nestedPdf = getAttr(item, 'attributes.pdfFile.data.attributes.url');
  return toAbsoluteUrl(flatPdf || nestedPdf);
}

function getCategoryName(cat) {
  return cat?.name ?? getAttr(cat, 'attributes.name') ?? 'Newsletters';
}

function getCategoryCoverUrl(cat) {
  const flatMedium = getAttr(cat, 'coverImage.formats.medium.url');
  const flatUrl = getAttr(cat, 'coverImage.url');
  const nestedMedium = getAttr(cat, 'attributes.coverImage.data.attributes.formats.medium.url');
  const nestedUrl = getAttr(cat, 'attributes.coverImage.data.attributes.url');
  return toAbsoluteUrl(flatMedium || flatUrl || nestedMedium || nestedUrl) || 'placeholder.jpg';
}

function getPublishedAt(item) {
  return item?.publishedAt ?? getAttr(item, 'attributes.publishedAt') ?? null;
}

/* Resolve the best timestamp for a newsletter for reliable sorting */
function getBestDate(item) {
  // 1) canonical fields
  const fields = [
    getPublishedAt(item),
    getAttr(item, 'date'),
    getAttr(item, 'attributes.date'),
    getAttr(item, 'publishDate'),
    getAttr(item, 'attributes.publishDate'),
    getAttr(item, 'createdAt'),
    getAttr(item, 'attributes.createdAt'),
    getAttr(item, 'updatedAt'),
    getAttr(item, 'attributes.updatedAt'),
  ];
  for (const d of fields) {
    const t = Date.parse(d);
    if (!isNaN(t)) return t;
  }

  // 2) parse from title like "September 8, 2025", "September 8 2025", "Sep 8, 2025", "Sept 8"
  const title = getTitle(item);
  const monthNames = "(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
  const re = new RegExp(`${monthNames}\\s+(\\d{1,2})?(?:,?\\s*(\\d{4}))?`, "i");
  const m = title.match(re);
  if (m) {
    const monthStr = m[1];
    const day = m[2] ? parseInt(m[2], 10) : 1;
    const yearHint =
      Date.parse(getPublishedAt(item)) ? new Date(getPublishedAt(item)).getFullYear()
      : (new Date()).getFullYear();
    const year = m[3] ? parseInt(m[3], 10) : yearHint;

    const months = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11};
    const lc = monthStr.toLowerCase();
    const key = /sept/.test(lc) ? 'sept' : lc.slice(0,3);
    const monthIdx = months[key];
    if (monthIdx != null) {
      const dt = new Date(year, monthIdx, day);
      const t = dt.getTime();
      if (!isNaN(t)) return t;
    }
  }

  // 3) last resort
  return 0;
}

/* Inject minimal CSS to force row-major ordering (prevents masonry/columns scrambling) */
let _rowGridInjected = false;
function ensureRowMajorGrid(listEl) {
  if (!_rowGridInjected) {
    const css = `
      #newslettersList.row-grid {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        grid-auto-flow: row dense;
        gap: 24px;
      }
      #newslettersList { 
        column-count: initial !important;
        column-gap: normal !important;
      }
      #newslettersList .newsletter-card { break-inside: avoid; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    _rowGridInjected = true;
  }
  listEl.classList.add('row-grid');
}
/* =========================================== */

/* ============== fetch categories ============== */
async function fetchCategories() {
  const loading = document.getElementById('loadingCategories');
  const error = document.getElementById('errorMessage');
  loading.classList.remove('hidden');
  error.classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/newsletter-categories?populate=*`);
    const { data } = await res.json();

    if (!data || data.length === 0) return;

    // latest first
    const sortedCategories = data.sort(
      (a, b) => new Date(getPublishedAt(b) || 0) - new Date(getPublishedAt(a) || 0)
    );

    displayCategories(sortedCategories);
    // default: show latest category
    showNewsletters(sortedCategories[0]);
  } catch (err) {
    showError('Failed to load categories: ' + err.message);
  } finally {
    loading.classList.add('hidden');
  }
}

/* ============ display category cards ============ */
function displayCategories(categories) {
  const container = document.getElementById('categoriesList');
  container.innerHTML = '';

  categories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'magazine-card';
    card.onclick = () => showNewsletters(category);

    const img = document.createElement('img');
    img.src = getCategoryCoverUrl(category);
    img.alt = getCategoryName(category);

    const label = document.createElement('div');
    label.className = 'edition-label';
    label.textContent = getCategoryName(category);

    card.append(img, label);
    container.appendChild(card);
  });
}

/* ============== load newsletters for category ============== */
async function showNewsletters(category) {
  const section = document.getElementById('newslettersSection');
  const titleEl = document.getElementById('categoryTitle');
  const list = document.getElementById('newslettersList');
  const loading = document.getElementById('loadingNewsletters');

  section.classList.remove('hidden');
  list.innerHTML = '';
  titleEl.textContent = `Newsletters — ${getCategoryName(category)}`;
  loading.classList.remove('hidden');

  try {
    const categoryId = category?.id ?? getAttr(category, 'id');
    const res = await fetch(
      `${API_BASE}/post-newsletters?filters[newsletter_category][id][$eq]=${categoryId}&populate=*`
    );
    const { data } = await res.json();

    if (!data || data.length === 0) {
      list.innerHTML = '<p style="color:#111;text-align:center;">No newsletters found for this category.</p>';
      return;
    }

    // Sort latest → oldest by robust timestamp
    const sorted = data
      .map(n => ({ n, ts: getBestDate(n) }))
      .sort((a, b) => b.ts - a.ts)
      .map(x => x.n);

    // Force row-major visual order
    ensureRowMajorGrid(list);

    const frag = document.createDocumentFragment();
    sorted.forEach((newsletter, idx) => {
      const card = document.createElement('div');
      card.className = 'newsletter-card';
      card.onclick = () => openPDFInNewTab(newsletter);
      card.style.order = String(idx);  // preserve DOM order in flex/grid if any

      const img = document.createElement('img');
      img.src = getCoverImageUrl(newsletter);
      img.alt = getTitle(newsletter);

      const caption = document.createElement('div');
      caption.className = 'newsletter-title';
      caption.textContent = getTitle(newsletter);
      caption.style.color = '#111';
      caption.style.textAlign = 'center';
      caption.style.fontSize = '14px';
      caption.style.padding = '8px 6px 0';
      caption.style.lineHeight = '1.4';
      caption.style.wordBreak = 'break-word';

      card.appendChild(img);
      card.appendChild(caption);
      frag.appendChild(card);
    });
    list.appendChild(frag);
  } catch (err) {
    showError('Failed to load newsletters: ' + err.message);
  } finally {
    loading.classList.add('hidden');
  }
}

/* ============== actions & errors ============== */
function openPDFInNewTab(newsletter) {
  const pdfUrl = getPdfUrl(newsletter);
  if (pdfUrl) {
    window.open(pdfUrl, '_blank', 'noopener');
  } else {
    alert('PDF not available for this newsletter.');
  }
}

function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

/* init */
fetchCategories();