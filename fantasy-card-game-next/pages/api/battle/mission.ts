import { createPagesClient } from '@/utils/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  message: string;
  player_power?: number;
  mission_power?: number;
  rewards?: any;
  playerDeck?: any[];
  opponentDeck?: any[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  const { missionId, playerDeckIds } = req.body;

  if (!missionId || !playerDeckIds || !Array.isArray(playerDeckIds) || playerDeckIds.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing missionId or playerDeckIds.' 
    });
  }

  const supabase = createPagesClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Authentication error:', authError);
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Please log in to continue.' 
    });
  }

  try {
    console.log('Initiating mission battle:', {
      userId: user.id,
      missionId,
      playerCardCount: playerDeckIds.length
    });

    // Get player's cards
    const { data: playerCards, error: playerCardsError } = await supabase
      .from('player_cards')
      .select('*, cards(*)')
      .eq('player_id', user.id)
      .in('id', playerDeckIds);

    if (playerCardsError) throw playerCardsError;

    // Get mission's cards from the cards table using the mission's opponent_card_ids
    const { data: missionData, error: missionError } = await supabase
      .from('missions')
      .select('opponent_card_ids')
      .eq('id', missionId)
      .single();

    if (missionError) throw missionError;
    if (!missionData) throw new Error('Mission not found');

    // Get the actual card data for the opponent's deck
    const { data: missionCards, error: missionCardsError } = await supabase
      .from('cards')
      .select('*')
      .in('id', missionData.opponent_card_ids);

    if (missionCardsError) throw missionCardsError;

    // Format mission cards to match player cards structure for consistency
    const formattedMissionCards = missionCards.map(card => ({
      id: card.id,
      card_id: card.id,
      player_id: 'mission',
      level: 1,
      xp: 0,
      cards: {
        id: card.id,
        name: card.name,
        description: card.description,
        image_url: card.image_url,
        rarity: card.rarity,
        type: card.type,
        base_attack: card.base_attack,
        base_defense: card.base_defense,
        fusible: card.fusible
      }
    }));

    // Execute the battle
    const { data: battleResult, error: battleError } = await supabase.rpc('complete_mission_battle', {
      p_user_id: user.id,
      p_mission_id: missionId,
      p_player_card_ids: playerDeckIds,
    });

    if (battleError) throw battleError;

    console.log('Mission battle completed successfully:', battleResult);
    return res.status(200).json({ 
      success: true, 
      message: 'Mission completed successfully',
      ...battleResult,
      playerDeck: playerCards,
      opponentDeck: formattedMissionCards
    });

  } catch (err: any) {
    console.error('Error in mission battle:', err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || 'An internal error occurred during mission battle.' 
    });
  }
}
