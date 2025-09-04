import { createPagesClient } from '@/utils/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';

type Card = {
  id: number;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Legendary';
};

const rarityWeights = {
  'Common': 60,
  'Uncommon': 30,
  'Rare': 10,
};

const getWeightedRandomCard = (cards: Card[]): Card => {
  const weightedList: Card[] = [];
  cards.forEach(card => {
    const rarity = card.rarity as keyof typeof rarityWeights;
    if (rarityWeights[rarity]) {
      for (let i = 0; i < rarityWeights[rarity]; i++) {
        weightedList.push(card);
      }
    }
  });
  const randomIndex = Math.floor(Math.random() * weightedList.length);
  return weightedList[randomIndex];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabase = createPagesClient(req, res);
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tutorial_complete')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return res.status(500).json({ error: 'Could not retrieve user profile.' });
  }

  if (profile.tutorial_complete) {
    return res.status(400).json({ error: 'Tutorial already completed.' });
  }

  const { data: availableCards, error: cardsError } = await supabase
    .from('cards')
    .select('id, name, rarity')
    .in('rarity', ['Common', 'Uncommon', 'Rare']);

  if (cardsError || !availableCards || availableCards.length === 0) {
    return res.status(500).json({ error: 'Could not retrieve starter cards.' });
  }

  const awardedCard = getWeightedRandomCard(availableCards as Card[]);

  const { error: transactionError } = await supabase.rpc('complete_tutorial_and_grant_card', {
    p_user_id: user.id,
    p_card_id: awardedCard.id
  });

  if (transactionError) {
    console.error('Transaction error:', transactionError);
    return res.status(500).json({ error: 'Failed to complete tutorial. Please try again.' });
  }
  
  const { data: fullCardData, error: cardDetailsError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', awardedCard.id)
    .single();

  if(cardDetailsError) {
    return res.status(500).json({ error: 'Card granted, but failed to retrieve details.' });
  }

  res.status(200).json({ message: 'Tutorial completed successfully!', card: fullCardData });
}
