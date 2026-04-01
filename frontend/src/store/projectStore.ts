import { create } from 'zustand';

interface ProjectStore {
  assistantOpen: boolean;
  assistantContext: 'cost_analysis' | 'valuation' | 'projections' | 'general';
  toggleAssistant: () => void;
  setAssistantContext: (context: 'cost_analysis' | 'valuation' | 'projections' | 'general') => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  assistantOpen: false,
  assistantContext: 'general',
  toggleAssistant: () => set((state) => ({ assistantOpen: !state.assistantOpen })),
  setAssistantContext: (context) => set({ assistantContext: context }),
}));
