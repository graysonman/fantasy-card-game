'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/models/Card';
import CardComponent from '@/components/Card';

import { purchaseCard, getDailyCards, openCardPack } from '@/features/shop/shopService';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

type Profile = {
  credits: number;
  // add other profile fields as needed
};

const Store = () => {
  const [dailyCards, setDailyCards] = useState<Card[]>([]);
  const [packCard, setPackCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [purchasedCardIds, setPurchasedCardIds] = useState<string[]>([]);
  const [isPackOpening, setIsPackOpening] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setError('Failed to fetch profile.');
          console.error(profileError);
        } else {
          setProfile(profileData);
        }
      }
    }
    fetchUserAndProfile();
  }, []);

  useEffect(() => {
    const fetchDailyCards = async () => {
      try {
        setLoading(true);
        const cards = await getDailyCards();
        setDailyCards(cards);
      } catch (err) {
        setError('Failed to fetch daily cards.');
      } finally {
        setLoading(false);
      }
    };

    fetchDailyCards();
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Notification disappears after 3 seconds
  };

  const handlePurchase = async (card: Card) => {
    if (!user || !profile) {
      setError('You must be logged in to purchase cards.');
      return;
    }

    const cardCost = card.attack + card.defense;
    if (profile.credits < cardCost) {
      showNotification('Not enough credits.');
      return;
    }

    try {
      await purchaseCard(Number(card.id));
      showNotification(`Successfully purchased ${card.name}!`);
      setPurchasedCardIds([...purchasedCardIds, card.id]);
      setProfile({ ...profile, credits: profile.credits - cardCost });
    } catch (err) {
      setError('Failed to purchase card.');
      showNotification('Purchase failed. Please try again.');
    }
  };

  const handleOpenPack = async () => {
    if (!user || !profile) {
      setError('You must be logged in to open packs.');
      return;
    }

    const packCost = 100;
    if (profile.credits < packCost) {
      showNotification('Not enough credits.');
      return;
    }

    try {
      const newCard = await openCardPack(1); // Assuming pack ID 1
      setPackCard(newCard);
      setIsPackOpening(true);
      setProfile({ ...profile, credits: profile.credits - packCost });
      setTimeout(() => {
        setIsPackOpening(false);
        setPackCard(null);
      }, 5000); // Modal disappears after 5 seconds
    } catch (err) {
      setError('Failed to open card pack.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4 bg-gray-800 rounded-lg relative">
      {notification && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white py-4 px-6 rounded-lg shadow-lg z-50 animate-bounce">
          {notification}
        </div>
      )}
      {isPackOpening && packCard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4">You got a new card!</h2>
            <CardComponent card={packCard} displayMode="simple" />
            <p className="mt-4 text-lg">This card has been added to your collection.</p>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4">Card Shop</h1>
      <div className="text-xl mb-4">Credits: {profile?.credits ?? '...'}</div>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Daily Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyCards.map((card) => {
            const isPurchased = purchasedCardIds.includes(card.id);
            return (
              <div key={card.id} className="flex flex-col items-center">
                <CardComponent card={card} />
                <p className="text-lg font-bold mt-2">Cost: {card.attack + card.defense}</p>
                <button
                  onClick={() => handlePurchase(card)}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-500"
                  disabled={isPurchased}
                >
                  {isPurchased ? 'Purchased' : 'Purchase'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Card Packs</h2>
        <button
          onClick={handleOpenPack}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Open Standard Pack (100 Credits)
        </button>
      </section>
    </div>
  );
};

export default Store;
