// pages/api/upgrade-card.ts
import { createPagesClient } from '@/utils/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabase = createPagesClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { playerCardId, currency } = req.body;

  if (!playerCardId || !currency) {
    return res.status(400).json({ error: 'Player card ID and currency are required.' });
  }

  if (currency !== 'credits' && currency !== 'xp') {
    return res.status(400).json({ error: 'Invalid currency type.' });
  }

  try {
    // Use the new stored procedure to handle the upgrade transaction securely
    const { data, error } = await supabase.rpc('upgrade_card', {
      p_player_card_id: playerCardId,
      p_user_id: user.id,
      p_currency: currency,
    });

    if (error) {
      // The RPC function will throw an error if checks fail
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Card upgraded successfully!', ...data });

  } catch (err: any) {
    console.error('Unexpected error during card upgrade:', err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
