import Advertisment from '@/components/advertisment'
import MagazineCards from '@/components/magazine-cards'
import SubHeader from '@/components/sub-header'
import { MAGAZINE_SECTIONS } from '@/data'
import {  COMPANY_PROFILES } from '@/data/CeoProfile'
import React from 'react'

export default function CompanyProfile() {
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
               <h3 className="text-3xl font-bold mb-4 border-b  w-[30%] border-primary">Company Profiles</h3>
                <div className="flex flex-wrap gap-6 justify-center">
       {COMPANY_PROFILES.map((company, index) => (
         <MagazineCards
         key={index}
         name={company.name}
         image={company.image}
         profileWrapperClass="flex items-center justify-center"
         imageClass='w-24 h-24 object-contain'
         />
        ))}
     </div>
             </div>
   
           </section>
         </div>
       </main>
  )
}



