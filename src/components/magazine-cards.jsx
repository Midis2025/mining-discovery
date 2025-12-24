import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function MagazineCards({
  name,
  company,
  image,
  profileWrapperClass = "",
  imageClass = "",
}) {
  return (
    <div className="bg-black-bg rounded-2xl h-[370px] w-[330px] p-8 flex flex-col items-center text-center shadow-lg gap-4">
      {/* Profile Image */}
      <div className="flex flex-col items-center">
        <div
          className={`w-32 h-32 rounded-full border-4 border-primary overflow-hidden mb-6 bg-white ${profileWrapperClass}`}
        >
          <Image
            src={image}
            alt={name || "Profile Image"}
            width={128}
            height={128}
            className={`w-full h-full object-cover ${imageClass}`}
          />
        </div>

        {/* Name */}
        <h2 className="text-white font-bold text-xl">{name}</h2>

        {/* Company */}
        <p className="text-primary mt-2 text-sm">{company}</p>
      </div>

      {/* Profile Link */}
      <Link
        href={`/magazine/ceo-profile/${encodeURIComponent(name)}`}
        className="mt-4 inline-block text-sm text-white hover:text-primary transition-colors"
      >
        View Profile →
      </Link>
    </div>
  );
}
