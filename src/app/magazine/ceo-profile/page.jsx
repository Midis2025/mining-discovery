import Advertisment from '@/components/advertisment';
import MagazineCards from '@/components/magazine-cards';
import SubHeader from '@/components/sub-header';
import { MAGAZINE_SECTIONS } from '@/data';
import { CEOS } from '@/data/CeoProfile';
import React from 'react';

export default function CEOProfile() {
  return (
    <main>
      <SubHeader
        title="Magazine"
        sections={MAGAZINE_SECTIONS}
        basePath="magazine"
      />

      {/* Main Content */}
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
            <h3 className="text-3xl font-bold mb-4 border-b  w-[20%] border-primary">CEO Profiles</h3>
            <div className=" flex flex-wrap gap-6 justify-center items-center x">
              {CEOS.map((ceo, index) => (
                <MagazineCards
                  key={ceo.id || index}
                  name={ceo.name}
                  company={ceo.company}
                  image={ceo.image}
                />
              ))}
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
