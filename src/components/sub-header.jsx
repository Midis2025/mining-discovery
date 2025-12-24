"use client";

import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { IoMdArrowDropdown } from "react-icons/io";

export default function SubHeader({ title, sections = [], basePath = "" }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-black-bg">
      <div className="container mx-auto px-4 py-4">
        {/* Header with title and arrow */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={toggleDropdown}
        >
          <h1 className="text-white text-2xl md:text-3xl font-bold flex items-center gap-2">
            {title}
          </h1>
          <IoMdArrowDropdown
            className={`text-white text-2xl transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Section links - dropdown */}
        {isOpen && (
          <div className="flex flex-wrap gap-4 px-4 md:px-24 mt-4 items-center justify-center">
            {sections.map((section, index) => {
              const isBasePath = pathname === `/${basePath}` && index === 0;
              const isActive = pathname === `/${basePath}/${section.slug}`;
              const highlight = isBasePath || isActive;

              return (
                <Link
                  key={section.slug}
                  href={index === 0 ? `/${basePath}` : `/${basePath}/${section.slug}`}
                  className={`whitespace-normal break-words transition-all duration-200
                    ${highlight ? "text-primary font-semibold underline" : "text-white"}
                    hover:text-primary hover:underline`}
                >
                  {section.title}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
