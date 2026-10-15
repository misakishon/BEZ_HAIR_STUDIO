import React from "react";
import { Clock, Check } from "lucide-react";

interface CardCutProps {
  title: string;
  duration: string;
  price: string;
  imageUrl: string;
  isSelected: boolean;
  onSelect: () => void;
}

function CardCut({
  title,
  duration,
  price,
  imageUrl,
  isSelected,
  onSelect,
}: CardCutProps) {
  return (
    <div
      onClick={onSelect}
      className={`w-full max-w-[170px] sm:max-w-[190px] bg-white border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 select-none ${
        isSelected
          ? "border-black shadow-md ring-1 ring-black"
          : "border-neutral-200 hover:border-neutral-400 shadow-sm"
      }`}
    >
      {/* CARD IMAGE CONTAINER */}
      <div className="w-full aspect-[4/5] relative bg-neutral-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 ${
            isSelected ? "grayscale-0" : "grayscale"
          }`}
        />

        {/* Selection Checkmark Indicator Overlay */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-black text-white p-1 rounded-full shadow">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}
      </div>

      {/* CARD DETAILS */}
      <div className="p-3.5 flex flex-col gap-1 bg-white">
        <h3 className="text-xs font-semibold text-black tracking-tight leading-snug line-clamp-2 h-8">
          {title}
        </h3>

        <div className="flex flex-col gap-0.5 mt-1">
          <div className="flex items-center gap-1 text-neutral-400">
            <Clock className="w-3 h-3 stroke-[1.5]" />
            <span className="text-[10px] font-light">{duration}</span>
          </div>
          <span className="text-xs font-bold text-black">{price}</span>
        </div>
      </div>
    </div>
  );
}

export default CardCut;
