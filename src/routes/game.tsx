import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/integrations/firebase/config";
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, deleteDoc, limit, doc, getDoc, updateDoc, increment, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Trophy, Clock, Lightbulb, Flag, HelpCircle, LogOut } from "lucide-react";
import { HangmanFigure } from "@/components/HangmanFigure";
import { DIFFICULTY_CONFIG, pickWord, type Difficulty } from "@/lib/words";
import { toast } from "sonner";
import { useAchievements } from "@/hooks/use-achievements";

export const Route = createFileRoute("/game")({
  validateSearch: z.object({ difficulty: z.enum(["easy", "medium", "hard"]).default("medium") }),
  head: () => ({ meta: [{ title: "Play — Hangman" }] }),
  component: GamePage,
});

const PARTS = ["Head", "Body", "Left Arm", "Right Arm", "Left Leg", "Right Leg"];
const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

function GamePage() {
  const { difficulty } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { checkAchievements } = useAchievements();

  const cfg = DIFFICULTY_CONFIG[difficulty as Difficulty];
  const [{ word, clue }, setEntry] = useState(() => pickWord(difficulty as Difficulty));
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [hintsLeft, setHintsLeft] = useState(3);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [ended, setEnded] = useState<null | "won" | "lost">(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      checkAchievements("game_started");
    }
  }, [user, checkAchievements]);

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [ended]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (ended) return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        guess(key);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [ended, guessed]); // Added guessed to dependencies to ensure we have the latest set

  const wrong = useMemo(() => [...guessed].filter(l => !word.includes(l)), [guessed, word]);
  const lives = cfg.lives - wrong.length;
  const wrongStages = Math.min(6, Math.ceil((wrong.length / cfg.lives) * 6));
  const won = word.split("").every(l => guessed.has(l));

  useEffect(() => {
    if (ended) return;
    if (won) finish(true);
    else if (lives <= 0) finish(false);
  }, [won, lives]);

  async function finish(didWin: boolean) {
    const earned = didWin ? cfg.pointsBase + Math.max(0, lives * 5) - (3 - hintsLeft) * 5 : 0;
    const final = Math.max(0, earned + score);
    setScore(final);
    setEnded(didWin ? "won" : "lost");
    if (user) {
      // 1. Update Cumulative Stats in Profile
      const profRef = doc(db, "profiles", user.uid);
      const statsUpdate: any = {
        total_score: increment(final),
        total_games: increment(1),
        updated_at: serverTimestamp(),
      };
      if (didWin) {
        if (difficulty === "easy") statsUpdate.wins_easy = increment(1);
        if (difficulty === "medium") statsUpdate.wins_medium = increment(1);
        if (difficulty === "hard") statsUpdate.wins_hard = increment(1);
      }
      
      try {
        await updateDoc(profRef, statsUpdate);
      } catch (e) {
        // If profile doesn't exist for some reason, create it
        await setDoc(profRef, statsUpdate, { merge: true });
      }

      // 2. Save to History
      await addDoc(collection(db, "games"), {
        user_id: user.uid,
        difficulty,
        word,
        won: didWin,
        points: final,
        created_at: serverTimestamp(),
      });

      // 3. Cleanup: Only keep last 10 games for History view
      const q = query(
        collection(db, "games"),
        where("user_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      if (snap.size > 10) {
        const toDelete = snap.docs.slice(10);
        await Promise.all(toDelete.map(d => deleteDoc(d.ref)));
      }

      checkAchievements();
    }
    toast[didWin ? "success" : "error"](didWin ? `You won! +${final} pts` : `Out of lives. Word was ${word}`);
  }

  function guess(letter: string) {
    if (ended || guessed.has(letter)) return;
    setGuessed(new Set(guessed).add(letter));
  }

  function useHint() {
    if (hintsLeft <= 0 || ended) return;
    const remaining = word.split("").filter(l => !guessed.has(l));
    if (!remaining.length) return;
    const reveal = remaining[Math.floor(Math.random() * remaining.length)];
    setHintsLeft(h => h - 1);
    setScore(s => Math.max(0, s - 5));
    setGuessed(new Set(guessed).add(reveal));
  }

  function newGame() {
    setEntry(pickWord(difficulty as Difficulty));
    setGuessed(new Set());
    setHintsLeft(3);
    setTime(0);
    setScore(0);
    setEnded(null);
  }

  const fmt = `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-6">
      <div className="max-w-6xl mx-auto rounded-3xl bg-card/30 backdrop-blur-md border border-white/20 shadow-[var(--shadow-soft)] p-6">
        {/* Header bar */}
        <div className="flex flex-wrap items-center gap-3 justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-3">
          <button onClick={() => navigate({ to: "/dashboard" })} className="flex items-center gap-2 font-semibold text-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="flex items-center gap-5 font-bold">
            <Stat icon={<Heart className="w-5 h-5 text-destructive fill-destructive" />} label="Lives" value={lives} />
            <Stat icon={<Trophy className="w-5 h-5 text-warning" />} label="Score" value={score} />
            <Stat icon={<Clock className="w-5 h-5 text-success" />} label="Time" value={fmt} />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 font-bold text-sm flex items-center gap-1"><Lightbulb className="w-4 h-4 text-warning" /> {hintsLeft} Hints</span>
            <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors grid place-items-center text-muted-foreground"><HelpCircle className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 mt-6 items-start">
          {/* Clue */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4">
            <div className="font-bold flex items-center gap-2 mb-2">💡 Clue</div>
            <p className="text-sm text-muted-foreground">{clue}</p>
          </div>

          {/* Hangman */}
          <div className="text-foreground"><HangmanFigure wrongCount={wrongStages} /></div>

          {/* Progress */}
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4">
            <div className="font-bold text-success text-center mb-3">Progress</div>
            <ul className="space-y-1.5 text-sm">
              {PARTS.map((p, i) => {
                const done = i < wrongStages;
                return (
                  <li key={p} className={`flex items-center gap-2 ${done ? "text-foreground" : "text-muted-foreground"}`}>
                    <span className={`w-5 h-5 rounded-full grid place-items-center text-xs shadow-sm ${done ? "bg-success text-white" : "bg-white/20 text-muted-foreground"}`}>{done ? "✓" : ""}</span>
                    {p}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Word */}
        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          {word.split("").map((l, i) => (
            <div key={i} className="w-12 h-14 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm flex items-center justify-center text-2xl font-black text-success">
              {guessed.has(l) || ended === "lost" ? l : ""}
            </div>
          ))}
        </div>

        {/* Keyboard */}
        <div className="mt-6 space-y-2">
          {ROWS.map(row => (
            <div key={row} className="flex justify-center gap-1.5">
              {row.split("").map(l => {
                const isG = guessed.has(l);
                const correct = isG && word.includes(l);
                const wrong = isG && !word.includes(l);
                const cls = correct ? "bg-success text-white border-success" : wrong ? "bg-destructive text-white border-destructive" : "bg-white/40 backdrop-blur-sm hover:bg-white/60 text-foreground border-white/30";
                return (
                  <button key={l} disabled={isG || !!ended} onClick={() => guess(l)}
                    className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 font-black text-lg shadow-sm transition disabled:opacity-90 ${cls}`}>
                    {l}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4 mt-6">
          {ended ? (
            <Button onClick={newGame} className="bg-success hover:bg-success/90 text-white h-12 px-8 font-bold">Play Again</Button>
          ) : (
            <>
              <Button onClick={useHint} disabled={hintsLeft === 0} className="bg-info hover:bg-info/90 text-white h-12 px-6 font-bold">
                <Lightbulb className="w-4 h-4 mr-2" /> Hint (-5 pts)
              </Button>
              <Button onClick={() => finish(false)} className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-12 px-6 font-bold">
                <LogOut className="w-4 h-4 mr-2" /> Quit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="leading-tight">
        <div className="text-lg">{value}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}