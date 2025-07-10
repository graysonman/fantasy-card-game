"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Card from '@/components/Card';
import type { PlayerCard } from '@/app/collection/page';
import { User } from '@supabase/supabase-js';

const MAX_DECK_SIZE = 5;

const DeckSelectPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams?.get('missionId');
  const opponentId = searchParams?.get('opponentId');

  const [user, setUser] = useState<User | null>(null);
  const [collection, setCollection] = useState<PlayerCard[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }
      setUser(user);

      try {
        const { data, error: collectionError } = await supabase
          .from('player_cards')
          .select('*, cards(*)')
          .eq('player_id', user.id);

        if (collectionError) throw collectionError;

        const transformedCards = data.map((c: any) => ({
          ...c,
          cards: Array.isArray(c.cards) ? c.cards[0] : c.cards,
        }));
        setCollection(transformedCards as PlayerCard[]);

      } catch (err: any) {
        setError(err.message || 'Failed to load your collection.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [router]);

  const handleCardSelect = (cardId: number) => {
    setSelectedCardIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(cardId)) {
        newSelection.delete(cardId);
      } else {
        if (newSelection.size < MAX_DECK_SIZE) {
          newSelection.add(cardId);
        }
      }
      return newSelection;
    });
  };

  const handleConfirmDeck = () => {
    if (selectedCardIds.size === 0) {
      alert('Please select at least one card');
      return;
    }

    const deckString = Array.from(selectedCardIds).join(',');
    let battleUrl = '/battle-arena/engage';

    if (missionId) {
      battleUrl += `?missionId=${missionId}&deck=${deckString}`;
    } else if (opponentId) {
      battleUrl += `?opponentId=${opponentId}&deck=${deckString}`;
    } else {
      setError("No battle context found.");
      return;
    }
    
    router.push(battleUrl);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your collection...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center text-yellow-400 mb-4">Select Your Deck</h1>
      <p className="text-center text-gray-300 mb-8">Choose up to {MAX_DECK_SIZE} cards for this battle.</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {collection.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardSelect(card.id)}
            className={`cursor-pointer rounded-lg transition-all duration-200 ${selectedCardIds.has(card.id) ? 'ring-4 ring-yellow-400 scale-105' : 'ring-2 ring-transparent'}`}
          >
            <Card card={card} />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm p-4 text-center border-t border-gray-700">
        <button
          onClick={handleConfirmDeck}
          disabled={selectedCardIds.size === 0}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded-lg text-xl
                     disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Confirm Deck ({selectedCardIds.size}/{MAX_DECK_SIZE})
        </button>
      </div>
    </div>
  );
};

export default DeckSelectPage;