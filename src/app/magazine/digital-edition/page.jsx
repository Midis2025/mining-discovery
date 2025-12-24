import SubHeader from "@/components/sub-header";
import { MAGAZINE_SECTIONS } from "@/data";
import React from "react";
import { CEOS, COMPANY_PROFILES } from "@/data/CeoProfile";
import MagazineCards from "@/components/magazine-cards";
import Advertisment from "@/components/advertisment";

export default function DigitalEdition() {
  return (
    <div>
      <SubHeader
        title="Magazine"
        sections={MAGAZINE_SECTIONS}
        basePath="magazine"
      />
     <div className="px-4 py-8">
                <section className="flex flex-col lg:flex-row  container mx-auto gap-8 ">
        
                  {/* Sidebar Advertisement */}
                  <aside className="  ">
                    <div className="sticky top-4">
                      <Advertisment />
                    </div>
                  </aside>
        
                  {/* CEO Cards - Main Content */}
                  <div className=" w-full  ">
                     <div className=" border-b-2 border-primary mx-auto container  ">
         <h3 className="text-3xl font-bold mb-4 border-b  w-[30%] border-primary">CEO Profiles</h3>

        <div className="flex flex-wrap gap-6 justify-center mb-8">
          {CEOS.slice(0, 3).map((profile, index) => (
            <MagazineCards
              key={index}
              name={profile.name}
              company={profile.company}
              image={profile.image}
            />
          ))}
        </div>
      </div>

     <div className=" border-b-2 border-primary mx-auto container   ">
        <h3 className="text-3xl font-bold mb-4 border-b  w-[30%] border-primary mt-4">Company Profiles</h3>
        {/* Show only 3 company profiles */}
        <div className="flex flex-wrap gap-6 justify-center mb-8">
          {COMPANY_PROFILES.slice(0, 3).map((profile, index) => (
            <MagazineCards
              key={index}
              name={profile.name}
              image={profile.image}
              profileWrapperClass="flex items-center justify-center"
              imageClass="w-24 h-24 object-contain"
            />
          ))}
        </div>
      </div>
       <div className=" border-b-2 border-primary mx-auto container  ">
        <h3 className="text-3xl font-bold mb-4 border-b  w-[30%] border-primary mt-4">Webinar Recordings</h3>
        {/* Show only 3 company profiles */}
        <div className="flex flex-wrap gap-6 justify-center mb-8 ">
          <div className="flex items-center justify-center bg-black-bg p-10 rounded-lg w-[330px] h-[180px]">
            <img
              src="/yt.png"
              alt="Webinar Recording"
              className="w-24 h-24 object-contain"
            />
          </div>
          <div className="flex items-center justify-center bg-black-bg p-10 rounded-lg w-[330px] h-[180px]">
            <img
              src="/yt.png"
              alt="Webinar Recording"
              className="w-24 h-24 object-contain"
            />
          </div>
          <div className="flex items-center justify-center bg-black-bg p-10 rounded-lg w-[330px] h-[180px]">
            <img
              src="/yt.png"
              alt="Webinar Recording"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>
      </div>
                  </div>
        
                </section>
              </div>
    </div>
  );
}
