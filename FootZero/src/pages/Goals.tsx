import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Trophy, ChevronRight, Pencil, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const ecoActions = [
  { id: "1", label: "Use public transport instead of driving", checked: false },
  { id: "2", label: "Eat a plant-based meal today", checked: false },
  { id: "3", label: "Turn off lights when leaving rooms", checked: false },
  { id: "4", label: "Bring a reusable bag to the store", checked: false },
  { id: "5", label: "Take a shorter shower (under 5 min)", checked: false },
  { id: "6", label: "Avoid single-use plastics", checked: false },
  { id: "7", label: "Walk or cycle for trips under 2 km", checked: false },
  { id: "8", label: "Cook at home instead of ordering delivery", checked: false },
];

const challengeTemplates = [
  { id: "t1", name: "Green Starter",        target: 50,  days: 7,  category: "General",   difficulty: "Beginner"     },
  { id: "t2", name: "Low-Carbon Week",       target: 35,  days: 7,  category: "General",   difficulty: "Intermediate" },
  { id: "t3", name: "Zero Waste Challenge",  target: 20,  days: 7,  category: "Shopping",  difficulty: "Advanced"     },
  { id: "t4", name: "Bike-to-Work Week",     target: 10,  days: 7,  category: "Transport", difficulty: "Intermediate" },
  { id: "t5", name: "Plant-Based Month",     target: 100, days: 30, category: "Diet",      difficulty: "Advanced"     },
  { id: "t6", name: "Energy Saver Sprint",   target: 25,  days: 14, category: "Energy",    difficulty: "Intermediate" },
];

const difficultyColors: Record<string, string> = {
  Beginner:     "bg-green-500/15 text-green-400",
  Intermediate: "bg-yellow-500/15 text-yellow-400",
  Advanced:     "bg-red-500/15 text-red-400",
};

const Goals = () => {
  const { user } = useAuth();
  const [actions, setActions] = useState(ecoActions);
  const [loading, setLoading] = useState(true);
  const [weeklyTarget, setWeeklyTarget] = useState(50);
  const [currentEmission, setCurrentEmission] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTarget, setEditTarget] = useState("50");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch user's latest goal
    const { data: goalData } = await supabase
      .from("goals")
      .select("weekly_target")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (goalData && goalData.length > 0) {
      const target = Number(goalData[0].weekly_target);
      setWeeklyTarget(target);
      setEditTarget(String(target));
    }

    // Fetch this week's emissions
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: logs } = await supabase
      .from("activity_logs")
      .select("co2_kg")
      .eq("user_id", user.id)
      .gte("logged_at", startOfWeek.toISOString());

    const total = (logs || []).reduce((s, l) => s + Number(l.co2_kg), 0);
    setCurrentEmission(Math.round(total * 10) / 10);
    setLoading(false);
  };

  const progress = Math.min(100, Math.max(0, ((weeklyTarget - currentEmission) / weeklyTarget) * 100));

  const toggleAction = (id: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, checked: !a.checked } : a));
  };

  const savePersonalGoal = async () => {
    if (!user) return;
    const target = parseFloat(editTarget);
    if (isNaN(target) || target <= 0) {
      toast({ title: "Invalid target", description: "Please enter a valid CO₂ target greater than 0.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("goals").insert({ user_id: user.id, weekly_target: target } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setWeeklyTarget(target);
      setIsEditing(false);
      toast({ title: "Goal saved!", description: `Your weekly target is now ${target} kg CO₂.` });
    }
    setSaving(false);
  };

  const adoptGoal = async (t: typeof challengeTemplates[0]) => {
    if (!user) return;
    const { error } = await supabase.from("goals").insert({ user_id: user.id, weekly_target: t.target } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setWeeklyTarget(t.target);
    setEditTarget(String(t.target));
    toast({ title: "Goal adopted! 🎯", description: `${t.name} — stay under ${t.target} kg CO₂ for ${t.days} days` });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-2">Goals & Actions</h2>
        <p className="text-muted-foreground">Set reduction targets and track your eco-friendly actions.</p>
      </div>

      {/* Weekly Goal */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            <h3 className="text-foreground font-semibold text-lg">Weekly Reduction Goal</h3>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl" onClick={() => { setIsEditing(true); setEditTarget(String(weeklyTarget)); }}>
              <Pencil className="h-3.5 w-3.5" />
              Set My Goal
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => setIsEditing(false)}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
              <Button variant="hero" size="sm" className="rounded-xl text-xs" onClick={savePersonalGoal} disabled={saving}>
                <Check className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
            </div>
          )}
        </div>

        {/* Personal Goal Input */}
        {isEditing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 bg-background/50 rounded-xl border border-border">
            <Label className="text-foreground text-sm mb-2 block">Set your weekly CO₂ target (kg)</Label>
            <div className="flex gap-3 items-center">
              <Input
                type="number"
                min="1"
                max="500"
                value={editTarget}
                onChange={e => setEditTarget(e.target.value)}
                className="bg-background border-border text-foreground h-11 rounded-xl w-40"
                placeholder="e.g. 50"
              />
              <span className="text-muted-foreground text-sm">kg CO₂ per week</span>
            </div>
            <p className="text-muted-foreground text-xs mt-2">💡 The average person emits ~100 kg CO₂ per week. Try setting a target below that!</p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center gap-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-8">
            {/* Progress Ring */}
            <div className="relative h-32 w-32 flex-shrink-0">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" strokeWidth="10" className="stroke-muted" />
                <motion.circle
                  cx="64" cy="64" r="56" fill="none" strokeWidth="10"
                  strokeLinecap="round"
                  className={currentEmission >= weeklyTarget ? "stroke-red-500" : "stroke-primary"}
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - progress / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${currentEmission >= weeklyTarget ? "text-red-400" : "text-foreground"}`}>
                  {progress.toFixed(0)}%
                </span>
                <span className="text-muted-foreground text-xs">remaining</span>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-muted-foreground text-sm">Target: under <span className="text-foreground font-medium">{weeklyTarget} kg CO₂</span></p>
              <p className="text-foreground text-3xl font-bold mt-1">{currentEmission} kg</p>
              <p className="text-muted-foreground text-xs mt-2">
                {currentEmission >= weeklyTarget
                  ? "⚠️ You've exceeded your target this week. Try reducing transport or diet emissions!"
                  : `${(weeklyTarget - currentEmission).toFixed(1)} kg remaining to reach your goal 🌿`}
              </p>
              {currentEmission === 0 && (
                <p className="text-muted-foreground text-xs mt-1">No activities logged this week yet — start tracking!</p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Challenge Goals */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-6 w-6 text-primary" />
          <h3 className="text-foreground font-semibold text-lg">Challenge Goals</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-4">Click Adopt Goal to set any challenge as your weekly target.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {challengeTemplates.map(t => (
            <div key={t.id} className={`border rounded-xl p-4 hover:border-primary/30 transition-all ${weeklyTarget === t.target ? "border-primary/50 bg-primary/5" : "border-border"}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-foreground font-medium text-sm">{t.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[t.difficulty] || "bg-muted text-muted-foreground"}`}>
                  {t.difficulty}
                </span>
              </div>
              <p className="text-muted-foreground text-xs mb-3">
                Stay under {t.target} kg CO₂ for {t.days} days • {t.category}
              </p>
              {weeklyTarget === t.target ? (
                <div className="w-full text-center text-xs text-primary font-medium py-1.5">
                  ✅ Current Goal
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full text-xs rounded-xl" onClick={() => adoptGoal(t)}>
                  Adopt Goal <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Eco Actions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-foreground font-semibold text-lg mb-1">Suggested Eco Actions</h3>
        <p className="text-muted-foreground text-sm mb-4">Check off actions you complete today!</p>
        <div className="space-y-3">
          {actions.map(action => (
            <label key={action.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer">
              <Checkbox
                checked={action.checked}
                onCheckedChange={() => toggleAction(action.id)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className={`text-sm transition-all ${action.checked ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {action.label}
              </span>
              {action.checked && <span className="ml-auto text-xs text-primary">✓ Done!</span>}
            </label>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-muted-foreground text-xs">
            {actions.filter(a => a.checked).length} of {actions.length} actions completed today 🌱
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Goals;
