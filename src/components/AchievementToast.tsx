import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Star, Trophy } from "lucide-react";

interface AchievementToastProps {
  title: string;
  description: string;
  icon: string;
  show: boolean;
  onClose: () => void;
}

export function AchievementToast({
  title,
  description,
  icon,
  show,
  onClose,
}: AchievementToastProps) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/20 via-transparent to-primary/20 opacity-50" />

            <div className="relative bg-card/40 rounded-[1.4rem] p-4 flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning to-orange-500 shadow-lg flex items-center justify-center text-3xl">
                  {icon}
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                </motion.div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Trophy className="w-4 h-4 text-warning" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">
                    New Achievement
                  </span>
                </div>
                <h4 className="text-lg font-black text-foreground leading-tight">{title}</h4>
                <p className="text-xs text-muted-foreground font-medium">{description}</p>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-foreground/50 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Progress bar at the bottom */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-warning to-primary"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
