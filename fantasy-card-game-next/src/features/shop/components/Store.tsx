'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/models/Card';
import { purchaseCard, getDailyCards, openCardPack } from '@/features/shop/shopService';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

const Store = () => {
  const [dailyCards, setDailyCards] = useState<Card[]>([]);
  const [packCard, setPackCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
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

  const handlePurchase = async (cardId: number) => {
    if (!user) {
      setError('You must be logged in to purchase cards.');
      return;
    }
    try {
      await purchaseCard(cardId);
      // Refresh user credits or show success message
    } catch (err) {
      setError('Failed to purchase card.');
    }
  };

  const handleOpenPack = async () => {
    if (!user) {
      setError('You must be logged in to open packs.');
      return;
    }
    try {
      const newCard = await openCardPack(1); // Assuming pack ID 1
      setPackCard(newCard);
    } catch (err) {
      setError('Failed to open card pack.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Card Shop</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Daily Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyCards.map((card) => (
            <div key={card.id} className="border p-4 rounded-lg">
              <h3 className="text-xl font-bold">{card.name}</h3>
              <p>{card.description}</p>
              <p>Power: {card.attack + card.defense}</p>
              <p>Rarity: {card.rarity}</p>
              <button
                onClick={() => handlePurchase(Number(card.id))}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Purchase
              </button>
            </div>
          ))}
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
        {packCard && (
          <div className="mt-4 border p-4 rounded-lg">
            <h3 className="text-xl font-bold">You got: {packCard.name}!</h3>
            <p>{packCard.description}</p>
            <p>Power: {packCard.attack + packCard.defense}</p>
            <p>Rarity: {packCard.rarity}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Store;
