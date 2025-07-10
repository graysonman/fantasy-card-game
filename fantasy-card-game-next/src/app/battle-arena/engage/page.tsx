"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Card from '@/components/Card';
import type { PlayerCard } from '@/app/collection/page';
import { User } from '@supabase/supabase-js';

type BattleResult = {
  success: boolean;
  message: string;
  player_power?: number;
  opponent_power?: number;
};

const EngageBattlePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams?.get('missionId');
  const opponentId = searchParams?.get('opponentId');
  const playerDeckIds = searchParams?.get('deck')?.split(',').map(Number) || [];

  const [user, setUser] = useState<User | null>(null);
  const [playerDeck, setPlayerDeck] = useState<PlayerCard[]>([]);
  const [opponentDeck, setOpponentDeck] = useState<PlayerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [animatedCards, setAnimatedCards] = useState<Set<number>>(new Set());

  const fetchBattleData = useCallback(async (user: any) => {
    if (isBattling || battleResult) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const deckParams = searchParams?.get('deck');
      const playerDeckIds = deckParams ? deckParams.split(',').map(Number) : [];
      
      let url = '';
      let body = {};
      
      if (missionId) {
        url = '/api/battle/mission';
        body = { missionId, playerDeckIds };
      } else if (opponentId) {
        url = '/api/battle/pvp';
        body = { opponentId, playerDeckIds };
      } else {
        throw new Error("No valid battle type found.");
      }
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }
      
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setPlayerDeck(data.playerDeck || []);
      setOpponentDeck(data.opponentDeck || []);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load battle data.');
      
      if (err.message === 'Unauthorized' || err.message === 'Not authenticated') {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [missionId, opponentId, isBattling, battleResult, searchParams, router]);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        if (isMounted) {
          setUser(user);
          await fetchBattleData(user);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to initialize battle: ' + (err as Error).message);
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, [fetchBattleData, router]);

  const handleStartBattle = async () => {
    setIsBattling(true);
    
    const allCards = [...opponentDeck.map(c => c.id), ...playerDeck.map(c => c.id)];
    for (let i = 0; i < allCards.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setAnimatedCards(prev => new Set(prev).add(allCards[i]));
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let response;
      if (missionId) {
        response = await fetch('/api/battle/mission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ missionId, playerDeckIds }),
        });
      } else if (opponentId) {
        response = await fetch('/api/battle/pvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opponentId, playerDeckIds }),
        });
      } else {
        throw new Error("No valid battle type found.");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'An error occurred during the battle.');
      setBattleResult(result);

    } catch (err: any) {
      setBattleResult({ success: false, message: err.message });
    }
  };

  const renderDeck = (deck: PlayerCard[], title: string) => (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
      <div className="flex justify-center items-center gap-4 flex-wrap min-h-[200px]">
        {deck.map(card => (
          <div key={card.id} className={`w-40 transition-transform duration-300 ${animatedCards.has(card.id) ? 'animate-shake' : ''}`}>
            <Card card={card} />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900">Loading Battle...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-h-screen text-white p-8">
      <div className="bg-gray-800 p-4 rounded-lg items-center">
      {renderDeck(opponentDeck, "Opponent's Deck")}
      
      <div className="text-center my-8">
        {!battleResult && (
          <button onClick={handleStartBattle} disabled={isBattling} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-12 rounded-lg text-xl">
            {isBattling ? 'Battling...' : 'Start Battle'}
          </button>
        )}
      </div>

      {renderDeck(playerDeck, "Your Deck")}

      {battleResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className={`text-4xl font-bold ${battleResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {battleResult.success ? 'Victory!' : 'Defeat!'}
            </h2>
            <p className="mt-4 text-lg">{battleResult.message}</p>
            
            <div className="mt-4 text-md">
              <p>Your Power: <span className="font-bold text-blue-400">{battleResult.player_power}</span></p>
              <p>Opponent Power: <span className="font-bold text-red-400">{battleResult.opponent_power}</span></p>
            </div>

            <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg" onClick={() => router.push('/')}>
              Continue
            </button>
          </div>
        </div>
        
      )}
    </div>
    </div>
  );
};

export default EngageBattlePage;