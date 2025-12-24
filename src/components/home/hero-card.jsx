import React from "react";

export default function HeroCard() {
  return (
    <div className="border border-black rounded-lg w-full">
      <div className="mb-4">
        <img
          src="/test.png"
          alt="Your image description"
          className="w-full h-auto"
        />
      </div>

      {/* Text section */}
      <div className="p-4">
        <h1 className="text-xl font-bold">Hello</h1>
        <p className="mt-2 text-gray-700">
          This is a sample text below the image. You can add more text here.
        </p>
      </div>
    </div>
  );
}
