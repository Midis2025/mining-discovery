import Advertisment from "@/components/advertisment";
import Reports from "@/components/reports";
import Projects from "@/components/projects";
import { getData } from "@/lib/getData";
import NewsCards from "@/components/news-cards";
import SlugTabs from "@/components/slug-tabs";

export default async function News({ params }) {
  const slug = await params.slug;
console.log('slug', slug)


  const adData = await getData("advertisements");
  const projectData = await getData("projects");
  const reportData = await getData("reports");
  const newsData = await getData("news-categories");

  console.log('newsData.data', newsData.data)

   const categories = newsData.data.map((item) => ({
    id: item.id,
    title: item.category,
    slug: item.slug,
    sections: item.news_sections || []
  })) || [];

  // Filter news data based on the selected category (slug)
  const selectedCategory = newsData.data.find(category => 
    category.slug === slug
  );

  // If no category matches the slug, you might want to handle this case
  if (!selectedCategory) {
    return (
      <main>
        <section className="bg-black-bg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-6">News</h1>
            <p className="text-white">Category not found</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="bg-black-bg">
        <div className="container mx-auto px-4 py-4">
        
          <SlugTabs categories={categories} basePath="/news" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Ads (Hidden on mobile, shown on desktop) */}
          <aside className="hidden lg:block  flex-shrink-0">
            <div className="space-y-4">
              {adData.data.map((ad, index) => (
                <Advertisment 
                  key={index} 
                  image={ad.ads_image.url} 
                  alt={ad.altText} 
                />
              ))}
            </div>
          </aside>

          {/* Main Content - News Sections */}
          <main className="flex-1 mt-4 lg:mt-0">
            <div className="border-b-2 mb-6">
              <h2 className="text-xl md:text-2xl font-semibold pb-2">
                {selectedCategory.category}
              </h2>
            </div>

            <div className="space-y-6">
              {selectedCategory.news_sections.map((newsSection, index) => (
                <div key={newsSection.id} className="mb-6">
                  <NewsCards
                    newsId={newsSection.documentId}
                    title={newsSection.title}
                    description={newsSection.short_description}
                    author={newsSection.author}
                    publishedOn={newsSection.createdAt}
                  />
                </div>
              ))}
            </div>

            {/* Mobile Ads - Show only on mobile/tablet */}
            <div className="lg:hidden mt-8 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Sponsored</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adData.data.slice(0, 4).map((ad, index) => (
                  <Advertisment 
                    key={index} 
                    image={ad.ads_image.url} 
                    alt={ad.altText} 
                  />
                ))}
              </div>
            </div>
          </main>

          {/* Right Sidebar - Projects + Reports */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="space-y-8">
              {/* Projects Section */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                <h3 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
                  Projects
                </h3>
                <div className="space-y-4">
                  {projectData.data.map((project, index) => (
                    <Projects 
                      key={index} 
                      image={project.project_image.url} 
                      alt={project.title} 
                      description={project.project_title}
                    />
                  ))}
                </div>
              </div>

              {/* Reports Section */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                <h3 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
                  Reports
                </h3>
                <div className="space-y-4">
                  {reportData.data.map((report, index) => (
                    <Reports 
                      key={index} 
                      image={report.reports_image.url} 
                      alt={report.title} 
                      description={report.title}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}