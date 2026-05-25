import { useEffect, useState } from "react";
import { Car, Utensils, Zap, ShoppingBag, Calculator as CalcIcon, Loader2, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { capitalizeCategory } from "@/lib/formatDetails";

interface EmissionSource {
  id: string;
  category: string;
  name: string;
  unit: string;
  co2_per_unit: number;
  icon: string | null;
  is_active: boolean;
}

const categories = [
  { id: "transport", label: "Transport", icon: Car, quantityLabel: "Distance" },
  { id: "diet", label: "Diet", icon: Utensils, quantityLabel: "Servings" },
  { id: "energy", label: "Energy", icon: Zap, quantityLabel: "Usage" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, quantityLabel: "Items" },
];

const CalculatorPage = () => {
  const { user } = useAuth();
  const [category, setCategory] = useState("transport");
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [result, setResult] = useState<{ co2: number; sourceName: string; unit: string; co2PerUnit: number; quantity: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedId("");
    setQuantity("");
    setResult(null);
    setSaved(false);
    (async () => {
      const { data } = await supabase
        .from("emission_sources" as any)
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("name");
      if (!cancelled) {
        setSources((data as any) || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category]);

  const activeCategory = categories.find((c) => c.id === category)!;
  const selected = sources.find((s) => s.id === selectedId);

  const handleCalculate = () => {
    if (!selected || !quantity) return;
    const q = Number(quantity);
    if (Number.isNaN(q) || q <= 0) {
      toast({ title: "Invalid quantity", description: "Please enter a positive number.", variant: "destructive" });
      return;
    }
    const co2 = Math.round(selected.co2_per_unit * q * 100) / 100;
    setResult({ co2, sourceName: selected.name, unit: selected.unit, co2PerUnit: selected.co2_per_unit, quantity: q });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user || !result) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("activity_logs").insert({
      user_id: user.id,
      category: capitalizeCategory(category),
      co2_kg: result.co2,
      details: {
        source: result.sourceName,
        quantity: result.quantity,
        unit: result.unit,
        co2_per_unit: result.co2PerUnit,
      },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: "Activity has been saved to your dashboard." });
      setSaved(true);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-2">Carbon Calculator</h2>
        <p className="text-muted-foreground">Pick a category, enter your activity, and calculate emissions instantly.</p>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200",
              category === c.id
                ? "bg-primary/15 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            <c.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Sources */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h3 className="text-foreground font-semibold">Choose a {activeCategory.label.toLowerCase()} source</h3>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : sources.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            No emission sources available yet for this category.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {sources.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedId(s.id); setResult(null); setSaved(false); }}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200",
                  selectedId === s.id
                    ? "bg-primary/15 border-primary"
                    : "bg-background border-border hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-xl",
                  selectedId === s.id ? "bg-primary/25" : "bg-muted"
                )}>
                  {s.icon || "🌱"}
                </div>
                <div>
                  <p className={cn("font-medium text-sm", selectedId === s.id ? "text-primary" : "text-foreground")}>{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.co2_per_unit} kg CO₂/{s.unit}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="space-y-2 pt-2">
            <Label className="text-foreground">{activeCategory.quantityLabel} ({selected.unit})</Label>
            <Input
              type="number"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => { setQuantity(e.target.value); setResult(null); setSaved(false); }}
              className="bg-background border-border text-foreground"
            />
          </div>
        )}

        <Button
          variant="hero"
          size="lg"
          className="w-full"
          disabled={!selected || !quantity}
          onClick={handleCalculate}
        >
          <CalcIcon className="h-4 w-4 mr-2" />
          Calculate Emissions
        </Button>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-5"
        >
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Total Emissions</p>
            <p className="text-4xl font-bold text-primary">{result.co2.toFixed(2)} kg</p>
            <p className="text-muted-foreground text-xs">CO₂ equivalent</p>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[{ name: activeCategory.label, value: result.co2 }]}
                cx="50%" cy="50%" outerRadius={75} dataKey="value"
                label={({ name, value }) => `${name}: ${value}kg`}
              >
                <Cell fill="hsl(174,58%,55%)" />
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(224,25%,19%)", border: "1px solid hsl(224,20%,25%)", borderRadius: "8px", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><span className="text-foreground">Category</span><span className="text-muted-foreground">{activeCategory.label}</span></div>
            <div className="flex justify-between"><span className="text-foreground">Source</span><span className="text-muted-foreground">{result.sourceName}</span></div>
            <div className="flex justify-between"><span className="text-foreground">Quantity</span><span className="text-muted-foreground">{result.quantity} {result.unit}</span></div>
            <div className="flex justify-between"><span className="text-foreground">Factor</span><span className="text-muted-foreground">{result.co2PerUnit} kg/{result.unit}</span></div>
          </div>

          <Button variant="hero" size="lg" className="w-full" onClick={handleSave} disabled={saving || saved}>
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
            ) : saved ? (
              <><CheckCircle className="h-4 w-4 mr-2" /> Saved to Dashboard</>
            ) : (
              <><Save className="h-4 w-4 mr-2" /> Save to Dashboard</>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default CalculatorPage;