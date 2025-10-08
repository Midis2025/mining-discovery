const track = document.getElementById('carouselTrack');
const mainProfile = document.getElementById('mainProfile').querySelector('img');
const infoBox = document.getElementById('infoBox');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const wrapper = document.getElementById('carouselWrapper');

const viewBtn = document.getElementById('viewPdfBtn');

let ceoCards = [];
let cardsPerPage = 0;
let currentPage = 0;
let totalPages = 0;
let currentPdfUrl = ''; // Currently displayed CEO's PDF
let allCEOs = []; // Store all CEO objects

// Display CEO in main profile
function displayCEOProfile(ceo) {
  mainProfile.src = ceo.img;
  infoBox.innerHTML = `
    <div class="divider"></div>
    <h3>${ceo.name}</h3>
    <h4>${ceo.title}</h4>
    <p>${ceo.desc}</p>
    <div class="divider"></div>
  `;

  if (ceo.pdf) {
    currentPdfUrl = ceo.pdf;
    viewBtn.style.display = 'inline-block';
  } else {
    currentPdfUrl = '';
    viewBtn.style.display = 'none';
  }
}

// View button opens PDF in new tab
viewBtn.onclick = () => currentPdfUrl && window.open(currentPdfUrl, "_blank");

// Detect cards per page
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
  track.style.transform = `translateX(-${cardWidth * cardsPerPage * currentPage}px)`;
}

// Initialize carousel
function initCarousel() {
  ceoCards = Array.from(track.querySelectorAll('.profile-cards'));
  cardsPerPage = getCardsPerPage();
  totalPages = Math.ceil(ceoCards.length / cardsPerPage);
  currentPage = 0;

  ceoCards.forEach(card => {
    card.addEventListener('click', () => {
      const ceo = {
        name: card.dataset.name,
        title: card.dataset.title,
        desc: card.dataset.desc,
        img: card.querySelector('img').src,
        pdf: card.dataset.pdf !== '#' ? card.dataset.pdf : ''
      };
      displayCEOProfile(ceo);
      document.getElementById('mainProfile').scrollIntoView({ behavior: 'smooth' });
    });
  });

  updateCarousel();
}

// Fetch CEO profiles from backend
async function fetchCeoProfiles() {
  try {
    const response = await fetch('https://admins.miningdiscovery.com/api/ceo-profiles?populate=*');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const { data } = await response.json();
    track.innerHTML = '';
    allCEOs = [];

    // Add all CEOs to carousel and allCEOs array
    data.forEach(item => {
      const ceo = {
        name: item.name || "Unnamed CEO",
        title: item.designation || "Unknown Designation",
        desc: item.shortDescription || "No description available.",
        pdf: item.ceo_pdf?.[0]?.url || '',
        img: item.cover_image?.[0]?.formats?.medium?.url
          || item.cover_image?.[0]?.url
          || 'https://via.placeholder.com/200x200?text=CEO'
      };
      allCEOs.push(ceo);

      const card = document.createElement('div');
      card.classList.add('profile-cards');
      card.dataset.name = ceo.name;
      card.dataset.title = ceo.title;
      card.dataset.desc = ceo.desc;
      card.dataset.pdf = ceo.pdf || '#';
      card.innerHTML = `<img src="${ceo.img}" alt="${ceo.name}">`;
      track.appendChild(card);
    });

    initCarousel();

    // Display a random CEO in main profile initially
    if (allCEOs.length) {
      const randomCEO = allCEOs[Math.floor(Math.random() * allCEOs.length)];
      displayCEOProfile(randomCEO);
    }
  } catch (err) {
    console.error('Error fetching CEO profiles:', err);
  }
}

// Carousel buttons
prevBtn.addEventListener('click', () => {
  if (currentPage > 0) currentPage--;
  updateCarousel();
});

nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages - 1) currentPage++;
  updateCarousel();
});

// Swipe support
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

// Resize responsiveness
window.addEventListener('resize', () => {
  cardsPerPage = getCardsPerPage();
  totalPages = Math.ceil(ceoCards.length / cardsPerPage);
  currentPage = 0;
  updateCarousel();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', fetchCeoProfiles);