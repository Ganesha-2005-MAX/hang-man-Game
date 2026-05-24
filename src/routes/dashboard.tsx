import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/config";
import { doc, getDoc, getDocs, collection, query, where, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp, Gamepad2, Play, RotateCcw, Users, Settings, LogOut, LayoutGrid, Award, History, HelpCircle, Crown, Star, Leaf, Zap, CheckCircle2 } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Hangman Game" }] }),
  component: Dashboard,
});

type Profile = { id: string; username: string | undefined };
type GameRow = { won: boolean; points: number; user_id: string; word: string; difficulty: string; created_at: any };

function rankFor(points: number) {
  if (points >= 100) return { label: "Master", icon: Crown, color: "text-purple bg-purple/15", next: null, min: 100 };
  if (points >= 30) return { label: "Pro", icon: Star, color: "text-info bg-info/15", next: 100, min: 30 };
  return { label: "Rookie", icon: Leaf, color: "text-success bg-success/15", next: 30, min: 0 };
}


function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myStats, setMyStats] = useState({ score: 0, played: 0, won: 0 });
  const [leaders, setLeaders] = useState<{ profile: Profile; points: number }[]>([]);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [earnedAchIds, setEarnedAchIds] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<"dashboard" | "achievements" | "leaderboard" | "history" | "settings" | "help" | "multiplayer">("dashboard");
  const [myHistory, setMyHistory] = useState<GameRow[]>([]);
  const [localSettings, setLocalSettings] = useState({ hints: false, animations: true, sounds: true, public: true, toasts: true });

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [pSnap, gSnap, profsSnap, achsSnap] = await Promise.all([
          getDoc(doc(db, "profiles", user.uid)),
          getDocs(collection(db, "games")),
          getDocs(collection(db, "profiles")),
          getDocs(query(collection(db, "user_achievements"), where("user_id", "==", user.uid))),
        ]);
        
        if (pSnap.exists()) {
          const d = pSnap.data() as any;
          setProfile({ id: pSnap.id, ...d } as Profile);
          if (d.settings) setLocalSettings({ ...localSettings, ...d.settings });
          
          const totalWon = (d.wins_easy || 0) + (d.wins_medium || 0) + (d.wins_hard || 0);
          setMyStats({
            score: d.total_score || 0,
            played: d.total_games || 0,
            won: totalWon,
          });
        }
        
        setEarnedAchIds(new Set(achsSnap.docs.map(d => (d.data() as any).achievement_id)));

        const all: GameRow[] = gSnap.docs.map(d => d.data() as GameRow);
        const mine = all.filter(g => g.user_id === user.uid).sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
        setMyHistory(mine);
        
        const ranked = profsSnap.docs
          .map(d => {
            const data = d.data() as any;
            return { 
              profile: { ...data, id: d.id, username: data.username || "Player" } as Profile, 
              points: data.total_score || 0 
            };
          })
          .sort((a, b) => b.points - a.points)
          .slice(0, 10);
        setLeaders(ranked);
        setLeaderboardError(null);
      } catch (err: any) {
        console.error("Dashboard data fetch error:", err);
        setLeaderboardError(err?.message || "Failed to load leaderboard data.");
      }
    })();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "profiles", user.uid), { settings: localSettings }, { merge: true });
      toast.success("Settings saved successfully!");
      setCurrentView("dashboard");
    } catch (e) {
      toast.error("Failed to save settings");
    }
  };

  const winRate = myStats.played ? Math.round((myStats.won / myStats.played) * 100) : 0;
  const username = profile?.username || "player";
  const rank = rankFor(myStats.score);

  interface NavItem {
    icon: any;
    label: string;
    active?: boolean;
    onClick?: () => void;
    to?: any;
  }

  const navItems: NavItem[] = [
    { icon: LayoutGrid, label: "Dashboard", active: currentView === "dashboard", onClick: () => setCurrentView("dashboard") },
    { icon: Gamepad2, label: "Play Game", to: "/play" as const },
    { icon: Users, label: "Multiplayer", active: currentView === "multiplayer", onClick: () => setCurrentView("multiplayer") },
    { icon: Trophy, label: "Leaderboard", active: currentView === "leaderboard", onClick: () => setCurrentView("leaderboard") },
    { icon: Award, label: "Achievements", active: currentView === "achievements", onClick: () => setCurrentView("achievements") },
    { icon: History, label: "History", active: currentView === "history", onClick: () => setCurrentView("history") },
    { icon: Settings, label: "Settings", active: currentView === "settings", onClick: () => setCurrentView("settings") },
    { icon: HelpCircle, label: "Help & Support", active: currentView === "help", onClick: () => setCurrentView("help") },
  ];

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="rounded-3xl bg-white/30 backdrop-blur-md p-5 shadow-[var(--shadow-soft)] border border-white/20 h-fit lg:sticky lg:top-6">
          <div className="flex flex-col items-center mb-5">
            <h1 className="text-2xl font-black text-primary">HANGMAN</h1>
            <div className="text-[10px] tracking-[0.3em] text-primary font-bold">— GAME —</div>
          </div>
          <nav className="space-y-1">
            {navItems.map(it => {
              const Inner = (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${it.active ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "text-foreground hover:bg-muted"}`}>
                  <it.icon className="w-4 h-4" />{it.label}
                </div>
              );
              if (it.to) return <Link key={it.label} to={it.to}>{Inner}</Link>;
              if (it.onClick) return <button key={it.label} onClick={it.onClick} className="w-full text-left">{Inner}</button>;
              return <div key={it.label} className="cursor-not-allowed opacity-60">{Inner}</div>;
            })}
          </nav>
          <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-center">
            <div className="flex items-center justify-center gap-2 font-bold text-foreground"><Crown className="w-4 h-4 text-warning" /> Daily Challenge</div>
            <p className="text-xs text-muted-foreground my-2">Play today's challenge and earn extra points!</p>
            <Button className="h-8 rounded-md px-3 text-xs bg-success hover:bg-success/90 text-white w-full" onClick={() => navigate({ to: "/play" })}>Play Now →</Button>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                {currentView === "dashboard" ? `Welcome back, ${username}! 👋` : 
                 currentView === "achievements" ? "Achievements 🏆" : 
                 currentView === "leaderboard" ? "Leaderboard 👑" : 
                 currentView === "history" ? "Game History 📜" : 
                 currentView === "settings" ? "Game Settings ⚙️" : 
                 currentView === "help" ? "Help & Support 🛠️" : "Multiplayer Lobby 🎮"}
              </h2>
              <p className="text-muted-foreground">
                {currentView === "dashboard" ? "Ready to guess some words?" : 
                 currentView === "achievements" ? "Track your progress and milestones" : 
                 currentView === "leaderboard" ? "Top players (Last 10 games)" : 
                 currentView === "history" ? "Your last 10 completed words" : 
                 currentView === "settings" ? "Customize your experience" : 
                 currentView === "help" ? "How to play & get help" : "Play with friends locally or online"}
              </p>
            </div>
            <Button className="border border-input bg-transparent shadow-sm hover:bg-destructive/10 border-destructive text-destructive" onClick={async () => { await signOut(auth); navigate({ to: "/login" }); }}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          {currentView === "dashboard" ? (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Profile + stats */}
                <Card className="xl:col-span-2 p-6 bg-white/30 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl">
                  <div className="flex items-center gap-4 mb-5">
                    <Avatar className="h-[72px] w-[72px]">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                        {username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{username}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${rank.color}`}>
                          <rank.icon className="w-3 h-3" /> {rank.label}
                        </span>
                        {rank.next && (
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {rank.next - myStats.score} pts to next rank
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {rank.next && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2 text-muted-foreground">
                        <span>Rank Progress</span>
                        <span>{Math.round(((myStats.score - rank.min) / (rank.next - rank.min)) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${Math.min(100, ((myStats.score - rank.min) / (rank.next - rank.min)) * 100)}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <StatBox icon={<Trophy className="w-5 h-5 text-warning" />} label="Score" value={myStats.score} sub="Total Points" />
                    <StatBox icon={<TrendingUp className="w-5 h-5 text-purple" />} label="Win Rate" value={`${winRate}%`} sub="Keep it up!" valueClass="text-purple" />
                    <StatBox icon={<Gamepad2 className="w-5 h-5 text-info" />} label="Games Played" value={myStats.played} sub="Total Games" valueClass="text-info" />
                  </div>
                </Card>

                {/* Quick actions */}
                <Card className="p-6 bg-white/30 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl">
                  <div className="flex items-center gap-2 mb-4 font-bold text-lg"><Zap className="w-5 h-5 text-warning" /> Quick Actions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionTile color="from-success to-primary" icon={<Play className="w-6 h-6" />} title="Play Game" sub="Start a new game" onClick={() => navigate({ to: "/play" })} />
                    <ActionTile color="from-warning to-[oklch(0.7_0.18_50)]" icon={<RotateCcw className="w-6 h-6" />} title="Resume Game" sub="Continue playing" onClick={() => navigate({ to: "/play" })} />
                    <ActionTile color="from-purple to-[oklch(0.55_0.22_310)]" icon={<Users className="w-6 h-6" />} title="Multiplayer" sub="Play with friends" onClick={() => setCurrentView("multiplayer")} />
                    <ActionTile color="from-info to-[oklch(0.55_0.18_220)]" icon={<Settings className="w-6 h-6" />} title="Settings" sub="Game preferences" onClick={() => setCurrentView("settings")} />
                  </div>
                </Card>
              </div>

              {/* New Section: Mastery & Tips */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                <Card className="p-6 bg-white/30 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl overflow-hidden relative group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6 font-bold text-lg"><Award className="w-5 h-5 text-warning" /> Skill Mastery</div>
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2"><span>Vocabulary</span><span className="text-success">Level 4</span></div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-success w-[70%]" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2"><span>Speed Thinker</span><span className="text-info">Level 2</span></div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-info w-[35%]" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2"><span>Survivalist</span><span className="text-purple">Level 1</span></div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple w-[15%]" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Trophy className="w-32 h-32 rotate-12" />
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-info/20 to-primary/20 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 font-bold text-lg"><HelpCircle className="w-5 h-5 text-info" /> Pro Tips</div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/20 border border-white/10">
                      <div className="font-bold text-xs mb-1 text-primary uppercase tracking-widest">Tip of the day</div>
                      <p className="text-sm text-foreground italic">"Vowels are your best friends. Start with A, E, or I to reveal the structure of most words quickly."</p>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition cursor-help">
                      <div className="w-8 h-8 rounded-lg bg-warning/20 grid place-items-center text-warning shrink-0"><Star className="w-4 h-4" /></div>
                      <div className="text-xs font-medium">Guessing 3 consonants in a row earns a "Combo" bonus!</div>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </Card>
              </div>
            </>
          ) : currentView === "achievements" ? (
            /* Achievements View */
            <Card className="p-6 bg-white/30 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 font-bold text-xl"><Award className="w-6 h-6 text-warning" /> My Achievements</div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-foreground">{earnedAchIds.size} / {ACHIEVEMENTS.length} Badges</span>
                  <div className="w-48 h-2 bg-white/20 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-success transition-all duration-1000" style={{ width: `${(earnedAchIds.size / ACHIEVEMENTS.length) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="max-h-[65vh] overflow-y-auto pt-4 px-4 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                  {ACHIEVEMENTS.map(ach => {
                    const earned = earnedAchIds.has(ach.id);
                    return (
                      <div key={ach.id} className={`group relative flex flex-col items-center p-6 rounded-[2rem] border transition-all duration-500 ${earned ? "bg-white/40 border-warning/30 scale-100 shadow-xl" : "bg-black/5 border-transparent opacity-40 grayscale scale-95"}`}>
                        <div className="text-5xl mb-4 drop-shadow-xl group-hover:scale-110 transition-transform duration-300">{ach.icon}</div>
                        <div className="text-xs font-black text-center leading-tight uppercase tracking-widest text-foreground">{ach.title}</div>
                        <div className="mt-2 text-[10px] text-muted-foreground text-center line-clamp-2 font-medium">{ach.description}</div>
                        {earned && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-warning to-primary text-white rounded-full p-1.5 shadow-lg border-2 border-white/50">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ) : currentView === "leaderboard" ? (
            /* Leaderboard View */
            <Card className="p-6 bg-white/30 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 font-bold text-xl"><Trophy className="w-6 h-6 text-warning" /> Global Leaderboard</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Season 1</div>
              </div>

              {leaderboardError ? (
                <div className="text-center py-12 text-destructive bg-destructive/5 rounded-2xl border border-destructive/20">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">Could not load leaderboard</p>
                  <p className="text-xs text-muted-foreground mt-1">{leaderboardError}</p>
                  <p className="text-xs text-muted-foreground mt-1">Check your Firestore security rules — the <strong>profiles</strong> collection may not allow reads.</p>
                </div>
              ) : leaders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">No players yet</p>
                  <p className="text-xs mt-1">Be the first on the board — play a game!</p>
                </div>
              ) : (
                <div className="bg-white/10 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="grid grid-cols-[80px_1fr_120px_120px] p-4 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <div>Rank</div>
                    <div>Player</div>
                    <div className="text-center">Tier</div>
                    <div className="text-right">Score</div>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    {leaders.map((l, i) => {
                      const r = rankFor(l.points);
                      const isMe = l.profile.id === user?.uid;
                      const medal = i === 0 ? "text-warning" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-400" : "text-muted-foreground";
                      const displayName = l.profile.username || "Player";
                      
                      return (
                        <div key={l.profile.id} className={`grid grid-cols-[80px_1fr_120px_120px] items-center p-4 transition hover:bg-white/5 ${isMe ? "bg-warning/10" : ""}`}>
                          <div className={`text-2xl font-black ${medal}`}>{i + 1}</div>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/20 text-primary font-black text-xs">
                                {displayName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-foreground">
                              {displayName}{isMe && <span className="ml-2 text-[10px] font-black text-warning uppercase tracking-widest">(You)</span>}
                            </span>
                          </div>
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${r.color}`}>
                              <r.icon className="w-3 h-3" /> {r.label}
                            </span>
                          </div>
                          <div className="text-right font-black text-success text-lg">{l.points} pts</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          ) : currentView === "history" ? (
            /* History View */
            <Card className="p-6 bg-white/30 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 font-bold text-xl"><History className="w-6 h-6 text-info" /> Recent Games</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Last 10 Entries</div>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {myHistory.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>No games played yet. Start your first game!</p>
                  </div>
                )}
                {myHistory.map((g, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/5 hover:bg-white/15 transition group">
                    <div className={`w-12 h-12 rounded-xl grid place-items-center font-black text-white shadow-md ${g.won ? "bg-success" : "bg-destructive"}`}>
                      {g.won ? "W" : "L"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg tracking-tight uppercase text-foreground">{g.word}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          g.difficulty === "hard" ? "border-destructive text-destructive bg-destructive/10" :
                          g.difficulty === "medium" ? "border-warning text-warning bg-warning/10" :
                          "border-success text-success bg-success/10"
                        }`}>{g.difficulty}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {g.created_at?.toDate ? g.created_at.toDate().toLocaleString() : "Recently"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black text-lg ${g.won ? "text-success" : "text-muted-foreground opacity-50"}`}>
                        {g.won ? `+${g.points}` : "0"} pts
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Points</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-[10px] text-muted-foreground italic bg-info/5 p-4 rounded-2xl border border-info/10 text-center uppercase tracking-[0.2em] font-bold mt-4">
                Auto-Cleanup Active: Only storing last 10 games
              </p>
            </Card>
          ) : currentView === "settings" ? (
            /* Settings View */
            <Card className="p-6 bg-white/30 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 font-bold text-xl mb-8"><Settings className="w-6 h-6 text-primary" /> Preferences</div>
              
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Game Preferences</h3>
                  <div className="grid gap-3">
                    <SettingToggle icon={<TrendingUp className="w-4 h-4" />} title="Show Hints by Default" description="Always show clue at the start of the game" checked={localSettings.hints} onChange={(v) => setLocalSettings({...localSettings, hints: v})} />
                    <SettingToggle icon={<Star className="w-4 h-4" />} title="Animations" description="Enable smooth transitions and effects" checked={localSettings.animations} onChange={(v) => setLocalSettings({...localSettings, animations: v})} />
                    <SettingToggle icon={<Crown className="w-4 h-4" />} title="Sound Effects" description="Play sounds on win/loss and clicks" checked={localSettings.sounds} onChange={(v) => setLocalSettings({...localSettings, sounds: v})} />
                  </div>
                </section>
                
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Account & Privacy</h3>
                  <div className="grid gap-3">
                    <SettingToggle icon={<Users className="w-4 h-4" />} title="Public Profile" description="Allow others to see your scores on leaderboard" checked={localSettings.public} onChange={(v) => setLocalSettings({...localSettings, public: v})} />
                    <SettingToggle icon={<CheckCircle2 className="w-4 h-4" />} title="Achievement Toasts" description="Show popup when a new badge is earned" checked={localSettings.toasts} onChange={(v) => setLocalSettings({...localSettings, toasts: v})} />
                  </div>
                </section>

                <div className="pt-6 border-t border-white/10 flex gap-4">
                  <Button onClick={handleSaveSettings} className="bg-primary text-white font-bold h-12 px-8 rounded-2xl shadow-md">Save Changes</Button>
                  <Button variant="outline" onClick={() => setCurrentView("dashboard")} className="border-white/20 bg-white/10 hover:bg-white/20 h-12 px-8 rounded-2xl font-bold">Cancel</Button>
                </div>
              </div>
            </Card>
          ) : currentView === "help" ? (
            /* Help View */
            <Card className="p-6 bg-white/30 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 font-bold text-xl mb-8"><HelpCircle className="w-6 h-6 text-info" /> Game Guide</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-3">How to Play</h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black shrink-0">1</span> Guess the hidden word by picking letters one by one.</li>
                      <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black shrink-0">2</span> Each wrong guess draws part of the Hangman.</li>
                      <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black shrink-0">3</span> Save the man before the drawing is complete to win!</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-warning mb-3">Scoring System</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-center">
                        <div className="text-xs font-black text-success uppercase">Easy</div>
                        <div className="text-lg font-black text-foreground">10 pts</div>
                      </div>
                      <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-center">
                        <div className="text-xs font-black text-warning uppercase">Medium</div>
                        <div className="text-lg font-black text-foreground">20 pts</div>
                      </div>
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                        <div className="text-xs font-black text-destructive uppercase">Hard</div>
                        <div className="text-lg font-black text-foreground">40 pts</div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-info mb-3">Lives & Difficulty</h3>
                    <div className="p-4 rounded-2xl bg-white/20 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">Easy Mode</span>
                        <span className="text-success font-black">6 Lives</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">Medium Mode</span>
                        <span className="text-warning font-black">6 Lives</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">Hard Mode</span>
                        <span className="text-destructive font-black">4 Lives</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Need Support?</h3>
                    <p className="text-xs text-muted-foreground mb-4">If you encounter any bugs or have suggestions, feel free to reach out.</p>
                    <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/5 rounded-xl font-bold">Contact Support</Button>
                  </section>
                </div>
              </div>
            </Card>
          ) : (
            /* Multiplayer View */
            <Card className="p-6 bg-white/30 backdrop-blur-md border-white/20 shadow-[var(--shadow-soft)] rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 font-bold text-xl mb-8"><Users className="w-6 h-6 text-purple" /> Multiplayer Modes</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group overflow-hidden rounded-[2.5rem] p-8 bg-gradient-to-br from-purple to-primary text-white shadow-xl hover:scale-[1.02] transition-transform duration-500">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/20 grid place-items-center mb-6 shadow-inner">
                      <Gamepad2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Pass & Play</h3>
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">Play locally with a friend. One person enters a word, and the other tries to guess it!</p>
                    <Button onClick={() => navigate({ to: "/play" })} className="bg-white text-primary hover:bg-white/90 font-black rounded-2xl px-8 h-14 shadow-lg group-hover:px-10 transition-all">Start Local Match</Button>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                </div>

                <div className="relative group overflow-hidden rounded-[2.5rem] p-8 bg-white/10 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 grid place-items-center mb-4 text-muted-foreground">
                    <RotateCcw className="w-8 h-8 animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-black text-foreground/50 uppercase tracking-widest">Online Battle</h3>
                  <p className="text-muted-foreground/60 text-xs mb-0 italic font-medium">Coming Soon...</p>
                  
                  <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/20 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary/20 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-primary/20 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-3xl bg-info/5 border border-info/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-info/20 grid place-items-center text-info shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">Multiplayer Rankings</div>
                  <p className="text-xs text-muted-foreground">Online wins will earn you double points and exclusive legendary badges.</p>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function SettingToggle({ icon, title, description, checked, onChange }: { icon: React.ReactNode; title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/20 border border-white/10 hover:bg-white/30 transition">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center text-primary">{icon}</div>
        <div>
          <div className="font-bold text-sm">{title}</div>
          <div className="text-[10px] text-muted-foreground">{description}</div>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
      </label>
    </div>
  );
}

function StatBox({ icon, label, value, sub, valueClass = "text-success" }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; valueClass?: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">{icon}{label}</div>
      <div className={`text-3xl font-black my-1 ${valueClass}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function ActionTile({ color, icon, title, sub, onClick }: { color: string; icon: React.ReactNode; title: string; sub: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick} className={`text-left rounded-2xl p-4 text-white bg-gradient-to-br ${color} shadow-md hover:scale-[1.02] transition disabled:opacity-70 disabled:cursor-not-allowed`}>
      <div className="bg-white/20 w-10 h-10 rounded-full grid place-items-center mb-2">{icon}</div>
      <div className="font-bold">{title}</div>
      <div className="text-xs opacity-90">{sub}</div>
    </button>
  );
}