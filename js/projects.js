async function loadProjects() {
  const url = "https://admins.miningdiscovery.com/api/projects?populate[project_image]=true";
  const projectsContainer = document.getElementById("projects");

  if (!projectsContainer) {
    console.warn("Projects container not found");
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    console.log("✅ Projects loaded:", payload.data?.length || 0);

    let sections = payload.data || [];

    if (sections.length === 0) {
      projectsContainer.innerHTML = '<p style="text-align:center; color:#999;">No projects available</p>';
      return;
    }

    const view = sections.map((item) => {
      return `
       <div class="section-box">
          <img src="${item.project_image?.url || ""}" alt="${item.project_title || "Project"}">
          <p>
            <a href="full-news.html?id=${item.id}" class="project-link" data-id="${item.id}">
              ${item.project_title || ""}
            </a>
          </p>
       </div>
      `;
    });

    projectsContainer.innerHTML = view.join("");

    // Attach click listeners (optional if you want JS-controlled navigation)
    document.querySelectorAll(".project-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const projectId = link.getAttribute("data-id");
        // Navigate to full-news page
        window.location.href = `full-news.html?id=${projectId}`;
      });
    });
  } catch (err) {
    console.error("❌ Error loading projects:", err);
    projectsContainer.innerHTML = `<p style="color:#b00; text-align:center;">Failed to load projects.</p>`;
  }
}

// Make function globally accessible
window.loadProjects = loadProjects;