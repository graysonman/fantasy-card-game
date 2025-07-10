'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/Card';
import type { PlayerCard } from '@/app/collection/page';
import { supabase } from '@/utils/supabaseClient';

type Profile = {
  credits: number;
};

type RouteParams = {
  cardId: string;
};

const UpgradePage = () => {
  const router = useRouter();
  const params = useParams<RouteParams>();
  const cardId = params?.cardId as string;

  const [playerCard, setPlayerCard] = useState<PlayerCard | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!cardId) {
      setError('Card ID is missing');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('You must be logged in to view this page.');
          router.push('/login');
          return;
        }

        const { data: cardData, error: cardError } = await supabase
          .from('player_cards')
          .select('*, cards(*)')
          .eq('id', cardId)
          .eq('player_id', user.id)
          .single();

        if (cardError || !cardData) {
          throw new Error("Card not found or you don't own it.");
        }

        setPlayerCard(cardData as PlayerCard);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.warn('Profile fetch warning:', profileError.message);
        }

        if (profileData) {
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while loading card data.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cardId, router]);

  const handleUpgrade = async (currency: 'credits' | 'xp') => {
    if (!playerCard) return;

    setIsUpgrading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        throw new Error('User not logged in');
      }

      const { data, error: upgradeError } = await supabase.rpc(
        'upgrade_card',
        {
          p_player_card_id: playerCard.id,
          p_user_id: currentUser.id,
          p_currency: currency,
        }
      );

      if (upgradeError) {
        throw upgradeError;
      }

      // Update card and profile state from the returned data
      setPlayerCard(prev => prev ? {
        ...prev,
        level: data.new_level,
        current_attack: data.new_attack,
        current_defense: data.new_defense,
        xp: data.new_xp ?? prev.xp,
      } : null);

      if (data.new_credits !== null && data.new_credits !== undefined) {
        setProfile(prev => prev ? { ...prev, credits: data.new_credits } : null);
      }


      setSuccess('Card upgraded successfully!');
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to upgrade card'
      );
    } finally {
      setIsUpgrading(false);
    }
  };

  // --- Render States ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading card details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-6 rounded-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!playerCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-300 mb-4">Card Not Found</h2>
          <button
            onClick={() => router.push('/mypage')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to My Page
          </button>
        </div>
      </div>
    );
  }
  
  const upgradeCost = playerCard.level * 100;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url("/brick.svg")' }}
    >
      <div className="min-h-screen bg-gray-900/80">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mb-6 inline-flex items-center"
            >
              ← Back to Collection
            </button>

            <h1 className="text-3xl font-bold text-center mb-8">Upgrade Card</h1>

            {success && (
              <div className="bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-lg mb-6">
                {success}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <div className="w-64">
                  <Card card={playerCard} />
                </div>
              </div>

              <div>
                <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold mb-2">Current Stats</h3>
                  <p>Level: <span className="font-bold">{playerCard.level}</span></p>
                  <p>Attack: <span className="font-bold text-red-400">{playerCard.current_attack}</span></p>
                  <p>Defense: <span className="font-bold text-blue-400">{playerCard.current_defense}</span></p>
                  <p>XP: <span className="font-bold">{playerCard.xp}</span></p>
                  <p className="mt-2">Credits: <span className="font-bold text-yellow-400">{profile?.credits ?? 0}</span></p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold mb-2">Upgrade Cost</h3>
                  <p>Cost: <span className="font-bold">{upgradeCost}</span> credits or XP</p>
                  <p className="text-sm text-gray-400 mt-1">Upgrading will increase your card's level and stats.</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => handleUpgrade('credits')}
                    disabled={isUpgrading || (profile?.credits ?? 0) < upgradeCost}
                    className={`w-full py-3 px-6 rounded-lg font-bold transition-colors ${
                      (profile?.credits ?? 0) < upgradeCost
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    } ${isUpgrading ? 'opacity-75' : ''}`}
                  >
                    {isUpgrading ? 'Upgrading...' : `Upgrade with Credits`}
                  </button>

                  <button
                    onClick={() => handleUpgrade('xp')}
                    disabled={isUpgrading || playerCard.xp < upgradeCost}
                    className={`w-full py-3 px-6 rounded-lg font-bold transition-colors ${
                      playerCard.xp < upgradeCost
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    } ${isUpgrading ? 'opacity-75' : ''}`}
                  >
                    {isUpgrading ? 'Upgrading...' : `Upgrade with XP`}
                  </button>
                </div>

                {(profile?.credits ?? 0) < upgradeCost && (
                  <p className="text-red-400 text-sm mt-2 text-center">
                    Not enough credits to upgrade.
                  </p>
                )}
                 {playerCard.xp < upgradeCost && (
                  <p className="text-red-400 text-sm mt-2 text-center">
                    Not enough XP to upgrade.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
