// src/app/collection/page.tsx
import { createClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import Card from '@/components/Card';

// Define the structure of a player's card, combining data from both tables
export type PlayerCard = {
  id: number;
  level: number;
  xp: number;
  in_deck: boolean;
  current_attack: number;
  current_defense: number;
  fused: boolean;
  rarity: string;
  cards: {
    name: string;
    description: string;
    image_url: string;
    rarity: string;
    type: string;
    base_attack: number;
    base_defense: number;
    fuseable: boolean;
  } | null;
};

export default async function CollectionPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the player's cards and join with the card details
  const { data: playerCardsData, error } = await supabase
    .from('player_cards')
    .select(`
      id,
      level,
      xp,
      in_deck,
      current_attack,
      current_defense,
      cards (
        name,
        description,
        image_url,
        rarity,
        type,
        base_attack,
        base_defense
      )
    `)
    .eq('player_id', user.id);

  if (error) {
    console.error('Error fetching player cards:', error);
    // TODO: Add a proper error message component
    return <div className="text-red-500 text-center p-4">Error loading your collection.</div>;
  }

  // Transform the data to match the PlayerCard type, ensuring 'cards' is an object, not an array.
  const playerCards: PlayerCard[] = (playerCardsData || []).map((c: any) => ({
    ...c,
    cards: Array.isArray(c.cards) ? c.cards[0] : c.cards,
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">My Collection</h1>
      {playerCards && playerCards.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playerCards.map((playerCard) => (
            playerCard.cards ? (
              <Card key={playerCard.id} card={playerCard} />
            ) : null
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 mt-10">
          <p>Your collection is empty.</p>
          <p className="mt-2">Complete missions or visit the shop to get new cards!</p>
        </div>
      )}
    </div>
  );
}
