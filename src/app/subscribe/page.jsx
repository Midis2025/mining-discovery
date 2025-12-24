import Image from "next/image";
import React from "react";

export default function Page() {
  const optionsList = [
    "49$/month for your first month for new members Billed as 49$ every four weeks for your first year.",
    "299$/month for your first six months for new members Billed as 49$ every four weeks for your first year.",
    "599$/month for your first year for new members Billed as 49$ every four weeks for your first year.",
  ];

  const featuresList = [
    "Magazines Flip Book Access",
    "Latest Newsletters Update from Email",
    "CEO Profile",
    "Fun Area Access",
    "Digital Book",
    "Webinar Alerts Notification",
    "Podcasts",
  ];

  // Function to highlight the billing part
  const formatOptionText = (text) => {
    const [firstPart, billedPart] = text.split("Billed as");
    const firstPartSplit = firstPart.split(
      /(first month|first six months|first year)/i
    );
    return (
      <span>
        {firstPartSplit.map((part, index) => (
          <span
            key={index}
            className={
              /(first month|first six months|first year)/i.test(part)
                ? "text-primary font-bold"
                : ""
            }
          >
            {part}
          </span>
        ))}
        <br />
        <span className="text-gray-700">Billed as{billedPart}</span>
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col gap-16 py-12">
      {/* Section 1: Image on right */}
      <section className="flex flex-col lg:flex-row w-full items-center">
        {/* Content */}
        <div className="flex-1 max-w-3xl mx-auto lg:mx-0 px-4 lg:px-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={200}
            height={100}
            className="mb-8"
          />
          <h1 className="text-2xl lg:text-4xl font-bold mb-6 text-gray-900">
            Discover all that’s new. <br />
            With <span className="text-primary">Mining Discovery...</span>
          </h1>

          <ul className="space-y-8 ">
            {optionsList.map((option, index) => (
              <li key={index} className="flex items-start gap-4 my-8">
                {/* Custom square radio button */}
                <input
                  type="radio"
                  name="subscription"
                  className="
          mt-4 h-6 w-6
          rounded-none
          border-2 border-gray-300
          checked:bg-primary
          checked:border-primary
          appearance-none
          cursor-pointer
          transition-colors
        "
                />
                <div className="text-lg  border-b pb-4 border-black-bg">{formatOptionText(option)}</div>
              </li>
            ))}
          </ul>

          <div className=" mt-10">
            <button className="bg-black-bg text-primary font-bold text-2xl py-3 px-6 rounded-lg">
              Subscribe Now
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="w-full lg:w-1/2 bg-primary py-20 flex justify-center items-center">
          <Image
            src="/iphone.png"
            alt="iPhone"
            width={300}
            height={300}
            className="object-cover"
          />
        </div>
      </section>

      
         <div className="flex flex-col items-center text-center px-4 lg:px-0">
        <h4 className="border-b border-black-bg pb-2 text-2xl font-semibold text-gray-900">
          All Access includes news, Magazines, Newsletter, Media, Games etc
        </h4>
        <p className="w-3/4 mt-4 text-gray-700 border-b border-black-bg pb-2">
          Subscribe to Mining Discovery and unlock full access across all tiers
          — including global mining news updates, exclusive media content like
          interviews and virtual tours, a premium digital magazine featuring
          exploration insights and expert articles, and our insider newsletter
          packed with curated trends and discovery alerts. Plans start at just
          $49/month for access for newsletter magazine, news, games, full media
          library etc. Stay ahead in the mining world with trusted content,
          updated weekly, and cancel anytime.
        </p>
      </div>

      <p className="text-4xl font-bold text-center">
        Subscribers enjoy more with New York Times All Access.
      </p>
      

      {/* Section 2: Image on left */}
      <section className="flex flex-col lg:flex-row w-full items-center">
        {/* Image */}
        <div className="w-full lg:w-1/2 bg-primary py-20 flex justify-center items-center">
          <Image
            src="/iphone.png"
            alt="iPhone"
            width={300}
            height={300}
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl mx-auto lg:mx-0 px-4 lg:px-8">
          <h1 className="text-2xl lg:text-4xl font-bold mb-6 text-gray-900">
            Access from Mining <br />
            <span className="text-primary">Discovery...</span>
          </h1>

          <ul className="space-y-4">
            {featuresList.map((feature, index) => (
              <li key={index} className="text-2xl font-bold relative">
                {feature}
                <div className="h-[2px] bg-primary w-[20%] mt-2"></div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
