import { useState, useCallback } from "react";
import { db } from "@/integrations/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { ACHIEVEMENTS, type GameStats } from "@/lib/achievements";
import { useAuth } from "./use-auth";
import { useAchievementStore } from "./use-achievement-store";

export function useAchievements() {
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const { showAchievement } = useAchievementStore();

  const checkAchievements = useCallback(
    async (manualId?: string) => {
      if (!user) return;
      setChecking(true);

      try {
        // 1. Get Profile Stats
        const profSnap = await getDoc(doc(db, "profiles", user.uid));
        if (!profSnap.exists()) return;

        const pData = profSnap.data() as any;
        const stats: GameStats = {
          played: pData.total_games || 0,
          score: pData.total_score || 0,
          winsEasy: pData.wins_easy || 0,
          winsMedium: pData.wins_medium || 0,
          winsHard: pData.wins_hard || 0,
        };

        // 3. Get already earned achievements
        const earnedSnap = await getDocs(
          query(collection(db, "user_achievements"), where("user_id", "==", user.uid)),
        );
        const earnedIds = new Set(earnedSnap.docs.map((d) => (d.data() as any).achievement_id));

        // 4. Check for new ones
        for (const ach of ACHIEVEMENTS) {
          if (!earnedIds.has(ach.id) && (ach.id === manualId || ach.criteria(stats))) {
            // New achievement!
            await setDoc(doc(db, "user_achievements", `${user.uid}_${ach.id}`), {
              user_id: user.uid,
              achievement_id: ach.id,
              earned_at: serverTimestamp(),
            });

            // Trigger notification
            showAchievement({
              title: ach.title,
              description: ach.description,
              icon: ach.icon,
            });
          }
        }
      } catch (error) {
        console.error("Error checking achievements:", error);
      } finally {
        setChecking(false);
      }
    },
    [user],
  );

  return { checkAchievements, checking };
}
