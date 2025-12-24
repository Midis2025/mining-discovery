import React from "react";

export default function Projects({ image, description }) {
  return (
    <div>
      <div className="relative inline-block rounded-lg overflow-hidden">
        <img
          src={image}
          alt="Project 1"
          width={330}
          height={200}
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black-bg bg-opacity-20 text-white p-4">
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
