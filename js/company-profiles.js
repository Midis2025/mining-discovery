const track = document.getElementById('carouselTrack');
const mainProfile = document.getElementById('mainProfile').querySelector('img');
const infoBox = document.getElementById('infoBox');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const wrapper = document.getElementById('carouselWrapper');
const pageNumbersContainer = document.getElementById('pageNumbers');
const viewPdfBtn = document.querySelector('.action-buttons .btn');

let ceoCards = [];
let cardsPerPage = 1;
let currentPage = 0;
let totalPages = 1;

// Cards per page based on screen width
function getCardsPerPage() {
  if (window.innerWidth <= 480) return 1;
  if (window.innerWidth <= 768) return 2;
  if (window.innerWidth <= 1024) return 3;
  return 6;
}

// Update carousel position
function updateCarousel() {
  if (!ceoCards.length) return;
  const cardWidth = ceoCards[0].offsetWidth + 20;
  const moveX = cardWidth * cardsPerPage * currentPage;
  track.style.transform = `translateX(-${moveX}px)`;

  document.querySelectorAll('.page-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === currentPage);
  });
}

// Pagination buttons
function renderPagination() {
  pageNumbersContainer.innerHTML = '';
  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.classList.add('page-btn');
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      updateCarousel();
    });
    pageNumbersContainer.appendChild(btn);
  }
}

// Prev / Next
prevBtn.addEventListener('click', () => {
  if (currentPage > 0) currentPage--;
  updateCarousel();
});
nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages - 1) currentPage++;
  updateCarousel();
});

// Fetch company profiles from backend
async function fetchCompanyProfiles() {
  try {
    const response = await fetch('https://admins.miningdiscovery.com/api/company-profiles?populate=*');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    const companies = result.data;

    track.innerHTML = '';

    companies.forEach(company => {
      const card = document.createElement('div');
      card.className = 'profile-cards';
      card.setAttribute('data-name', company.title);
      card.setAttribute('data-title', '');
      card.setAttribute('data-desc', company.shortDescription);

      // store PDF URL
      const pdfUrl = company.companyPdf && company.companyPdf[0] ? company.companyPdf[0].url : null;
      card.setAttribute('data-pdf', pdfUrl);

      const img = document.createElement('img');

      // Use medium format if available
      if (company.cover_image && company.cover_image[0] && company.cover_image[0].formats.medium) {
        img.src = company.cover_image[0].formats.medium.url;
      } else if (company.cover_image && company.cover_image[0]) {
        img.src = company.cover_image[0].url;
      } else {
        img.src = './image/placeholder.png';
      }

      img.alt = company.title;
      card.appendChild(img);
      track.appendChild(card);
    });

    // After cards are loaded
    ceoCards = Array.from(track.children);
    cardsPerPage = getCardsPerPage();
    currentPage = 0;
    totalPages = Math.ceil(ceoCards.length / cardsPerPage);

    // Attach click events to update main profile
    ceoCards.forEach(card => {
      card.addEventListener('click', () => {
        const imgSrc = card.querySelector('img').src;
        const name = card.dataset.name;
        const title = card.dataset.title;
        const desc = card.dataset.desc;
        const pdf = card.dataset.pdf;

        mainProfile.src = imgSrc;
        mainProfile.setAttribute('data-pdf', pdf); // store PDF in mainProfile

        infoBox.innerHTML = `
          <h3>${name}</h3>
          <h4>${title}</h4>
          <p>${desc}</p>
          <div class="divider"></div>
        `;
      });
    });

    renderPagination();
    updateCarousel();

  } catch (err) {
    console.error('Error fetching company profiles:', err);
  }
}

// 🔹 View PDF button click
viewPdfBtn.addEventListener('click', () => {
  const pdfUrl = mainProfile.dataset.pdf;
  if (pdfUrl) window.open(pdfUrl, '_blank');
  else alert('PDF not available for this company.');
});

// Swipe for mobile
let startX = 0;
let isDragging = false;

wrapper.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  isDragging = true;
});

wrapper.addEventListener('touchmove', e => {
  if (!isDragging) return;
  const currentX = e.touches[0].clientX;
  const diff = startX - currentX;

  if (Math.abs(diff) > 50) {
    if (diff > 0 && currentPage < totalPages - 1) currentPage++;
    else if (diff < 0 && currentPage > 0) currentPage--;
    updateCarousel();
    isDragging = false;
  }
});

wrapper.addEventListener('touchend', () => {
  isDragging = false;
});

// Resize handling
window.addEventListener('resize', () => {
  cardsPerPage = getCardsPerPage();
  totalPages = Math.ceil(ceoCards.length / cardsPerPage);
  currentPage = 0;
  renderPagination();
  updateCarousel();
});

// Initialize
fetchCompanyProfiles();