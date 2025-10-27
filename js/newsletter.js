const API_BASE = 'https://admins.miningdiscovery.com/api';

/* ================= helpers ================= */
function toAbsoluteUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

// Safely read fields whether your API returns flat objects or Strapi-style nested attributes
function getAttr(obj, path, fallback = undefined) {
  return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj) ?? fallback;
}

function getTitle(item) {
  // newsletter/post title (your date like "June 1")
  return item?.title ?? getAttr(item, 'attributes.title') ?? 'Untitled';
}

function getCoverImageUrl(item) {
  // Common shapes: flat; nested with formats.medium; nested data->attributes
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
/* =========================================== */

// Fetch categories
async function fetchCategories() {
  const loading = document.getElementById('loadingCategories');
  const error = document.getElementById('errorMessage');
  loading.classList.remove('hidden');
  error.classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/newsletter-categories?populate=*`);
    const { data } = await res.json();

    if (!data || data.length === 0) return;

    // Sort categories by publishedAt descending to get latest first
    const sortedCategories = data.sort(
      (a, b) => new Date(getPublishedAt(b) || 0) - new Date(getPublishedAt(a) || 0)
    );

    displayCategories(sortedCategories);

    // Show latest month newsletters by default
    showNewsletters(sortedCategories[0]);

  } catch (err) {
    showError('Failed to load categories: ' + err.message);
  } finally {
    loading.classList.add('hidden');
  }
}

// Display category cards
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

// Load newsletters inline (shows title under each newsletter)
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

    // Optional: sort by publishedAt desc so latest first
    const sorted = data.sort(
      (a, b) => new Date(getPublishedAt(b) || 0) - new Date(getPublishedAt(a) || 0)
    );

    sorted.forEach(newsletter => {
      const card = document.createElement('div');
      card.className = 'newsletter-card';
      card.onclick = () => openPDFInNewTab(newsletter);

      // Cover image
      const img = document.createElement('img');
      img.src = getCoverImageUrl(newsletter);
      img.alt = getTitle(newsletter);

      // Title (your date like "June 1")
      const caption = document.createElement('div');
      caption.className = 'newsletter-title';
      caption.textContent = getTitle(newsletter);

      // Make sure it’s readable even on white backgrounds
      caption.style.color = '#111';
      caption.style.textAlign = 'center';
      caption.style.fontSize = '14px';
      caption.style.padding = '8px 6px 0';
      caption.style.lineHeight = '1.4';
      caption.style.wordBreak = 'break-word';

      card.appendChild(img);
      card.appendChild(caption);
      list.appendChild(card);
    });
  } catch (err) {
    showError('Failed to load newsletters: ' + err.message);
  } finally {
    loading.classList.add('hidden');
  }
}

// Open PDF in a new tab
function openPDFInNewTab(newsletter) {
  const pdfUrl = getPdfUrl(newsletter);
  if (pdfUrl) {
    window.open(pdfUrl, '_blank', 'noopener');
  } else {
    alert('PDF not available for this newsletter.');
  }
}

// Show error message
function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

// Initialize
fetchCategories();