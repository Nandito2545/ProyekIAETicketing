import React from "react";

export default function EventCard({ image, title }) {
  return (
    <div className="w-80 bg-gray-100 rounded-xl shadow-md overflow-hidden flex-shrink-0 hover:scale-105 transition-transform duration-300">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4 text-center">
        <p className="font-medium">{title}</p>
      </div>
    </div>
  );
}
