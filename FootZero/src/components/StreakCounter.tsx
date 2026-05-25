import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function StreakCounter() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    // Calculate streak from activity_logs
    supabase
      .from("activity_logs")
      .select("logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .then(({ data }) => {
        if (!data?.length) return;
        const dates = [...new Set(data.map((d) => new Date(d.logged_at).toDateString()))];
        let count = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const check = new Date(today);
          check.setDate(check.getDate() - i);
          if (dates.includes(check.toDateString())) {
            count++;
          } else if (i > 0) break; // Allow today to be missing
          else break;
        }
        setStreak(count);
      });
  }, [user]);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${streak > 0 ? "bg-orange-500/15" : "bg-muted"}`}>
        <Flame className={`h-6 w-6 ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
      </div>
      <div>
        <p className="text-foreground text-2xl font-bold">{streak} day{streak !== 1 ? "s" : ""}</p>
        <p className="text-muted-foreground text-sm">Current logging streak</p>
      </div>
    </div>
  );
}
