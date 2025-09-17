// news-details.js
const API_ROOT = "https://admins.miningdiscovery.com";

// ✅ Convert Strapi Rich Text (JSON) to HTML
function renderRichText(node) {
  if (!node) return "";

  if (Array.isArray(node)) {
    return node.map(renderRichText).join("");
  }

  // Paragraphs
  if (node.type === "paragraph") {
    const inner = renderRichText(node.children);
    return inner.trim() ? `<p>${inner}</p>` : "";
  }

  // Headings
  if (node.type && node.type.startsWith("heading")) {
    const level = node.level || 2;
    return `<h${level}>${renderRichText(node.children)}</h${level}>`;
  }

  // Lists
  if (node.type === "list") {
    const tag = node.format === "ordered" ? "ol" : "ul";
    return `<${tag}>${renderRichText(node.children)}</${tag}>`;
  }

  if (node.type === "list-item") {
    return `<li>${renderRichText(node.children)}</li>`;
  }

  // Text
  if (node.text !== undefined) {
    let text = node.text;
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    return text;
  }

  // Children fallback
  if (node.children) {
    return renderRichText(node.children);
  }

  return "";
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id"),
    category: params.get("category")
  };
}

// ✅ Pick the best available image format
function getImageUrl(image) {
  if (!image) return "";
  if (image.formats?.large?.url) return image.formats.large.url;
  if (image.formats?.medium?.url) return image.formats.medium.url;
  if (image.formats?.small?.url) return image.formats.small.url;
  if (image.formats?.thumbnail?.url) return image.formats.thumbnail.url;
  if (image.url) return image.url;
  return "";
}

// ✅ Format plain text description to HTML
function formatPlainDescription(description) {
  if (!description) return "";
  
  return description
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => {
      // Skip image markdown lines
      if (paragraph.startsWith('![')) {
        return '';
      }
      return `<p>${paragraph}</p>`;
    })
    .join('');
}

async function loadNewsDetails() {
  const { id, category } = getQueryParams();
  
  if (!id) {
    document.getElementById("newsDetails").innerHTML = `<p>Invalid news item.</p>`;
    return;
  }

  try {
    let newsSection = null;

    // If it's a sponsored post, fetch from sponsored posts API
    if (category === 'sponsored-post') {
      const res = await fetch(`${API_ROOT}/api/news-categories?filters[slug][$eq]=sponsored-post&populate[news_sections][populate]=*`);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      const posts = data?.data?.[0]?.news_sections || [];
      newsSection = posts.find(post => post.id.toString() === id);
      
      if (!newsSection) {
        throw new Error('Sponsored post not found');
      }
    } else {
      // Try direct news section fetch for other categories
      let res = await fetch(`${API_ROOT}/api/news-sections/${id}?populate=image`);
      
      if (!res.ok) {
        // Fallback to news endpoint
        res = await fetch(`${API_ROOT}/api/news?populate=news_sections.image`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const newsData = await res.json();
        const newsItem = newsData.data[0]; 
        newsSection = newsItem.news_sections.find(section => section.id == id);
        
        if (!newsSection) {
          throw new Error('News section not found');
        }
      } else {
        const data = await res.json();
        newsSection = data.data;
      }
    }

    console.log('News section data:', newsSection);

    // Format publish date
    const publishDate = newsSection.publish_on ? 
      new Date(newsSection.publish_on).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '';

    // ✅ Get best image URL
    const imageUrl = getImageUrl(newsSection.image);

    // ✅ Parse description - handle both JSON and plain text
    let descriptionHTML = "";
    if (newsSection.description) {
      try {
        // Try to parse as JSON first (rich text)
        const parsed = JSON.parse(newsSection.description);
        descriptionHTML = renderRichText(parsed);
      } catch (e) {
        // If JSON parse fails, treat as plain text
        descriptionHTML = formatPlainDescription(newsSection.description);
      }
    }

    // Determine category display name
    const categoryDisplay = category ? category.toUpperCase().replace('-', ' ') : 'NEWS';

    // Render HTML
    document.getElementById("newsDetails").innerHTML = `
      <div class="news-detail">
        <div class="news-header">
          <span class="category-tag">${categoryDisplay}</span>
          <h1>${newsSection.title || "Untitled"}</h1>
          
          <div class="news-meta">
            ${newsSection.author ? `<span class="author">${newsSection.author}</span>` : ''}
            ${publishDate ? `<span class="publish-date">${publishDate}</span>` : ''}
          </div>
        </div>
        
        ${imageUrl ? `
          <div class="news-image">
            <img src="${imageUrl}" alt="${newsSection.image?.alternativeText || newsSection.title}" />
          </div>
        ` : ''}
        
        <div class="news-body">
          ${newsSection.short_description ? `
            <div class="short-description">
              <p><strong>${newsSection.short_description}</strong></p>
            </div>
          ` : ''}

          ${descriptionHTML ? `
            <div class="full-description">
              ${descriptionHTML}
            </div>
          ` : ''}
        </div>
      </div>
      
      <style>
        .news-detail {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .news-header {
          margin-bottom: 30px;
        }
        
        .category-tag {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .news-detail h1 {
          font-size: 2.5em;
          font-weight: bold;
          color: #333;
          line-height: 1.2;
          margin-bottom: 15px;
        }
        
        .news-meta {
          display: flex;
          gap: 20px;
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        .news-image {
          margin-bottom: 30px;
          text-align: center;
        }
        
        .news-image img {
          width: 100%;
          max-width: 600px;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .news-body {
          line-height: 1.6;
          color: #333;
        }
        
        .short-description {
          margin-bottom: 25px;
        }
        
        .short-description p {
          font-size: 1.1em;
          color: #555;
        }
        
        .full-description p {
          margin-bottom: 15px;
          font-size: 16px;
          text-align: justify;
        }
        
        .full-description h1,
        .full-description h2,
        .full-description h3,
        .full-description h4,
        .full-description h5,
        .full-description h6 {
          margin-top: 25px;
          margin-bottom: 15px;
          color: #333;
        }
        
        .full-description ul,
        .full-description ol {
          margin: 15px 0;
          padding-left: 25px;
        }
        
        .full-description li {
          margin-bottom: 5px;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .news-detail {
            padding: 15px;
          }
          
          .news-detail h1 {
            font-size: 2em;
          }
          
          .news-meta {
            flex-direction: column;
            gap: 10px;
          }
        }
      </style>
    `;
    
  } catch (err) {
    console.error('Error loading news details:', err);
    document.getElementById("newsDetails").innerHTML = `<p style="color:#b00">Failed to load news: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadNewsDetails);