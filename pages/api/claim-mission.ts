import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '../../src/utils/supabaseServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const supabase = createSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // TODO: Validate mission completion, prevent abuse, etc.

  res.status(200).json({ message: 'Mission claim logic will go here.', userId: user.id });
}
