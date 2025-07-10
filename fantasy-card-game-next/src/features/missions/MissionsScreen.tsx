// src/features/missions/MissionsScreen.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

type Mission = {
  id: number;
  name: string;
  description: string;
  order: number;
  reward_credits: number;
};

type CompletedMission = {
  mission_id: number;
};

const MissionsScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const [missionsResult, completedResult] = await Promise.all([
          supabase.from('missions').select('*').order('order', { ascending: true }),
          supabase.from('player_missions').select('mission_id').eq('player_id', user.id)
        ]);

        if (missionsResult.error) throw missionsResult.error;
        setMissions(missionsResult.data);

        if (completedResult.error) throw completedResult.error;
        const completedSet = new Set(completedResult.data.map(m => m.mission_id));
        setCompletedMissions(completedSet);

      } catch (err: any) {
        setError(err.message || 'Failed to load missions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const pathData = useMemo(() => {
    if (missions.length < 2) return "";
    
    const pathPoints = missions.map((mission, index) => {
      const y = 80 + index * 192; // 80 is top offset, 192 is space-y-16 (16*4=64) + node height (128)
      const x = index % 2 === 0 ? 96 : 870; // 96 is node width/2, 870 is container width - node width/2
      return `${x},${y}`;
    });

    return `M ${pathPoints.join(" L ")}`;
  }, [missions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url("/brick.svg")' }}>
      <div className="min-h-screen text-white p-8">
        <h1 className="text-4xl font-bold text-center text-yellow-400 mb-12">Missions</h1>
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Draw connecting lines */}
          <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="xMidYMid meet" viewBox="0 0 960 1000">
            <path
              d={pathData}
              stroke="rgb(255, 255, 255)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="8, 8"
            />
          </svg>
          
          <div className="relative space-y-16">
            {missions.map((mission, index) => {
              const isCompleted = completedMissions.has(mission.id);
              const isEven = index % 2 === 0;
              return (
                <div
                  key={mission.id}
                  className={`flex items-center ${isEven ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    onClick={() => router.push(`/missions/${mission.id}`)}
                    className="w-48 h-32 bg-gray-800 border-2 border-blue-700 rounded-lg shadow-lg cursor-pointer
                               flex flex-col justify-center items-center text-center p-4
                               hover:bg-gray-700 hover:border-yellow-500 transition-all duration-300"
                  >
                    <h2 className="text-lg font-bold">{mission.name}</h2>
                    <p className="text-sm text-gray-400 mt-1">Credits: {mission.reward_credits}</p>
                    {isCompleted && (
                      <div className="text-xs text-green-400 mt-2 font-bold">✓ COMPLETED</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionsScreen;