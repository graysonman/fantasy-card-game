"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  tutorial_complete: boolean;
  username: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const completeTutorial = async () => {
    if (!user) return;
    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({ tutorial_complete: true })
      .eq("id", user.id);
    if (!error) {
      setProfile((p) => p ? { ...p, tutorial_complete: true } : p);
    }
    setUpdating(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-900"><div>Loading...</div></div>;

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  const CenteredContainer = ({ children }: { children: React.ReactNode }) => (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center w-full max-w-lg px-4">{children}</div>
    </main>
  );

  if (profile && !profile.tutorial_complete) {
    return (
      <CenteredContainer>
        <div className="bg-gray-800 rounded-lg p-6 w-full text-center shadow-lg">
          <div className="text-white mb-2">Welcome to the tutorial!</div>
          {/* Add your tutorial steps here */}
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-60"
            onClick={completeTutorial}
            disabled={updating}
          >
            {updating ? "Completing..." : "Complete Tutorial"}
          </button>
        </div>
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

  return <div className="flex min-h-screen items-center justify-center bg-gray-900"><div>Loading profile...</div></div>;
}
