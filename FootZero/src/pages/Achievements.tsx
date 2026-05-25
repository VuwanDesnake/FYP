import { useEffect, useState } from "react";
import { Trophy, Lock, Star, Flame, Leaf, Zap, Heart, MessageSquare, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface Badge {
  key: string;
  name: string;
  description: string;
  icon: any;
}

const allBadges: Badge[] = [
  { key: "first_step", name: "First Step", description: "Log your first carbon activity", icon: Star },
  { key: "green_week", name: "Green Week", description: "Stay under 50 kg CO₂ in a week", icon: Leaf },
  { key: "streak_master", name: "Streak Master", description: "Log activities 7 days in a row", icon: Flame },
  { key: "carbon_cutter", name: "Carbon Cutter", description: "Achieve 20% emission reduction vs last week", icon: Zap },
  { key: "eco_warrior", name: "Eco Warrior", description: "Maintain a 30-day logging streak", icon: Trophy },
  { key: "zero_hero", name: "Zero Hero", description: "Emit under 10 kg CO₂ in a single day", icon: Award },
  { key: "community_helper", name: "Community Helper", description: "Submit a feedback or contact message", icon: MessageSquare },
];

const Achievements = () => {
  const { user } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<{ badge_name: string; earned_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("badges")
      .select("badge_name, earned_at")
      .eq("user_id", user.id)
      .then(({ data }) => setEarnedBadges(data || []));
  }, [user]);

  const isUnlocked = (key: string) => earnedBadges.some((b) => b.badge_name === key);
  const getEarnedDate = (key: string) => {
    const b = earnedBadges.find((b) => b.badge_name === key);
    return b ? new Date(b.earned_at).toLocaleDateString() : null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-2">Achievements</h2>
        <p className="text-muted-foreground">
          Earn badges by reducing your carbon footprint. {earnedBadges.length}/{allBadges.length} unlocked.
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-foreground text-sm font-medium">Badge Progress</span>
          <span className="text-primary text-sm font-bold">{Math.round((earnedBadges.length / allBadges.length) * 100)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" as const }}
          />
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {allBadges.map((badge, i) => {
          const unlocked = isUnlocked(badge.key);
          const date = getEarnedDate(badge.key);
          return (
            <motion.div
              key={badge.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, ease: "easeOut" as const }}
              className={`relative bg-card rounded-2xl border p-5 text-center transition-all duration-200 ${
                unlocked
                  ? "border-primary/40 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                  : "border-border opacity-60 grayscale"
              }`}
            >
              <div
                className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-3 ${
                  unlocked ? "bg-primary/15" : "bg-muted"
                }`}
              >
                {unlocked ? (
                  <badge.icon className="h-7 w-7 text-primary" />
                ) : (
                  <Lock className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <h3 className={`font-semibold text-sm mb-1 ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                {badge.name}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{badge.description}</p>
              {date && <p className="text-primary text-[11px] mt-2 font-medium">Earned {date}</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
