"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import type { PlayerCard } from '@/app/collection/page';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

type Profile = {
  username: string;
  level: number;
  credits: number;
};

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<PlayerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }
      setUser(user);

      try {
        const [profileResult, cardsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('username, level, credits')
            .eq('id', user.id)
            .single(),
          supabase
            .from('player_cards')
            .select('*, cards(*)')
            .eq('player_id', user.id)
            .order('created_at', { ascending: false })
        ]);

        if (profileResult.error) throw profileResult.error;
        setProfile(profileResult.data as Profile);

        if (cardsResult.error) throw cardsResult.error;
        
        // Transform the data to match the PlayerCard type
        const transformedCards = cardsResult.data.map((c: any) => ({
          ...c,
          cards: Array.isArray(c.cards) ? c.cards[0] : c.cards,
        }));
        setCards(transformedCards as PlayerCard[]);

      } catch (err: any) {
        setError(err.message || 'Failed to load page data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading Your Page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!user || !profile) {
    // This state can be hit briefly before the redirect.
    // A loading indicator or null render is appropriate.
    return null;
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url("/brick.svg")' }}>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <header className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-xl border border-gray-700">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2 text-center">{profile.username}</h1>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-4 text-lg">
              <span className="bg-gray-700/80 px-4 py-2 rounded-lg">
                Level: <span className="font-bold text-green-400">{profile.level || 1}</span>
              </span>
              <span className="bg-gray-700/80 px-4 py-2 rounded-lg">
                Credits: <span className="font-bold text-blue-400">{profile.credits || 0}</span>
              </span>
            </div>
          </header>

          <main className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Your Collection</h2>
            {cards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {cards.map((playerCard) => (
                  <Link
                    key={playerCard.id}
                    href={`/mypage/upgrade/${playerCard.id}`}
                    className="block transform hover:scale-105 transition-transform duration-300"
                  >
                    <Card card={playerCard} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-300 mb-6">Your collection is empty</p>
                <Link
                  href="/collection"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/20"
                >
                  Get Your First Card
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}