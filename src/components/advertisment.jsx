import { getData } from "@/lib/getData";
import React from "react";

export default async function Advertisment() {
  const adData = await getData("advertisements");


  return (
    <div >
      {adData.data.map((ad, index) => (
        <img
          key={index}
          src={ad.ads_image.url}
          alt={ad.alt || "ad-image"}
          width={212}
          height={625}
          className="object-contain mb-8"
        />
      ))}
    </div>
  );
}
