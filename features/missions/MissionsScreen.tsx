// src/features/missions/MissionsScreen.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { AutoSizer, List, ListRowRenderer, WindowScroller } from "react-virtualized";

type Mission = {
  id: number;
  name: string;
  description: string;
  order: number;
  reward_credits: number;
};

const ROW_HEIGHT = 192;   // 128 card + ~64 gap
const CARD_W = 192;       // w-48
const CARD_H = 128;       // h-32
const PAD_X = 32;         // left-8 / right-8 = 2rem = 32px

export default function MissionsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // refs for canvas overlay
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { router.push("/login"); return; }
      setUser(user);

      try {
        const [missionsResult, completedResult] = await Promise.all([
          supabase.from("missions").select("*").order("order", { ascending: true }),
          supabase.from("player_missions").select("mission_id").eq("player_id", user.id),
        ]);
        if (missionsResult.error) throw missionsResult.error;
        setMissions(missionsResult.data ?? []);
        if (completedResult.error) throw completedResult.error;
        setCompletedMissions(new Set((completedResult.data ?? []).map(m => m.mission_id)));
      } catch (e: any) {
        setError(e.message || "Failed to load missions.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // measure container width (for precise endpoints)
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setContainerWidth(w);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // helper to compute card centers
  const getCenters = useCallback((count: number, width: number) => {
    // left / right card centers
    const leftX = PAD_X + CARD_W / 2;
    const rightX = width - PAD_X - CARD_W / 2;
    const centers = new Array(count).fill(0).map((_, i) => {
      const isEven = i % 2 === 0;
      const x = isEven ? leftX : rightX;
      const y = i * ROW_HEIGHT + ROW_HEIGHT / 2;
      return { x, y, isEven };
    });
    return centers;
  }, []);

  // draw lines connecting centers exactly
  const drawConnectors = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const width = containerWidth;
    if (!width || missions.length < 2) {
      // clear
      const ctx0 = canvas.getContext("2d");
      if (ctx0) { ctx0.clearRect(0, 0, canvas.width, canvas.height); }
      return;
    }

    const totalHeight = missions.length * ROW_HEIGHT;

    // HiDPI setup
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${totalHeight}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(totalHeight * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale for DPR

    ctx.clearRect(0, 0, width, totalHeight);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.setLineDash([8, 8]);

    const centers = getCenters(missions.length, width);

    for (let i = 0; i < centers.length - 1; i++) {
      const a = centers[i];
      const b = centers[i + 1];

      // start at the card EDGE (not center) so it visibly touches the box
      const startX = a.isEven ? (PAD_X + CARD_W) : (width - PAD_X - CARD_W); // right edge of left card OR left edge of right card
      const endX   = b.isEven ? (PAD_X) : (width - PAD_X);                   // left edge of left card OR right edge of right card
      const startY = a.y;  // vertical middle of card a
      const endY   = b.y;  // vertical middle of card b

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }, [containerWidth, missions.length, getCenters]);

  // redraw when data/size changes
  useEffect(() => {
    drawConnectors();
    // also on resize (containerWidth effect triggers this)
  }, [drawConnectors]);

  const rowRenderer: ListRowRenderer = useCallback(({ index, key, style }) => {
    const mission = missions[index];
    if (!mission) return null;
    const isCompleted = completedMissions.has(mission.id);
    const isEven = index % 2 === 0;

    return (
      <div key={key} style={style as React.CSSProperties} className="relative">
        <div className={`absolute top-1/2 -translate-y-1/2 ${isEven ? "left-8" : "right-8"}`}>
          <div
            onClick={() => router.push(`/missions/${mission.id}`)}
            className="w-48 h-32 bg-gray-800 border-2 border-blue-700 rounded-2xl shadow-sm cursor-pointer
                       flex flex-col justify-center items-center text-center p-4
                       hover:bg-gray-700 hover:border-yellow-500 transition-transform duration-200 will-change-transform"
          >
            <h2 className="text-lg font-bold">{mission.name}</h2>
            <p className="text-sm text-gray-400 mt-1">Credits: {mission.reward_credits}</p>
            {isCompleted && <div className="text-xs text-green-400 mt-2 font-bold">✓ COMPLETED</div>}
          </div>
        </div>
      </div>
    );
  }, [missions, completedMissions, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div
      className="min-h-screen bg-cover bg-center" // avoid bg-fixed for perf
      style={{ backgroundImage: 'url("/brick.svg")' }}
    >
      <div className="min-h-screen text-white p-8">
        <h1 className="text-4xl font-bold text-center text-yellow-400 mb-8">Missions</h1>

        {/* Container that holds both the canvas overlay and the virtualized list */}
        <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
          {/* Overlay canvas that draws ALL connectors once */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none"
          />

          {/* Window-driven virtualization: no inner scrollbar */}
          <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <List
                    autoHeight
                    width={width}
                    height={height}
                    rowCount={missions.length}
                    rowHeight={ROW_HEIGHT}
                    rowRenderer={rowRenderer}
                    overscanRowCount={6}
                    isScrolling={isScrolling}
                    onScroll={onChildScroll}
                    scrollTop={scrollTop}
                    // When AutoSizer gives us width, update containerWidth so canvas redraws
                    // (this is a safe place to sync it one more time)
                    onRowsRendered={() => {
                      if (containerWidth !== width) setContainerWidth(width);
                    }}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        </div>
      </div>
    </div>
  );
}
