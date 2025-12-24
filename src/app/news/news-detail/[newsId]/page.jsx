import Image from "next/image";
import { getData } from "@/lib/getData";
import { formatDateToMonthDay } from "@/utils/dateFormatter";

export default async function NewsDetailsPage({ params }) {
  const { newsId } = await params;

  // Fetch news details
  const newsDetailedData = await getData(`news-sections/${newsId}`);
  const news = newsDetailedData?.data;

  if (!news) {
    return (
      <main>
        <section className="bg-black-bg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-6">
              News Details
            </h1>
          </div>
        </section>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white p-6 rounded-lg text-center text-gray-600">
            ❌ News not found
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="bg-black-bg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-6">
            News Details
          </h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content - News Article */}
          <main className="flex-1">
            <article className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {/* Category */}
              {news.news_category?.category && (
                <span className="inline-block text-xs md:text-sm font-semibold text-primary uppercase tracking-wide bg-primary/10 px-3 py-1 rounded-full">
                  {news.news_category.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-4 leading-tight">
                {news.title}
              </h1>

              {/* Author + Date */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-500 text-sm mt-4 space-y-2 sm:space-y-0">
                <p className="text-sm md:text-base">
                  By{" "}
                  <span className="font-medium text-gray-700">
                    {news.author || "Unknown"}
                  </span>
                </p>
                <p className="text-sm md:text-base">
                  {formatDateToMonthDay(news.createdAt) || "Unpublished"}
                </p>
              </div>

              {/* Hero Image */}
              {news.image && (
  <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-xl overflow-hidden my-6">
    <img
      src={news.image.formats?.large?.url || news.image.url}
      alt={news.image.alternativeText || news.title}
      className="object-cover w-full h-full"
    />
  </div>
)}


              {/* Main Description */}
              <section className="prose prose-sm md:prose-lg max-w-none text-gray-700 leading-relaxed mt-6">
                {news.description?.map((block, idx) => (
                  <p key={idx} className="mb-4 text-sm md:text-base leading-relaxed">
                    {block.children?.map((child, i) => (
                      <span key={i}>{child.text}</span>
                    ))}
                  </p>
                ))}
              </section>

              {/* Short Description Highlight */}
              {news.short_description && (
                <div className="bg-primary/10 border-l-4 border-primary p-4 mt-8 rounded-md">
                  <p className="text-primary font-medium text-sm md:text-base leading-relaxed">
                    {news.short_description}
                  </p>
                </div>
              )}
            </article>
          </main>

          {/* Right Sidebar - Related Content */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="space-y-6">
              {/* Article Info Card */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                <h3 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
                  Article Info
                </h3>
                <div className="space-y-3 text-sm md:text-base">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">Category:</span>
                    <span className="text-gray-800 text-right">
                      {news.news_category?.category || "General"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">Author:</span>
                    <span className="text-gray-800 text-right">
                      {news.author || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">Published:</span>
                    <span className="text-gray-800 text-right">
                      {formatDateToMonthDay(news.createdAt) || "Unpublished"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Section */}
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                <h3 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
                  Share Article
                </h3>
                <div className="space-y-3 text-sm md:text-base text-gray-600">
                  <p>Share this article with your network</p>
                  <p>Stay informed about mining industry news</p>
                  <p>Get the latest insights and updates</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}