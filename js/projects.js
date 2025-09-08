async function loadProjects() {
  const url =
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/projects?populate[project_image]=true";
  const projectsContainer = document.getElementById("projects");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    console.log("payload", payload.data);

    let sections = payload.data;

    const view = sections.map((item) => {
      return `
       <div class="section-box">
          <img src="${item.project_image?.url || ""}" alt="">
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
    console.error(err);
    projectsContainer.innerHTML = `<p style="color:#b00">Failed to load news.</p>`;
  }
}