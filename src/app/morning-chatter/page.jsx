import Advertisment from "@/components/advertisment";
import Reports from "@/components/reports";
import Projects from "@/components/projects";
import { getData } from "@/lib/getData";
import NewsCards from "@/components/news-cards";

export default async function MorningChatter() {
  const adData = await getData("advertisements");
  const projectData = await getData("projects");
  const reportData = await getData("reports");
  // const newsData = await getData("news-categories");


  const morningChatter = await fetch(
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=morning-chatter&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on&populate[news_sections][fields][3]=short_description"
  );

  const morningChatterData = await morningChatter.json();

  console.log('morningChatterData', morningChatterData)

  // ✅ Find Morning Chatter category
  // const morningChatterCategory = newsData.data.find(
  //   (category) => category.category === "Morning Chatter"
  // );

  return (
    <main>
      <section className="bg-black-bg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-6">
            Morning Chatter
          </h1>
          {/* <SlugTabs /> */}
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Ads (Hidden on mobile, shown on desktop) */}
          <aside className="hidden lg:block   flex-shrink-0">
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
                  Morning Chatter
                </h2>
            
            </div>

            <div className="space-y-4 ">
              {morningChatterData.data[0].news_sections?.map((newsSection) => (
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