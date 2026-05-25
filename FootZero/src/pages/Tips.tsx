import { useEffect, useMemo, useState } from "react";
import { Car, Utensils, Zap, ShoppingBag, Leaf, ThumbsUp, ThumbsDown, Sparkles, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tip { id: string; title: string; description: string; category: string; difficulty: string; }
interface Fact { id: string; fact_text: string; source: string | null; }

const categoryIcons: Record<string, any> = { Transport: Car, Diet: Utensils, Energy: Zap, Shopping: ShoppingBag, General: Leaf };
const categoryColors: Record<string, string> = {
  Transport: "bg-blue-500", Diet: "bg-green-500", Energy: "bg-yellow-500", Shopping: "bg-purple-500", General: "bg-gray-500",
};
const difficultyColors: Record<string, string> = {
  Easy: "bg-green-500/15 text-green-400",
  Medium: "bg-yellow-500/15 text-yellow-400",
  Hard: "bg-red-500/15 text-red-400",
};

const defaultTips: Tip[] = [
  { id: "d1", title: "Walk or cycle for short trips", description: "For trips under 3km, walking or cycling produces zero emissions and keeps you healthy.", category: "Transport", difficulty: "Easy" },
  { id: "d2", title: "Use public transport", description: "Buses and trains produce far less CO₂ per passenger than private cars.", category: "Transport", difficulty: "Easy" },
  { id: "d3", title: "Eat more plant-based meals", description: "Replacing one meat meal a day with plant-based options can cut your food emissions by up to 50%.", category: "Diet", difficulty: "Medium" },
  { id: "d4", title: "Reduce food waste", description: "Plan your meals and use leftovers — food in landfills produces methane.", category: "Diet", difficulty: "Easy" },
  { id: "d5", title: "Switch to LED bulbs", description: "LED bulbs use up to 80% less energy than incandescent bulbs.", category: "Energy", difficulty: "Easy" },
  { id: "d6", title: "Unplug devices when not in use", description: "Standby power can account for 5-10% of your electricity bill.", category: "Energy", difficulty: "Easy" },
  { id: "d7", title: "Buy second-hand", description: "Pre-owned clothing and electronics significantly cut manufacturing emissions.", category: "Shopping", difficulty: "Medium" },
  { id: "d8", title: "Air dry your clothes", description: "Skip the tumble dryer to save energy.", category: "General", difficulty: "Easy" },
];

const Tips = () => {
  const { user } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  const [feedbackScores, setFeedbackScores] = useState<Record<string, number>>({});
  const [fact, setFact] = useState<Fact | null>(null);
  const [contextual, setContextual] = useState<Tip[]>([]);

  useEffect(() => {
    (async () => {
      // Tips
      const { data: tipData } = await supabase.from("eco_tips" as any)
        .select("id, title, description, category, difficulty").eq("is_active", true);
      const baseTips: Tip[] = (tipData as any)?.length ? (tipData as any) : defaultTips;

      // Random fact
      const { data: factData } = await supabase.from("facts" as any)
        .select("id, fact_text, source").eq("is_active", true);
      if ((factData as any)?.length) {
        const arr = factData as any as Fact[];
        setFact(arr[Math.floor(Math.random() * arr.length)]);
      }

      // User logs (last 30 days)
      const totals: Record<string, number> = {};
      const ctx: Tip[] = [];
      if (user) {
        const since = new Date(); since.setDate(since.getDate() - 30);
        const { data: logs } = await supabase.from("activity_logs")
          .select("category, co2_kg, details")
          .eq("user_id", user.id)
          .gte("logged_at", since.toISOString());
        (logs || []).forEach((l: any) => {
          const cat = (l.category || "General").charAt(0).toUpperCase() + (l.category || "general").slice(1).toLowerCase();
          totals[cat] = (totals[cat] || 0) + Number(l.co2_kg || 0);
        });
        setCategoryTotals(totals);

        // Contextual tips from real data
        const sourceCounts: Record<string, { count: number; co2: number }> = {};
        (logs || []).forEach((l: any) => {
          const src = (l.details?.source || "").toString();
          if (!src) return;
          if (!sourceCounts[src]) sourceCounts[src] = { count: 0, co2: 0 };
          sourceCounts[src].count += 1;
          sourceCounts[src].co2 += Number(l.co2_kg || 0);
        });
        if ((sourceCounts["Bus"]?.count || 0) >= 3) {
          ctx.push({ id: "ctx-bus", category: "Transport", difficulty: "Easy",
            title: "Walk for short bus trips",
            description: "You take the bus often. For trips under 2km, walking produces zero emissions and keeps you fit." });
        }
        const meatCo2 = (sourceCounts["Meat-heavy meal"]?.co2 || 0);
        const meatCount = (sourceCounts["Meat-heavy meal"]?.count || 0);
        if (meatCount >= 2) {
          const saving = ((4.5 - 0.7) * 4).toFixed(1);
          ctx.push({ id: "ctx-meat", category: "Diet", difficulty: "Medium",
            title: "Swap one meat meal a week",
            description: `Replacing one meat-heavy meal per week with vegan meals could save you about ${saving} kg CO₂ per month.` });
        }
        const elecCo2 = sourceCounts["Electricity"]?.co2 || 0;
        if (elecCo2 > 20) {
          ctx.push({ id: "ctx-elec", category: "Energy", difficulty: "Easy",
            title: "Switch to LED bulbs",
            description: "Your electricity emissions are high — switching to LED bulbs can reduce energy emissions by up to 15%." });
        }
        setContextual(ctx);

        // Feedback
        const { data: fb } = await supabase.from("tip_feedback" as any)
          .select("tip_id, is_helpful").eq("user_id", user.id);
        const map: Record<string, boolean> = {};
        (fb as any || []).forEach((f: any) => { map[f.tip_id] = f.is_helpful; });
        setFeedback(map);

        const { data: allFb } = await supabase.from("tip_feedback" as any).select("tip_id, is_helpful");
        const scores: Record<string, number> = {};
        (allFb as any || []).forEach((f: any) => {
          scores[f.tip_id] = (scores[f.tip_id] || 0) + (f.is_helpful ? 1 : -1);
        });
        setFeedbackScores(scores);
      }

      setTips(baseTips);
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [user]);

  const totalCo2 = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const sortedCats = useMemo(() =>
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]),
    [categoryTotals]);
  const topCat = sortedCats[0]?.[0];
  const topPct = totalCo2 > 0 && topCat ? Math.round((sortedCats[0][1] / totalCo2) * 100) : 0;

  const sortedTips = useMemo(() => {
    const ranked = [...contextual, ...tips];
    return ranked.sort((a, b) => {
      const sA = (feedbackScores[a.id] || 0) + (a.category === topCat ? 100 : 0);
      const sB = (feedbackScores[b.id] || 0) + (b.category === topCat ? 100 : 0);
      return sB - sA;
    });
  }, [tips, contextual, topCat, feedbackScores]);

  const sendFeedback = async (tipId: string, helpful: boolean) => {
    if (!user || tipId.startsWith("d") || tipId.startsWith("ctx")) {
      setFeedback({ ...feedback, [tipId]: helpful });
      return;
    }
    setFeedback({ ...feedback, [tipId]: helpful });
    await supabase.from("tip_feedback" as any).upsert(
      { user_id: user.id, tip_id: tipId, is_helpful: helpful },
      { onConflict: "user_id,tip_id" }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-2">Eco Tips</h2>
        <p className="text-muted-foreground">Personalised tips based on your real activity.</p>
      </div>

      {/* Did You Know */}
      {fact && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 rounded-2xl p-5 flex gap-4 items-start">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">Did You Know?</p>
            <p className="text-foreground text-sm leading-relaxed">{fact.fact_text}</p>
            {fact.source && <p className="text-muted-foreground text-xs mt-1">— {fact.source}</p>}
          </div>
        </motion.div>
      )}

      {/* Personal insight */}
      {loading ? (
        <Skeleton className="h-32" />
      ) : totalCo2 > 0 && topCat ? (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="text-foreground font-semibold">Your last 30 days</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Your <span className="text-foreground font-medium">{topCat}</span> emissions are <span className="text-orange-400 font-semibold">{topPct}%</span> of your total footprint — here are tips to reduce them.
          </p>
          <div className="flex h-3 rounded-full overflow-hidden bg-muted">
            {sortedCats.map(([cat, val], i) => (
              <div key={cat}
                className={cn(categoryColors[cat] || "bg-gray-500", i === 0 && "ring-2 ring-orange-400/60")}
                style={{ width: `${(val / totalCo2) * 100}%` }}
                title={`${cat}: ${val.toFixed(1)} kg`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            {sortedCats.map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", categoryColors[cat] || "bg-gray-500")} />
                <span className="text-muted-foreground">{cat}: {val.toFixed(1)} kg</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5 text-muted-foreground text-sm text-center">
          Log activities to get personalised tips based on your real footprint.
        </div>
      )}

      {/* Tips grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : sortedTips.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          No tips available yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTips.map((tip, i) => {
            const Icon = categoryIcons[tip.category] || Leaf;
            const fb = feedback[tip.id];
            const isContextual = tip.id.startsWith("ctx");
            return (
              <motion.div key={tip.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn("bg-card rounded-2xl border p-5 hover:border-primary/30 transition-all flex flex-col",
                  isContextual ? "border-primary/40 bg-primary/5" : "border-border")}>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {isContextual && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">For you</span>}
                    <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium",
                      difficultyColors[tip.difficulty] || "bg-muted text-muted-foreground")}>
                      {tip.difficulty}
                    </span>
                  </div>
                </div>
                <h3 className="text-foreground font-semibold mb-1">{tip.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{tip.description}</p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground mr-auto">Helpful?</span>
                  <button onClick={() => sendFeedback(tip.id, true)}
                    className={cn("p-1.5 rounded-lg transition-colors",
                      fb === true ? "bg-green-500/20 text-green-400" : "text-muted-foreground hover:bg-muted")}>
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => sendFeedback(tip.id, false)}
                    className={cn("p-1.5 rounded-lg transition-colors",
                      fb === false ? "bg-red-500/20 text-red-400" : "text-muted-foreground hover:bg-muted")}>
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tips;
