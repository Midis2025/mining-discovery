import { formatDateToMonthDay } from "@/utils/dateFormatter";
import React from "react";

export default function LatestNews({ title, author, publish_on = " " }) {
  return (
    <div>
      <div className="border border-black p-4 rounded-lg">
        <p className=" font-bold text-lg mb-4">{title}</p>
        <div className=" flex items-center justify-between">
          <p className=" text-primary">{formatDateToMonthDay(publish_on)}</p>
          <p>{author} </p>
        </div>
      </div>
    </div>
  );
}
