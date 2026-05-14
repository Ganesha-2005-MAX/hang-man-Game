import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Heart, BookOpen, BarChart3, Play } from "lucide-react";
import type { Difficulty } from "@/lib/words";

export const Route = createFileRoute("/play")({
  head: () => ({ meta: [{ title: "Select Difficulty — Hangman" }] }),
  component: SelectDifficulty,
});

const TIERS: {
  key: Difficulty;
  title: string;
  emoji: string;
  lives: string;
  words: string;
  level: string;
  theme: "success" | "warning" | "destructive";
  recommended?: boolean;
}[] = [
  {
    key: "easy",
    title: "Easy",
    emoji: "🙂",
    lives: "6 Lives",
    words: "Short Words",
    level: "Beginner Friendly",
    theme: "success",
  },
  {
    key: "medium",
    title: "Medium",
    emoji: "🤔",
    lives: "6 Lives",
    words: "Longer Words",
    level: "Good Challenge",
    theme: "warning",
    recommended: true,
  },
  {
    key: "hard",
    title: "Hard",
    emoji: "😈",
    lives: "4 Lives",
    words: "Challenging Words",
    level: "For Experts",
    theme: "destructive",
  },
];

function SelectDifficulty() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Difficulty>("medium");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-transparent p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-5xl w-full text-center mt-8">
        <h1 className="text-2xl font-bold text-foreground/80 mb-1">
          Choose your challenge level and start guessing!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {TIERS.map((t) => {
            const active = picked === t.key;

            const themeClasses = {
              success: {
                card: "border-success/30 bg-success/5 hover:bg-success/10",
                active: "ring-success border-success/50 bg-success/15",
                title: "text-success",
                iconCircle:
                  "bg-gradient-to-b from-success/40 to-success shadow-[0_0_30px_oklch(0.65_0.18_145/0.3)]",
                row: "bg-success/10 text-success/90",
                star: "text-success",
              },
              warning: {
                card: "border-warning/30 bg-warning/5 hover:bg-warning/10",
                active: "ring-warning border-warning/50 bg-warning/15",
                title: "text-warning",
                iconCircle:
                  "bg-gradient-to-b from-warning/40 to-warning shadow-[0_0_30px_oklch(0.78_0.16_75/0.3)]",
                row: "bg-warning/10 text-warning/90",
                star: "text-warning",
              },
              destructive: {
                card: "border-destructive/30 bg-destructive/5 hover:bg-destructive/10",
                active: "ring-destructive border-destructive/50 bg-destructive/15",
                title: "text-destructive",
                iconCircle:
                  "bg-gradient-to-b from-destructive/40 to-destructive shadow-[0_0_30px_oklch(0.6_0.22_25/0.3)]",
                row: "bg-destructive/10 text-destructive/90",
                star: "text-destructive",
              },
            }[t.theme];

            return (
              <button
                key={t.key}
                onClick={() => setPicked(t.key)}
                className={`group relative flex flex-col items-center rounded-[2.5rem] border-2 p-8 transition-all duration-300 backdrop-blur-md ${active ? `scale-105 shadow-2xl ${themeClasses.active}` : `scale-100 ${themeClasses.card}`}`}
              >
                {t.recommended && (
                  <div className="absolute -top-1 right-12 z-10">
                    <div className="bg-warning text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl shadow-lg flex items-center gap-1.5 uppercase tracking-wider animate-bounce-subtle">
                      <Star className="w-3 h-3 fill-current" /> Recommended
                    </div>
                  </div>
                )}

                <div
                  className={`w-28 h-28 rounded-full grid place-items-center mb-6 transition-transform duration-500 group-hover:scale-110 ${themeClasses.iconCircle}`}
                >
                  <span className="text-6xl drop-shadow-lg">{t.emoji}</span>
                </div>

                <h3 className={`text-4xl font-black mb-2 tracking-tight ${themeClasses.title}`}>
                  {t.title}
                </h3>

                <div className="flex items-center gap-3 w-full mb-6">
                  <div className="h-px flex-1 bg-current opacity-20" />
                  <Star className={`w-4 h-4 fill-current ${themeClasses.star}`} />
                  <div className="h-px flex-1 bg-current opacity-20" />
                </div>

                <div className="space-y-3 w-full">
                  <FeatureRow
                    icon={<Heart className="w-4 h-4" />}
                    text={t.lives}
                    className={themeClasses.row}
                  />
                  <FeatureRow
                    icon={<BookOpen className="w-4 h-4" />}
                    text={t.words}
                    className={themeClasses.row}
                  />
                  <FeatureRow
                    icon={<BarChart3 className="w-4 h-4" />}
                    text={t.level}
                    className={themeClasses.row}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col items-center gap-6 pb-12">
          <Button
            onClick={() => navigate({ to: "/game", search: { difficulty: picked } })}
            className="group h-20 px-16 text-3xl bg-gradient-to-r from-success to-[oklch(0.7_0.2_150)] hover:from-success/90 hover:to-[oklch(0.7_0.2_150)/90] text-white font-black rounded-3xl shadow-[0_10px_40px_oklch(0.65_0.18_145/0.4)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-4"
          >
            <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Play className="w-8 h-8 fill-white stroke-white" />
            </div>
            Start Game
          </Button>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="text-xl font-bold text-foreground/60 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  text,
  className,
}: {
  icon: React.ReactNode;
  text: string;
  className: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-base shadow-sm transition-transform hover:scale-[1.02] ${className}`}
    >
      <div className="opacity-80">{icon}</div>
      {text}
    </div>
  );
}
