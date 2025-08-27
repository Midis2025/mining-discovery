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
     
    </main>
  );
}