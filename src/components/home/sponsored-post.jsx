import Image from "next/image";
import React from "react";

export default function SponsoredPost() {
  return (
    <div>
      <h4 className=" font-bold text-4xl  text-white p-4 border-b border-white mb-4 ">
        {" "}
        Sponsored Post
      </h4>
      <div className=" text-white p-4 mb-4 flex flex-row gap-20 ">
        <Image src="/test.png" alt="Sponsored Post" height={400} width={700} />
        <div>
          <p className=" border p-2 border-white  rounded-xl w-1/4 mb-4">
            SPONSORED POST
          </p>
          <p className=" w-3/4">
            Phenom Closes $1,619,500 First Tranche of Private Placement
            Financing Arizona Gold & Silver Drilling Intersects 55.8 Metres
            Grading 1.27 Grams Per Tonne Gold, Including High-Grade Intercepts
            at Philadelphia Project, Arizona Arizona Gold & Silver Drilling
            Intersects 55.8 Metres Grading 1.27 Grams Per Tonne Gold, Including
            High-Grade Intercepts at Philadelphia Project, Arizona Arizona Gold
            & Silver Drilling Intersects 55.8 Metres Grading 1.27 Grams Per
            Tonne Gold, Including High-Grade Intercepts at Philadelphia Project,
            Arizona.
          </p>
        </div>
      </div>
    </div>
  );
}
