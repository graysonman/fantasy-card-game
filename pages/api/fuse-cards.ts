// pages/api/fuse-cards.ts
import { createPagesClient } from '@/utils/supabaseServer';
import { NextApiRequest, NextApiResponse } from 'next';

const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Super Rare", "Legendary", "Ultra Legendary"];

const getNextRarity = (currentRarity: string): string | null => {
    const currentIndex = RARITY_ORDER.indexOf(currentRarity);
    if (currentIndex === -1 || currentIndex === RARITY_ORDER.length - 1) {
        return null;
    }
    return RARITY_ORDER[currentIndex + 1];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabase = createPagesClient(req, res);

    try {
        const { baseCardId, sacrificeCardId } = req.body;

        if (!baseCardId || !sacrificeCardId) {
            return res.status(400).json({ error: 'Missing card IDs' });
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }


        const [baseCardRes, sacCardRes] = await Promise.all([
            supabase
                .from('player_cards')
                .select(`*`)
                .eq('id', baseCardId)
                .single(),
            supabase
                .from('player_cards')
                .select(`*`)
                .eq('id', sacrificeCardId)
                .single()
        ]);

        if (baseCardRes.error || sacCardRes.error) throw new Error('Could not fetch cards.');
        const baseCard = baseCardRes.data;
        const sacCard = sacCardRes.data;

        if (baseCard.player_id !== user.id || sacCard.player_id !== user.id) {
            return res.status(403).json({ error: 'User does not own these cards.' });
        }
        if (baseCard.card_id !== sacCard.card_id) {
            return res.status(400).json({ error: 'Cards are not identical.' });
        }
        if (baseCard.fused || sacCard.fused) {
            return res.status(400).json({ error: 'One or more cards are already fused.' });
        }

        const [{ data: baseCardRow, error: baseCardErr }, { data: sacCardRow, error: sacCardErr }] =
        await Promise.all([
            supabase.from('cards').select('rarity').eq('id', baseCard.card_id).single(),
            supabase.from('cards').select('rarity').eq('id', sacCard.card_id).single(),
        ]);

        if (baseCardErr || sacCardErr) {
        console.error('Card lookup error:', baseCardErr || sacCardErr);
        return res.status(500).json({ error: 'Could not fetch base/sac card rarity' });
        }

        const baseRarity = baseCardRow?.rarity ?? baseCard.rarity ?? null;
        const nextRarity = getNextRarity(baseRarity);
        if (!nextRarity) {
            return res.status(400).json({ error: 'Card is already at maximum rarity.' });
        }

        const { error: deleteError } = await supabase.from('player_cards').delete().eq('id', sacCard.id);
        if (deleteError) throw deleteError;

        const { data: updatedCard, error: updateError } = await supabase
            .from('player_cards')
            .update({
                fused: true,
                rarity: nextRarity,
                current_attack: baseCard.current_attack * 2,
                current_defense: baseCard.current_defense * 2,
                level: 1,
            })
            .eq('id', baseCard.id)
            .select()
            .single();
        
        if (updateError) {
            throw updateError;
        }

        return res.status(200).json({ message: 'Fusion successful!', updatedCard });

    } catch (error: any) {
        console.error('Fusion API Error:', error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
}