import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Save, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { formatDetails, capitalizeCategory } from "@/lib/formatDetails";

const COLORS = ["#4ecdc4", "#45b7aa", "#38a89d"];

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const state = location.state as any;

  const calculateCo2 = (): { category: string; co2: number; details: any } => {
    if (!state?.category) return { category: "Unknown", co2: 0, details: {} };
    const co2 = (Number(state.co2PerUnit) || 0) * (Number(state.quantity) || 0);
    const details = {
      source: state.sourceName,
      quantity: Number(state.quantity),
      unit: state.unit,
      co2_per_unit: Number(state.co2PerUnit),
    };
    return {
      category: capitalizeCategory(state.category),
      co2: Math.round(co2 * 100) / 100,
      details,
    };
  };

  const result = calculateCo2();
  const pieData = [{ name: result.category, value: result.co2 }];

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("activity_logs").insert({
      user_id: user.id,
      category: result.category,
      co2_kg: result.co2,
      details: result.details,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: "Activity has been saved to your dashboard." });
      setSaved(true);
    }
    setSaving(false);
  };

  if (!state?.category) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-muted-foreground mb-4">No calculation data found.</p>
        <Button variant="hero" onClick={() => navigate("/calculator")}>Go to Calculator</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h2 className="text-foreground text-2xl font-bold mb-2">Your Results</h2>
      <p className="text-muted-foreground mb-8">Here's the carbon impact of your activity.</p>

      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="text-center mb-4">
          <p className="text-muted-foreground text-sm">Total Emissions</p>
          <p className="text-4xl font-bold text-primary">{result.co2.toFixed(1)} kg</p>
          <p className="text-muted-foreground text-xs">CO₂ equivalent</p>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}kg`}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "hsl(224,25%,19%)", border: "1px solid hsl(224,20%,25%)", borderRadius: "8px", color: "#fff" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-foreground text-sm">Category</span>
          <span className="text-muted-foreground text-sm font-medium">{result.category}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground text-sm">Details</span>
          <span className="text-muted-foreground text-sm font-medium">{formatDetails(result.details)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-foreground text-sm font-medium">CO₂ Emissions</span>
          <span className="text-primary text-sm font-bold">{result.co2.toFixed(1)} kg</span>
        </div>
      </div>

      <Button variant="hero" size="lg" className="w-full" onClick={saved ? () => navigate("/dashboard") : handleSave} disabled={saving}>
        {saving ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
        ) : saved ? (
          <><CheckCircle className="h-4 w-4 mr-2" /> Go to Dashboard</>
        ) : (
          <><Save className="h-4 w-4 mr-2" /> Save to Dashboard</>
        )}
      </Button>
    </div>
  );
};

export default Results;
