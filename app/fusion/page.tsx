"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import type { PlayerCard } from '@/app/collection/page';

export default function FusionPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [allCards, setAllCards] = useState<PlayerCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [firstSelection, setFirstSelection] = useState<PlayerCard | null>(null);
    const [secondSelection, setSecondSelection] = useState<PlayerCard | null>(null);
    
    const [fusionStatus, setFusionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                router.push('/login');
                return;
            }
            setUser(user);

            try {
                const { data, error } = await supabase
                    .from('player_cards')
                    .select('*, cards(*)')
                    .eq('player_id', user.id)
                    .eq('fused', false)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const transformedCards = data.map((c: any) => ({
                    ...c,
                    cards: Array.isArray(c.cards) ? c.cards[0] : c.cards,
                }));
                setAllCards(transformedCards);
            } catch (err: any) {
                setError(err.message || 'Failed to load cards.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const fusibleCards = useMemo(() => {
        const cardCounts: { [key: string]: number } = {};
        allCards.forEach(card => {
            if (card.cards?.name) {
                cardCounts[card.cards.name] = (cardCounts[card.cards.name] || 0) + 1;
            }
        });

        return allCards.filter(card => card.cards?.name && cardCounts[card.cards.name] >= 2);
    }, [allCards]);

    const handleSelectCard = (card: PlayerCard) => {
        if (fusionStatus) setFusionStatus(null);

        if (!firstSelection) {
            setFirstSelection(card);
            return;
        }

        if (firstSelection && !secondSelection) {
            if (firstSelection.id === card.id) {
                setFirstSelection(null); // Deselect if clicking the same card
                return;
            }
            if (firstSelection.cards?.name === card.cards?.name) {
                setSecondSelection(card); // Set as sacrifice
                return;
            }
        }
        
        // Any other click resets and starts a new selection
        setSecondSelection(null);
        setFirstSelection(card);
    };

    const handleResetSelection = () => {
        setFirstSelection(null);
        setSecondSelection(null);
    }

    const handleFuse = async () => {
        if (!firstSelection || !secondSelection) return;
        setLoading(true);
        setFusionStatus(null);

        try {
            const response = await fetch('/api/fuse-cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    baseCardId: firstSelection.id,
                    sacrificeCardId: secondSelection.id,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Fusion failed');
            }

            setFusionStatus({ message: 'Fusion successful! Your card has been empowered.', type: 'success' });
            
            setAllCards(prev => {
                const withoutSacrificed = prev.filter(c => c.id !== secondSelection.id);
                return withoutSacrificed.map(c => 
                    c.id === firstSelection.id 
                        ? { ...c, ...result.updatedCard, cards: c.cards }
                        : c
                );
            });

            handleResetSelection();

        } catch (err: any) {
            setFusionStatus({ message: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && fusibleCards.length === 0) {
        return <div className="text-center p-8"><p>Loading your cards...</p></div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-cover bg-center bg-fixed p-4 sm:p-8" style={{ backgroundImage: 'url("/brick.svg")' }}>
            <div className="max-w-7xl mx-auto">
                <header className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-xl border border-gray-700 text-center">
                    <h1 className="text-4xl font-bold text-yellow-400">Card Fusion</h1>
                    <p className="text-gray-300 mt-2">Combine two identical cards to create a more powerful, fused version.</p>
                </header>

                <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-4 mb-8 sticky top-4 z-10 border border-gray-700">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-xl font-semibold text-white">
                                { !firstSelection ? "1. Select a Base Card" : !secondSelection ? "2. Select a card to sacrifice" : "Ready to Fuse!" }
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                                {firstSelection ? <Card card={firstSelection} /> : <span className="text-gray-400 text-sm">Base</span>}
                            </div>
                            <span className="text-2xl font-bold text-yellow-400">+</span>
                             <div className="w-24 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                                {secondSelection ? <Card card={secondSelection} /> : <span className="text-gray-400 text-sm">Sacrifice</span>}
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center md:justify-end gap-2">
                            <button 
                                onClick={handleFuse}
                                disabled={!firstSelection || !secondSelection || loading}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Fusing...' : 'Fuse'}
                            </button>
                            <button 
                                onClick={handleResetSelection}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    {fusionStatus && (
                        <p className={`text-center mt-4 ${fusionStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {fusionStatus.message}
                        </p>
                    )}
                </div>

                <main className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-center text-white">Your Fusible Cards</h2>
                    
                    {fusibleCards.length === 0 && !loading && (
                        <p className="text-center text-gray-400">You have no cards eligible for fusion. You need at least two of the same unfused card.</p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {fusibleCards.map(card => {
                            const isBase = firstSelection?.id === card.id;
                            const isSacrifice = secondSelection?.id === card.id;
                            const isDisabled = firstSelection && !secondSelection && (firstSelection.cards?.name !== card.cards?.name || firstSelection.id === card.id);

                            return (
                                <div 
                                    key={card.id} 
                                    onClick={() => !isDisabled && handleSelectCard(card)} 
                                    className={`rounded-lg overflow-hidden transition-all duration-200 ${
                                        isBase ? 'ring-4 ring-yellow-400 scale-105' : 
                                        isSacrifice ? 'ring-4 ring-red-500 scale-105' : 
                                        isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                                    }`}
                                >
                                    <Card card={card} />
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}
