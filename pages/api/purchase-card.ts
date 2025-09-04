import { createPagesClient } from '@/utils/supabaseServer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const supabase = createPagesClient(req, res);
      const { card_id } = req.body;
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { data, error } = await supabase.rpc('purchase_card', {
        p_user_id: user.id,
        p_card_id: card_id
      });

      if (error) {
        throw error;
      }

      res.status(200).json({ new_credits: data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
