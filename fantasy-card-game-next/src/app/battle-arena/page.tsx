"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

type OpponentProfile = {
  id: string;
  username: string;
  level: number;
  cardCount: number;
};

const BattleHubPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [opponents, setOpponents] = useState<OpponentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchOpponents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }
      setUser(user);
      
      const { data: opponentsWithCards, error: opponentsError } = await supabase
        .rpc('get_opponents_with_cards', { 
          current_user_id: user.id, 
          limit_count: 3 
        });
      
      if (opponentsError) {
        throw opponentsError;
      }
      
      if (!opponentsWithCards || opponentsWithCards.length === 0) {
        setError('No opponents available. Try again later.');
        return;
      }
      
      setOpponents(opponentsWithCards);
    } catch (err: any) {
      setError(err.message || 'Failed to load opponents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchOpponents();
    }
  }, [fetchOpponents, initialized]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Finding worthy opponents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
        <div className="text-red-500 text-lg mb-4">
          {error}
        </div>
        <button
          onClick={fetchOpponents}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-8 text-center">Battle Arena</h1>
          
          {opponents.length === 0 ? (
            <div className="text-center">
              <p className="text-lg mb-4">No opponents found with cards.</p>
              <button
                onClick={fetchOpponents}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {opponents.map((opponent) => (
                <div 
                  key={opponent.id}
                  className="bg-gray-700 p-6 rounded-lg shadow-lg hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => router.push(`/deck-select?opponentId=${opponent.id}`)}
                >
                  <h3 className="text-xl font-semibold">{opponent.username}</h3>
                  <p className="text-gray-200">Level {opponent.level}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleHubPage;