import { createPagesClient } from '@/utils/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  message: string;
  player_power?: number;
  opponent_power?: number;
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

  const { opponentId, playerDeckIds } = req.body;

  if (!opponentId || !playerDeckIds || !Array.isArray(playerDeckIds) || playerDeckIds.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing opponentId or playerDeckIds.' 
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
    console.log('Initiating PvP battle:', {
      userId: user.id,
      opponentId,
      playerCardCount: playerDeckIds.length
    });

    // Get player's cards
    const { data: playerCards, error: playerCardsError } = await supabase
      .from('player_cards')
      .select('*, cards(*)')
      .in('id', playerDeckIds);

    if (playerCardsError) throw playerCardsError;

    // Get opponent's cards (you might need to adjust this based on your data model)
    const { data: opponentCards, error: opponentCardsError } = await supabase
      .from('player_cards')
      .select('*, cards(*)')
      .eq('player_id', opponentId)
      .limit(playerDeckIds.length); // Match the number of cards

    if (opponentCardsError) throw opponentCardsError;

    // Execute the battle
    const { data: battleResult, error: battleError } = await supabase.rpc('complete_pvp_battle', {
      p_user_id: user.id,
      p_opponent_id: opponentId,
      p_player_card_ids: playerDeckIds,
    });

    if (battleError) throw battleError;

    console.log('Battle completed successfully:', battleResult);
    return res.status(200).json({ 
      success: true, 
      message: 'Battle completed successfully',
      ...battleResult,
      playerDeck: playerCards,
      opponentDeck: opponentCards
    });

  } catch (err: any) {
    console.error('Error in PvP battle:', err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || 'An internal error occurred during battle.' 
    });
  }
}
