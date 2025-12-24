"use client";

import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { IoMdArrowDropdown } from "react-icons/io";

export default function SlugTabs({ categories = [], basePath = "/news" }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // get current path

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col">
      {/* Header with Arrow */}
      <div
        className="flex items-center gap-2 cursor-pointer text-white mb-2"
        onClick={toggleDropdown}
      >
        <h2 className="text-lg font-semibold">News</h2>
        <IoMdArrowDropdown
          className={`text-xl transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Categories - dropdown */}
      {isOpen && categories.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((cat) => {
            const isActive = pathname === `${basePath}/${cat.slug}`;

            return (
              <Link key={cat.id} href={`${basePath}/${cat.slug}`}>
                <h2
                  className={`px-2 py-1 rounded-lg cursor-pointer transition-all
                    ${isActive ? "text-primary underline font-semibold" : "text-white"}
                    hover:text-primary hover:underline`}
                >
                  {cat.title}
                </h2>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
