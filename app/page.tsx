"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Card from "@/components/Card";
import Tutorial from "@/components/Tutorial"; // Import the new Tutorial component
import type { PlayerCard } from "./collection/page";

type CardData = {
  id: number;
  name: string;
  description: string;
  image_url: string;
  rarity: string;
  type: string;
  base_attack: number;
  base_defense: number;
};

type Profile = {
  id: string;
  tutorial_complete: boolean;
  username: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [awardedCard, setAwardedCard] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("id, tutorial_complete, username")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching profile:", error);
            setError(`Error fetching profile: ${error.message}`);
          } else {
            setProfile(data);
          }
          setProfileLoading(false);
        });
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  const completeTutorial = async () => {
    if (!user) return;
    setUpdating(true);
    setError(null);
    try {
      const response = await fetch('/api/complete-tutorial', {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }
      setAwardedCard(result.card);
      setTimeout(() => {
        setProfile((p) => (p ? { ...p, tutorial_complete: true } : p));
      }, 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white"><div>Loading...</div></div>;

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  if (profileLoading) return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white"><div>Loading profile...</div></div>;

  const CenteredContainer = ({ children }: { children: React.ReactNode }) => (
    <main className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center w-full max-w-lg px-4">{children}</div>
    </main>
  );

  if (profile && !profile.tutorial_complete) {
    return (
      <CenteredContainer>
        {awardedCard ? (
          <div className="bg-gray-800 rounded-lg p-6 w-full text-center shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Tutorial Complete!</h2>
            <p className="text-gray-300 mb-4">You have been awarded your first card:</p>
            <div className="flex justify-center">
              <Card card={{ 
                id: awardedCard.id, 
                level: 1, 
                xp: 0, 
                in_deck: false, 
                current_attack: awardedCard.base_attack,
                current_defense: awardedCard.base_defense,
                cards: {
                  name: awardedCard.name,
                  description: awardedCard.description,
                  image_url: awardedCard.image_url,
                  rarity: awardedCard.rarity,
                  type: awardedCard.type,
                  base_attack: awardedCard.base_attack,
                  base_defense: awardedCard.base_defense,
                  fuseable: true
                }
              }} />
            </div>
          </div>
        ) : (
          <Tutorial
            step={tutorialStep}
            onNext={() => setTutorialStep(step => step + 1)}
            onBack={() => setTutorialStep(step => step - 1)}
            onComplete={completeTutorial}
            isCompleting={updating}
          />
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </CenteredContainer>
    );
  }

  if (profile && profile.tutorial_complete) {
    return (
      <CenteredContainer>
        <div className="bg-gray-800 rounded-lg p-6 w-full text-center shadow-lg">
          <div className="text-white mb-2">
            Welcome back, <span className="font-bold">{profile.username}</span>!
          </div>
          <div className="text-gray-300 mb-4">
            Here are your current events and missions:
          </div>
          <ul className="text-blue-300 list-disc list-inside">
            <li>Battle Event: Dragon's Lair</li>
            <li>Daily Mission: Win 3 Battles</li>
            <li>Special: Collect 5 Fire Cards</li>
          </ul>
        </div>
      </CenteredContainer>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div>
        Could not load profile.
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
