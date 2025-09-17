const API_URL = "https://admins.miningdiscovery.com/api/multimedia-and-youtubes?populate=multimedia_category";

        let currentPage = 1;
        let hasMoreData = true;
        let allVideosData = {};
        const ITEMS_PER_PAGE = 25;

        async function loadVideos(page = 1, append = false) {
            try {
                const url = `${API_URL}&pagination[page]=${page}&pagination[pageSize]=${ITEMS_PER_PAGE}`;
                const res = await fetch(url);
                const data = await res.json();

                console.log(`🔎 API Response (Page ${page}):`, data);

                const container = document.getElementById("video-container");
                if (!container) {
                    console.error("No #video-container found in DOM");
                    return;
                }

                if (!append) {
                    container.innerHTML = "";
                    allVideosData = {};
                }

                const videosReceived = data.data?.length || 0;
                hasMoreData = videosReceived === ITEMS_PER_PAGE;
                currentPage = page;

                (data.data || []).forEach((video) => {
                    const { title = "Untitled Video", iframe = "" } = video;
                    const category = video.multimedia_category?.title || "Uncategorized";

                    if (!allVideosData[category]) {
                        allVideosData[category] = [];
                    }
                    
                    const isDuplicate = allVideosData[category].some(existingVideo => 
                        existingVideo.title === title && existingVideo.iframe === iframe
                    );
                    
                    if (!isDuplicate) {
                        allVideosData[category].push({ title, iframe });
                    }
                });

                renderCategories(container);

                console.log(`📊 Total videos loaded: ${getTotalVideosCount()}`);
                console.log(`📂 Categories: ${Object.keys(allVideosData).join(', ')}`);

            } catch (err) {
                console.error("Error loading videos:", err);
                const container = document.getElementById("video-container");
                if (container) {
                    container.innerHTML = '<div class="no-videos">Failed to load videos. Please try again.</div>';
                }
            }
        }

        function renderCategories(container) {
            // Remove any existing event listeners
            document.querySelectorAll('.slider-btn').forEach(btn => {
                btn.removeEventListener('click', handleSliderClick);
            });

            container.innerHTML = "";

            if (Object.keys(allVideosData).length === 0) {
                container.innerHTML = '<div class="no-videos">No videos available.</div>';
                return;
            }

            Object.entries(allVideosData).forEach(([category, videos]) => {
                if (videos.length === 0) return;

                const categorySection = document.createElement("div");
                categorySection.classList.add("category-section");
                categorySection.setAttribute("data-category", category);
                
                const heading = document.createElement("div");
                heading.classList.add("play-heading");
                heading.innerHTML = `<h2>${category} <span class="video-count">(${videos.length} videos)</span></h2>`;
                categorySection.appendChild(heading);

                const sliderContainer = document.createElement("div");
                sliderContainer.classList.add("slider-container");

                if (videos.length > 3) {
                    const prevBtn = document.createElement("button");
                    prevBtn.classList.add("slider-btn", "prev-btn");
                    prevBtn.innerHTML = "‹";
                    prevBtn.setAttribute("data-category", category);
                    prevBtn.addEventListener('click', handleSliderClick);
                    
                    const nextBtn = document.createElement("button");
                    nextBtn.classList.add("slider-btn", "next-btn");
                    nextBtn.innerHTML = "›";
                    nextBtn.setAttribute("data-category", category);
                    nextBtn.addEventListener('click', handleSliderClick);
                    
                    sliderContainer.appendChild(prevBtn);
                    sliderContainer.appendChild(nextBtn);
                }
                
                const playlist = document.createElement("div");
                playlist.classList.add("playlist", "slider");
                playlist.setAttribute("data-playlist", category);
                playlist.setAttribute("data-current-slide", "0");

                videos.forEach(({ title, iframe }, index) => {
                    const card = document.createElement("div");
                    card.classList.add("playlist-card");
                    
                    if (index >= 3) {
                        card.style.display = "none";
                    }

                    card.innerHTML = `
                        <div class="video-wrapper">
                            ${iframe}
                        </div>
                        <p>${title}</p>
                    `;

                    playlist.appendChild(card);
                });

                sliderContainer.appendChild(playlist);
                categorySection.appendChild(sliderContainer);
                container.appendChild(categorySection);
            });

            // Initialize button states
            initializeSliderStates();
        }

        function handleSliderClick(event) {
            const button = event.currentTarget;
            const category = button.getAttribute('data-category');
            const isNext = button.classList.contains('next-btn');
            const playlist = document.querySelector(`[data-playlist="${category}"]`);
            const cards = playlist.querySelectorAll('.playlist-card');
            const totalCards = cards.length;
            
            if (totalCards <= 3) return;
            
            let currentSlide = parseInt(playlist.getAttribute('data-current-slide'));
            const maxSlides = Math.ceil(totalCards / 3) - 1;
            
            if (isNext && currentSlide < maxSlides) {
                currentSlide++;
            } else if (!isNext && currentSlide > 0) {
                currentSlide--;
            } else {
                return; // No change needed
            }
            
            playlist.setAttribute('data-current-slide', currentSlide);
            updateSliderView(playlist, currentSlide, category);
            updateSliderButtons(category, currentSlide, maxSlides);
        }

        function initializeSliderStates() {
            Object.keys(allVideosData).forEach(category => {
                const videos = allVideosData[category];
                if (videos.length > 3) {
                    const maxSlides = Math.ceil(videos.length / 3) - 1;
                    updateSliderButtons(category, 0, maxSlides);
                }
            });
        }

        function updateSliderView(playlist, slideIndex, category) {
            const cards = playlist.querySelectorAll('.playlist-card');
            const startIndex = slideIndex * 3;
            const endIndex = startIndex + 3;
            
            // First hide all cards
            cards.forEach(card => {
                card.style.display = 'none';
                card.classList.remove('slide-in');
            });
            
            // Then show and animate the current slide's cards
            setTimeout(() => {
                cards.forEach((card, index) => {
                    if (index >= startIndex && index < endIndex) {
                        card.style.display = 'block';
                        card.classList.add('slide-in');
                    }
                });
            }, 50);
        }

        function updateSliderButtons(category, currentSlide, maxSlides) {
            const prevBtn = document.querySelector(`.prev-btn[data-category="${category}"]`);
            const nextBtn = document.querySelector(`.next-btn[data-category="${category}"]`);
            
            if (prevBtn) {
                prevBtn.disabled = currentSlide === 0;
            }
            
            if (nextBtn) {
                nextBtn.disabled = currentSlide >= maxSlides;
            }
        }

        function getTotalVideosCount() {
            return Object.values(allVideosData).reduce((total, videos) => total + videos.length, 0);
        }

        async function loadAllVideosAtOnce() {
            try {
                const countRes = await fetch(`${API_URL}&pagination[page]=1&pagination[pageSize]=1`);
                const countData = await countRes.json();
                
                let totalItems = 1000;
                if (countData.meta?.pagination?.total) {
                    totalItems = countData.meta.pagination.total;
                }

                console.log(`🔢 Attempting to load ${totalItems} total items`);

                const allRes = await fetch(`${API_URL}&pagination[pageSize]=${totalItems}`);
                const allData = await allRes.json();
                
                console.log("🎯 All videos loaded:", allData);

                const container = document.getElementById("video-container");
                if (!container) {
                    console.error("No #video-container found in DOM");
                    return;
                }
                
                container.innerHTML = "";
                allVideosData = {};
                hasMoreData = false;

                (allData.data || []).forEach((video) => {
                    const { title = "Untitled Video", iframe = "" } = video;
                    const category = video.multimedia_category?.title || "Uncategorized";

                    if (!allVideosData[category]) {
                        allVideosData[category] = [];
                    }
                    allVideosData[category].push({ title, iframe });
                });

                renderCategories(container);

                console.log(`✅ Successfully loaded ${getTotalVideosCount()} videos across ${Object.keys(allVideosData).length} categories`);

            } catch (error) {
                console.error("Error loading all videos at once:", error);
                console.log("Falling back to paginated loading...");
                loadVideos(1);
            }
        }

        function addLoadAllButton() {
            let loadAllBtn = document.getElementById("load-all-btn");
            
            if (!loadAllBtn) {
                loadAllBtn = document.createElement("button");
                loadAllBtn.id = "load-all-btn";
                loadAllBtn.classList.add("load-all-button");
                loadAllBtn.textContent = "Load All Videos at Once";
                
                loadAllBtn.addEventListener("click", async () => {
                    loadAllBtn.disabled = true;
                    loadAllBtn.textContent = "Loading all videos...";
                    
                    await loadAllVideosAtOnce();
                    
                    loadAllBtn.style.display = "none";
                });

                const container = document.getElementById("video-container");
                if (container && container.parentNode) {
                    container.parentNode.insertBefore(loadAllBtn, container.nextSibling);
                }
            }
        }

        // Initialize on page load
        document.addEventListener("DOMContentLoaded", () => {
            loadVideos(1);
            addLoadAllButton();
        });