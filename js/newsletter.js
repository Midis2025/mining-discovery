const API_BASE = 'https://admins.miningdiscovery.com/api';

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
    const sortedCategories = data.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

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
    const imgUrl = category?.coverImage?.url ||
                   category?.coverImage?.formats?.medium?.url ||
                   'placeholder.jpg';
    img.src = imgUrl;
    img.alt = category?.name || 'Newsletter Category';

    const label = document.createElement('div');
    label.className = 'edition-label';
    label.textContent = category?.name || 'Unnamed Category';

    card.append(img, label);
    container.appendChild(card);
  });
}

// Load newsletters inline
async function showNewsletters(category) {
  const section = document.getElementById('newslettersSection');
  const title = document.getElementById('categoryTitle');
  const list = document.getElementById('newslettersList');
  const loading = document.getElementById('loadingNewsletters');

  section.classList.remove('hidden');
  list.innerHTML = '';
  title.textContent = 'Newsletter Stocks';
  loading.classList.remove('hidden');

  try {
    const categoryId = category.id;
    const res = await fetch(`${API_BASE}/post-newsletters?filters[newsletter_category][id][$eq]=${categoryId}&populate=*`);
    const { data } = await res.json();

    if (!data || data.length === 0) {
      list.innerHTML = '<p style="color:white;text-align:center;">No newsletters found for this category.</p>';
      return;
    }

    data.forEach(newsletter => {
      const card = document.createElement('div');
      card.className = 'newsletter-card';
      card.onclick = () => openPDFInNewTab(newsletter);

      const img = document.createElement('img');
      const imgUrl = newsletter?.coverImage?.url ||
                     newsletter?.coverImage?.formats?.medium?.url ||
                     'placeholder.jpg';
      img.src = imgUrl;
      img.alt = newsletter?.title || 'Newsletter';

      card.appendChild(img);
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
  const pdfUrl = newsletter?.pdfFile?.url;
  if (pdfUrl) {
    window.open(pdfUrl, '_blank');
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