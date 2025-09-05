"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Card from '@/components/Card';
import type { PlayerCard } from '@/app/collection/page';

type Mission = {
  id: number;
  name: string;
  description: string;
  reward_credits: number;
  reward_xp: number;
  opponent_card_ids: number[];
};

const MissionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const missionId = params?.missionId as string;

  const [mission, setMission] = useState<Mission | null>(null);
  const [opponentCards, setOpponentCards] = useState<PlayerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!missionId) return;

    const fetchMissionDetails = async () => {
      setLoading(true);
      try {
        // Fetch the mission itself
        const { data: missionData, error: missionError } = await supabase
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single();

        if (missionError) throw missionError;
        setMission(missionData);

        // Fetch the details for the unique opponent card IDs
        const uniqueCardIds = [...new Set(missionData.opponent_card_ids)];
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .in('id', uniqueCardIds);

        if (cardsError) throw cardsError;
        
        // Create a map for quick lookup of card details
        const cardDetailsMap = new Map(cardsData.map(c => [c.id, c]));

        // Build the opponent's deck by respecting the original ID list (including duplicates)
        const opponentDeck = missionData.opponent_card_ids.map((cardId: number, index: number) => {
          const card = cardDetailsMap.get(cardId);
          if (!card) return null; // Should not happen if data is consistent

          return {
            id: -1 - index, // Negative ID for temporary client-side objects
            level: 1,
            xp: 0,
            in_deck: true,
            current_attack: card.base_attack,
            current_defense: card.base_defense,
            cards: card,
          };
        }).filter(Boolean); // Filter out any nulls

        setOpponentCards(opponentDeck as PlayerCard[]);

      } catch (err: any) {
        setError(err.message || 'Failed to load mission details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissionDetails();
  }, [missionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!mission) {
    return <div className="text-white text-center p-4">Mission not found.</div>;
  }

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-lg p-6">
        <button onClick={() => router.back()} className="text-blue-400 hover:text-white mb-6">
          &larr; Back to Missions
        </button>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-400">{mission.name}</h1>
          <p className="text-gray-300 mt-2 max-w-2xl mx-auto">{mission.description}</p>
          
          <div className="mt-6 text-lg">
            <span className="mr-6">Rewards:</span>
            <span className="font-bold text-green-400">{mission.reward_xp} XP</span>
            <span className="mx-2">|</span>
            <span className="font-bold text-blue-400">{mission.reward_credits} Credits</span>
          </div>
        </div>

        <div className="mt-12 ">
          <h2 className="text-2xl font-bold text-center mb-6">Opponent's Deck</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {opponentCards.map(card => (
              <div key={card.id} className="w-48">
                <Card card={card} />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => router.push(`/deck-select?missionId=${mission.id}`)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded-lg text-xl
                       transition-transform transform hover:scale-105"
          >
            Start Mission
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionDetailPage;