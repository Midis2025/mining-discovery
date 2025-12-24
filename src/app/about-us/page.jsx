import RichText from "@/components/richtext";
import { getData } from "@/lib/getData";

export default async function AboutUs() {
  const data = await getData("about-uses");
  const description = data.data[0].description;

  return (
    <main>
      <section className="bg-black-bg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-6">
            About Us
          </h1>
          <p className="text-primary text-base md:text-lg leading-relaxed">
            "Discover the Pulse of the Mining Industry: Your Go-To Source for
            News, Insights, and Investment Opportunities"
          </p>
        </div>
      </section>

      {/* Main Content - About Us Description */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <main className="flex-1">
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
                <RichText content={description} />
              </div>
            </main>

            {/* Right Sidebar - Optional space for future content */}
            <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
              <div className="space-y-8">
                {/* Placeholder for future sidebar content */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                  <h3 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
                    Quick Facts
                  </h3>
                  <div className="space-y-3 text-sm md:text-base text-gray-600">
                    <p>Your trusted mining industry resource</p>
                    <p>Comprehensive news coverage</p>
                    <p>Investment insights and opportunities</p>
                    <p>Industry pulse and trends</p>
                  </div>
                </div>

                {/* Contact or Additional Info Section */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                  <h3 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b-2 border-gray-200">
                    Connect With Us
                  </h3>
                  <div className="space-y-3 text-sm md:text-base text-gray-600">
                    <p>Stay updated with the latest mining news</p>
                    <p>Expert analysis and insights</p>
                    <p>Investment opportunities</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}