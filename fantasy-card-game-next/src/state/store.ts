import { create } from 'zustand';

interface GameState {
  // Add state here
}

export const useGameStore = create<GameState>(() => ({
  // Initial state
}));
