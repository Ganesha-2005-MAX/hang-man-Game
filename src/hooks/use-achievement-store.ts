import { create } from "zustand";

interface Achievement {
  title: string;
  description: string;
  icon: string;
}

interface AchievementStore {
  activeAchievement: Achievement | null;
  showAchievement: (achievement: Achievement) => void;
  hideAchievement: () => void;
}

export const useAchievementStore = create<AchievementStore>((set) => ({
  activeAchievement: null,
  showAchievement: (achievement: Achievement) => set({ activeAchievement: achievement }),
  hideAchievement: () => set({ activeAchievement: null }),
}));
