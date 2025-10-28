function getImageUrl(item) {
  // Try common media field names and shapes (v5/v4, single/array)
  let m = item?.image ?? item?.cover ?? item?.thumbnail ?? null;
  if (!m) return null;
  if (Array.isArray(m)) m = m[0] || null;

  let url =
    m?.url ||
    m?.data?.attributes?.url ||
    m?.formats?.thumbnail?.url ||
    null;

  if (url && url.startsWith("/")) {
    url = "https://acceptable-desire-0cca5bb827.strapiapp.com" + url;
  }
  return url;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const day = d.getDate();
  const ord = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  const month = d.toLocaleString("en-GB", { month: "long" });
  const year = d.getFullYear();
  return `${day}${ord(day)} ${month} ${year}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
/**
 * Create SEO-friendly article slug from title and document ID
 * @param {string} title - Article title
 * @param {string} docId - Document ID
 * @returns {string} URL-safe slug like "gold-prices-rise-2024-abc123"
 */
function createArticleSlug(title, docId) {
  if (!title || !docId) return docId || '';
  
  // Create slug from title
  const titleSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '')    // Remove leading/trailing hyphens
    .substring(0, 60);          // Limit length to 60 chars
  
  // Combine title slug with docId
  return titleSlug ? `${titleSlug}-${docId}` : docId;
}

/**
 * Extract document ID from article slug
 * @param {string} slug - Article slug like "gold-prices-rise-2024-abc123"
 * @returns {string} Document ID (last part after final hyphen)
 */
function extractDocIdFromSlug(slug) {
  if (!slug) return '';
  
  // The docId is the last part after the final hyphen
  const parts = slug.split('-');
  return parts[parts.length - 1] || slug;
}
