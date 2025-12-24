import Advertisment from "@/components/advertisment";
import HeroCard from "@/components/home/hero-card";
import LatestNews from "@/components/home/latest-news";
import MostRead from "@/components/home/most-read";
import SponsoredPost from "@/components/home/sponsored-post";
import { COMPANY_PROFILES } from "@/data/CeoProfile";
import { getData } from "@/lib/getData";
import { formatDateToMonthDay } from "@/utils/dateFormatter";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Marquee from "react-fast-marquee";

export default async function Home() {
  const latestNews = await fetch(
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=latest-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on"
  );
  const latestNewsData = await latestNews.json();

  const CopperNews = await fetch(
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=copper-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on"
  );
  const copperNewsData = await CopperNews.json();

  const preciousMetalsNews = await fetch(
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=precious-metals&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on"
  );
  const preciousMetalsNewsData = await preciousMetalsNews.json();

  const worldNews = await fetch(
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=world-news&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on"
  );
  const worldNewsData = await worldNews.json();

  const announcements = await fetch(
    "https://acceptable-desire-0cca5bb827.strapiapp.com/api/news-categories?filters[slug][$eq]=announcement&populate[news_sections][fields][0]=title&populate[news_sections][fields][1]=author&populate[news_sections][fields][2]=publish_on"
  );
  const announcementsData = await announcements.json();


  return (
    <main>
      <div className="py-6 flex flex-row gap-8">
        {/* Advertisement section */}
        <aside className="px-8">
          <Advertisment />
        </aside>

        {/* Main content section */}
        <section className="flex-1 flex flex-col gap-8">
          <div className="flex flex-row gap-8 px-4">
            <div className="sticky top-0 w-full"> {/* Sticky on scroll */}
              <HeroCard />
            </div>

            <div>
              <h1 className="text-center font-bold text-2xl mb-4">Latest News</h1>

              {latestNewsData.data[0].news_sections
                .slice(0, 3)
                .map((newsItem, index) => (
                  <div className="mb-4" key={index}>
                    <Link href={`/news/news-detail/${newsItem.documentId}`}>
                      <LatestNews
                        title={newsItem.title}
                        author={newsItem.author}
                        publish_on={newsItem.publish_on}
                      />
                    </Link>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-3xl border-b border-black-bg pb-4">Most Read</h4>
            <MostRead />
          </div>

          <div className="bg-black-bg p-4 w-full mb-4">
            <h4 className="font-bold text-4xl text-white">Popular this Week</h4>
          </div>
          
          <div className="w-[40%]">
            <HeroCard />
          </div>

          <div className="bg-black-bg">
            <SponsoredPost />
          </div>

          <div className="flex">
            <div className="w-[30%]">
              <h4 className="font-bold text-3xl mb-4">Latest Multimedia</h4>
              <HeroCard />
            </div>
            <div className="w-[70%] px-4">
              <h4 className="font-bold text-3xl mb-4 text-center">Copper News</h4>
              {copperNewsData.data[0].news_sections
                .slice(0, 5)
                .map((newsItem, index) => (
                  <div className="mb-4" key={index}>
                    <LatestNews
                      title={newsItem.title}
                      author={newsItem.author}
                      publish_on={newsItem.publish_on}
                    />
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-3xl border-b border-black-bg pb-4">Precious Metals</h4>
            <div className="px-4 py-6">
              {preciousMetalsNewsData.data[0].news_sections
                .slice(0, 3)
                .map((newsItem, index) => (
                  <div className="mb-4" key={index}>
                    <LatestNews
                      title={newsItem.title}
                      author={newsItem.author}
                      publish_on={newsItem.publish_on}
                    />
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-3xl border-b border-black-bg pb-4">World News</h4>
            <div className="px-4 py-6">
              {worldNewsData.data[0].news_sections
                .slice(0, 3)
                .map((newsItem, index) => (
                  <div className="mb-4" key={index}>
                    <Link href={`/news/news-detail/${newsItem.documentId}`}>
                      <LatestNews
                        title={newsItem.title}
                        author={newsItem.author}
                        publish_on={newsItem.publish_on}
                      />
                    </Link>
                  </div>
                ))}
            </div>
          </div>

          <div className="px-4">
            <div className="bg-news-bg px-4 py-6 flex flex-row gap-8 justify-between rounded-lg">
              <div>
                <h4 className="font-bold text-3xl border-b border-black-bg pb-4 mb-4">World News</h4>
                <p>hello</p>
              </div>
              <div className="w-[40%]">
                <h4 className="font-bold text-3xl border-b border-black-bg pb-4 mb-4">Announcements</h4>
                <div className="px-4">
                  {announcementsData.data[0].news_sections
                    .slice(0, 3)
                    .map((newsItem, index) => (
                      <div className="mb-4 border-b border-primary pb-2" key={index}>
                        <Link href={`/news/news-detail/${newsItem.documentId}`}>
                          <p>{newsItem.title}</p>
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-3xl border-b border-black-bg pb-4 mb-4">What's On</h4>
                <p>hello</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Brands we are working with */}
      <div>
        <p className="font-bold text-center text-2xl mb-4 border-b border-black-bg pb-4">
          Brands we are working with
        </p>
        <Marquee>
          {COMPANY_PROFILES.map((profile) => (
            <img
              key={profile.name}
              src={profile.image}
              alt={profile.name}
              className="w-32 h-20 mr-8 border p-4 rounded-lg mb-8"
            />
          ))}
        </Marquee>
      </div>
    </main>
  );
}
