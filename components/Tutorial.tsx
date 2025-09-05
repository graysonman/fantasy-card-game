// src/components/Tutorial.tsx
"use client";

import React from 'react';
import Card from './Card';
import type { PlayerCard } from '@/app/collection/page';
import { StrengthIcon, FinesseIcon, SpeedIcon } from './Icons';

interface TutorialProps {
  step: number;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  isCompleting: boolean;
}

// Create some static card data for demonstration purposes
const anatomyCard: PlayerCard = { 
  id: -1, 
  level: 5, 
  xp: 0, 
  in_deck: false,
  current_attack: 43,
  current_defense: 57,
  cards: { 
    name: 'Mountain Wyrm', 
    description: 'The Mountain Wyrm, a Uncommon dragon of immense power, commands the skies. Its scales shimmer with raw Strength, and its roar is said to shake the very foundations of the world.', 
    image_url: '/cards/mountain_wyrm.png', 
    rarity: 'Uncommon', 
    type: 'Strength', 
    base_attack: 43, 
    base_defense: 57,
    fuseable: true
  } 
};

const commonCard: PlayerCard = { 
  id: -2, 
  level: 1, 
  xp: 0, 
  in_deck: false,
  current_attack: 10,
  current_defense: 15,
  cards: { 
    name: 'Goblin Grunt', 
    description: 'A common goblin footsoldier, weak but numerous.', 
    image_url: '/cards/goblin_grunt.png', 
    rarity: 'Common', 
    type: 'Strength', 
    base_attack: 10, 
    base_defense: 15,
    fuseable: true
  } 
};

const legendaryCard: PlayerCard = { 
  id: -3, 
  level: 50, 
  xp: 0, 
  in_deck: false,
  current_attack: 120,
  current_defense: 80,
  cards: { 
    name: 'Iron Hatchling', 
    description: 'From the volcanic heart of Mount Cinder, the Iron Hatchling emerges. This Legendary beast is a living embodiment of Strength, its breath a torrent of pure energy.', 
    image_url: '/cards/iron_hatchling.png', 
    rarity: 'Legendary', 
    type: 'Strength', 
    base_attack: 120, 
    base_defense: 80,
    fuseable: true
  } 
};


const tutorialSteps = [
  {
    title: 'Welcome, Warrior!',
    content: 'Welcome to Fantasy Card Game! Your journey to become a legendary collector and duelist starts now. Let\'s learn the basics.',
  },
  {
    title: 'Anatomy of a Card',
    content: 'Every card has key attributes that determine its power: Level, Name, Rarity (stars), and Type (icon).',
    visual: (
      <div className="w-[clamp(200px,40vw,400px)] aspect-[3/4] mx-auto">
        <Card card={anatomyCard} className="w-full h-full" />
      </div>
    )
  },

  {
    title: 'Type Advantage',
    content: 'Each card has a Type. Types have advantages over others, like rock-paper-scissors. This is key to winning battles!',
    visual: (
      <div className="text-white text-center text-lg space-y-2">
        <div className="flex items-center justify-center gap-2">
            <StrengthIcon className="w-6 h-6 text-red-500" />
            <span>Strength </span>
            <span className="text-gray-400">beats</span>
            <FinesseIcon className="w-6 h-6 text-green-500" />
            <span>Finesse</span>
        </div>
        <div className="flex items-center justify-center gap-2">
            <FinesseIcon className="w-6 h-6 text-green-500" />
            <span>Finesse </span>
            <span className="text-gray-400">beats</span>
            <SpeedIcon className="w-6 h-6 text-blue-500" />
            <span>Speed</span>
        </div>
        <div className="flex items-center justify-center gap-2">
            <SpeedIcon className="w-6 h-6 text-blue-500" />
            <span>Speed </span>
            <span className="text-gray-400">beats</span>
            <StrengthIcon className="w-6 h-6 text-red-500" />
            <span>Strength</span>
        </div>
      </div>
    )
  },
  {
    title: 'Card Rarity',
    content: 'Rarity (shown by stars) indicates a card\'s potential. A Legendary card is naturally much stronger than a Common one.',
    visual: (
      <div className="w-full max-w-[1100px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-center items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="w-[clamp(200px,25vw,400px)] aspect-[3/4]">
              <Card card={commonCard} className="w-full h-full" />
            </div>
            <p className="text-white text-xl font-medium text-center mt-4">Common Card</p>
          </div>
          <div className="text-white text-6xl font-bold transform rotate-90 lg:rotate-0 opacity-75">
            →
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[clamp(200px,25vw,400px)] aspect-[3/4]">
              <Card card={legendaryCard} className="w-full h-full" />
            </div>
            <p className="text-white text-xl font-medium text-center mt-4">Legendary Card</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Your Quest',
    content: 'Your goal is to build a powerful collection by completing missions, battling opponents, and fusing cards to increase their power. Good luck!',
  }
];

const Tutorial: React.FC<TutorialProps> = ({ step, onNext, onBack, onComplete, isCompleting }) => {
  const currentStep = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-[1200px] text-center shadow-lg transition-all duration-300">
      <h2 className="text-3xl font-bold text-white mb-4">{currentStep.title}</h2>
      <p className="text-gray-300 mb-6 min-h-[60px]">{currentStep.content}</p>
      
      {currentStep.visual && (
        <div className="flex justify-center mb-6 w-full">
          {currentStep.visual}
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-0 transition-opacity"
          onClick={onBack}
          disabled={step === 0}
        >
          Back
        </button>
        
        {isLastStep ? (
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-60"
            onClick={onComplete}
            disabled={isCompleting}
          >
            {isCompleting ? 'Claiming Reward...' : 'Finish & Claim Reward'}
          </button>
        ) : (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onNext}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Tutorial;
