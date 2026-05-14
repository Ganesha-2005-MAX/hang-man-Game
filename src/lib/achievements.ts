import type { Difficulty } from "./words";

export type GameStats = {
  played: number;
  score: number;
  winsEasy: number;
  winsMedium: number;
  winsHard: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: (stats: GameStats) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "game_started",
    title: "Game On!",
    description: "Start your first hangman game",
    icon: "🎮",
    criteria: (s) => s.played >= 1,
  },
  {
    id: "score_100",
    title: "Centurion",
    description: "Reach 100 total score",
    icon: "💯",
    criteria: (s) => s.score >= 100,
  },
  {
    id: "score_500",
    title: "Half Grand",
    description: "Reach 500 total score",
    icon: "🎖️",
    criteria: (s) => s.score >= 500,
  },
  {
    id: "score_1000",
    title: "Legendary Scorer",
    description: "Reach 1000 total score",
    icon: "👑",
    criteria: (s) => s.score >= 1000,
  },
  {
    id: "win_10_easy",
    title: "Easy Rider",
    description: "Win 10 easy games",
    icon: "🐥",
    criteria: (s) => s.winsEasy >= 10,
  },
  {
    id: "win_50_easy",
    title: "Easy Master",
    description: "Win 50 easy games",
    icon: "🐣",
    criteria: (s) => s.winsEasy >= 50,
  },
  {
    id: "win_100_easy",
    title: "Easy Elite",
    description: "Win 100 easy games",
    icon: "🕊️",
    criteria: (s) => s.winsEasy >= 100,
  },
  {
    id: "win_10_medium",
    title: "Challenger",
    description: "Win 10 medium games",
    icon: "⚖️",
    criteria: (s) => s.winsMedium >= 10,
  },
  {
    id: "win_50_medium",
    title: "Medium Veteran",
    description: "Win 50 medium games",
    icon: "⚔️",
    criteria: (s) => s.winsMedium >= 50,
  },
  {
    id: "win_100_medium",
    title: "Medium Master",
    description: "Win 100 medium games",
    icon: "🛡️",
    criteria: (s) => s.winsMedium >= 100,
  },
  {
    id: "win_10_hard",
    title: "Expert",
    description: "Win 10 hard games",
    icon: "🔥",
    criteria: (s) => s.winsHard >= 10,
  },
  {
    id: "win_50_hard",
    title: "Hangman God",
    description: "Win 50 hard games",
    icon: "🔱",
    criteria: (s) => s.winsHard >= 50,
  },
  {
    id: "win_100_hard",
    title: "The Immortal",
    description: "Win 100 hard games",
    icon: "☄️",
    criteria: (s) => s.winsHard >= 100,
  },
  {
    id: "score_2500",
    title: "The Collector",
    description: "Reach 2500 total score",
    icon: "💎",
    criteria: (s) => s.score >= 2500,
  },
  {
    id: "score_5000",
    title: "Score Titan",
    description: "Reach 5000 total score",
    icon: "🧿",
    criteria: (s) => s.score >= 5000,
  },
  {
    id: "played_100",
    title: "Frequent Flyer",
    description: "Play 100 games total",
    icon: "🚀",
    criteria: (s) => s.played >= 100,
  },
  {
    id: "played_250",
    title: "Addicted",
    description: "Play 250 games total",
    icon: "🌪️",
    criteria: (s) => s.played >= 250,
  },
];
