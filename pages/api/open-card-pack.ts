import { createPagesClient } from '@/utils/supabaseServer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const supabase = createPagesClient(req, res);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { pack_id } = req.body;
      const { data, error } = await supabase.rpc('open_card_pack', {
        p_user_id: user.id,
        p_pack_id: pack_id
      });

      if (error) {
        console.error('Error opening card pack:', error);
        return res.status(500).json({ error: 'Failed to open card pack' });
      }

      res.status(200).json(data);
    } catch (error: any) {
      console.error('An unexpected error occurred:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
