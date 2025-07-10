import React from "react";
import Image from "next/image";
import type { PlayerCard } from "@/app/collection/page";
import { StrengthIcon, FinesseIcon, SpeedIcon, StarIcon } from "./Icons";

interface CardProps {
  card: PlayerCard;
  className?: string;
}

// --- Sub-components ---
const TypeDisplay: React.FC<{ type: string }> = ({ type }) => {
  const Icon =
    type === "Strength"
      ? StrengthIcon
      : type === "Finesse"
      ? FinesseIcon
      : type === "Speed"
      ? SpeedIcon
      : StrengthIcon;

  const bgClass =
    type === "Strength"
      ? "bg-red-500/90 border-red-500 text-white"
      : type === "Finesse"
      ? "bg-green-500/90 border-green-500 text-white"
      : type === "Speed"
      ? "bg-blue-500/90 border-blue-500 text-white"
      : "bg-gray-400/90 border-gray-400 text-white";

  return (
    <div
      className={`w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] rounded-full flex items-center justify-center border-2 ${bgClass}`}
      title={type}
    >
      <Icon className="w-[clamp(1rem,2vw,2rem)] h-[clamp(1rem,2vw,2rem)] fill-current stroke-current" />
    </div>
  );
};

const StarRating: React.FC<{ rarity: string }> = ({ rarity }) => {
  const starCount =
    rarity === "Common"
      ? 1
      : rarity === "Uncommon"
      ? 2
      : rarity === "Rare"
      ? 3
      : rarity === "Super Rare"
      ? 4
      : rarity === "Legendary" || rarity === "Ultra Legendary"
      ? 5
      : 0;

  const starColor =
    rarity === "Common"
      ? "text-gray-400"
      : rarity === "Uncommon"
      ? "text-green-500"
      : rarity === "Rare"
      ? "text-blue-500"
      : rarity === "Super Rare"
      ? "text-purple-600"
      : rarity === "Legendary"
      ? "text-yellow-500"
      : rarity === "Ultra Legendary"
      ? "text-red-600"
      : "text-gray-400";

  return (
    <div className="flex flex-col gap-[clamp(0.1rem,0.4vw,0.25rem)] items-end">
      {[...Array(starCount)].map((_, i) => (
        <StarIcon
          key={i}
          filled={true}
          className={`w-[clamp(0.75rem,1.5vw,1.25rem)] h-[clamp(0.75rem,1.5vw,1.25rem)] ${starColor} drop-shadow-sm`}
        />
      ))}
    </div>
  );
};

// --- Main Card Component ---
const Card: React.FC<CardProps> = ({ card, className = "" }) => {
  if (!card.cards) {
    return null;
  }

  const { name, image_url, rarity, type, description: lore } = card.cards;
  const { level, current_attack, current_defense } = card;

  const borderClass =
    rarity === "Common"
      ? "border-gray-400"
      : rarity === "Uncommon"
      ? "border-green-500"
      : rarity === "Rare"
      ? "border-blue-500"
      : rarity === "Super Rare"
      ? "border-purple-600"
      : rarity === "Legendary"
      ? "border-yellow-500"
      : rarity === "Ultra Legendary"
      ? "border-red-600"
      : "border-gray-400";

  return (
    <div
      className={`group relative w-full max-w-[400px] aspect-[3/4] mx-auto ${borderClass} border-4 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/30 ${className}`}
    >
      {/* Card Image - Takes up 75% of the height */}
      <div className="relative w-full h-[75%]">
        {image_url ? (
          <Image
            src={image_url}
            alt={`Image of ${name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400 text-center px-2">{name}</span>
          </div>
        )}
        
        {/* Card Header */}
        <div className="absolute top-[clamp(0.25rem,1vw,0.5rem)] left-0 right-0 w-full flex justify-between items-center px-[clamp(0.25rem,1vw,0.5rem)] z-50">
          {/* Type Icon - pushed to left */}
          <div className="absolute top-2 left-2 z-50">
            <TypeDisplay type={type} />
          </div>
  
          {/* Stars - pushed to right */}
          <div className="absolute top-2 right-2 z-50">
            <StarRating rarity={rarity} />
          </div>
        </div>

        {/* Lore on Hover */}
        <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col items-center justify-center text-center overflow-auto">
          <h4 className="font-bold text-yellow-400 mb-2 text-lg">Lore</h4>
          <p className="text-gray-300 text-sm">
            {lore || "No lore available for this card."}
          </p>
        </div>
      </div>

      {/* Card Footer - Takes up 25% of the height */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[25%] bg-gray-900 p-2 flex flex-col justify-center">
        <h3 className="font-bold text-white text-center text-sm sm:text-base">
          {name}
        </h3>
        <div className="flex justify-around items-center mt-1 text-center">
          <span className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 bg-black/60 text-yellow-400 text-sm font-bold rounded-full border border-yellow-400/30 leading-tight">
            Lv. {level}
          </span>
          <div className="text-white">
            <span className="text-red-500 font-bold">{current_attack ?? card.cards.base_attack}</span> ATK
          </div>
          <div className="text-white">
            <span className="text-blue-500 font-bold">{current_defense ?? card.cards.base_defense}</span> DEF
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
