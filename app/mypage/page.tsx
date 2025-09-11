"use client";
import { useState, useEffect, useMemo } from 'react';
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

const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const TYPES = ["Strength", "Finesse", "Speed"];


export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<PlayerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filters, setFilters] = useState({
    name: '',
    rarity: '',
    type: '',
    level: ''
  });

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
        setNewUsername(profileResult.data.username || '');

        if (cardsResult.error) throw cardsResult.error;
        
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

  const handleUsernameUpdate = async () => {
    if (!user || !newUsername.trim() || newUsername === profile?.username) {
        setIsEditingUsername(false);
        return;
    }
    setLoading(true);
    setUpdateStatus(null);

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ username: newUsername.trim() })
            .eq('id', user.id);

        if (error) {
            throw new Error(error.message.includes('duplicate key value') ? 'Username is already taken.' : error.message);
        }

        setProfile(prev => prev ? { ...prev, username: newUsername.trim() } : null);
        setUpdateStatus({ message: 'Username updated successfully!', type: 'success' });
        setIsEditingUsername(false);
    } catch (err: any) {
        setUpdateStatus({ message: err.message, type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredCards = useMemo(() => {
    return cards.filter(playerCard => {
      const card = playerCard.cards;
      if (!card) return false;

      const nameMatch = filters.name ? card.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
      const rarityMatch = filters.rarity ? card.rarity === filters.rarity : true;
      const typeMatch = filters.type ? card.type === filters.type : true;
      const levelMatch = filters.level ? playerCard.level >= parseInt(filters.level) : true;

      return nameMatch && rarityMatch && typeMatch && levelMatch;
    });
  }, [cards, filters]);


  if (loading && !profile) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url("/brick.svg")' }}>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <header className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-xl border border-gray-700">
            <div className="text-center">
                {isEditingUsername ? (
                    <div className="flex justify-center items-center gap-2">
                        <input 
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="bg-gray-700 text-white text-4xl font-bold text-center rounded p-2"
                            autoFocus
                        />
                        <button onClick={handleUsernameUpdate} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                            Save
                        </button>
                        <button onClick={() => setIsEditingUsername(false)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center items-center gap-4">
                        <h1 className="text-4xl font-bold text-yellow-400">{profile.username}</h1>
                        <button onClick={() => setIsEditingUsername(true)} className="text-yellow-400 hover:text-yellow-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                )}
                 {updateStatus && (
                    <p className={`mt-4 text-sm ${updateStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {updateStatus.message}
                    </p>
                )}
            </div>
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
            <div className="mb-8 p-4 bg-gray-900/70 rounded-lg border border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Filter by name..."
                        value={filters.name}
                        onChange={handleFilterChange}
                        className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                    />
                    <select name="rarity" value={filters.rarity} onChange={handleFilterChange} className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
                        <option value="">All Rarities</option>
                        {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
                        <option value="">All Types</option>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                        type="number"
                        name="level"
                        placeholder="Min level"
                        value={filters.level}
                        onChange={handleFilterChange}
                        className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                        min="1"
                    />
                </div>
            </div>

            {filteredCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredCards.map((playerCard) => (
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
                <p className="text-xl text-gray-300 mb-6">
                    {cards.length > 0 ? "No cards match your filters." : "Your collection is empty"}
                </p>
                {cards.length === 0 && (
                    <Link
                    href="/collection"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/20"
                    >
                    Get Your First Card
                    </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}