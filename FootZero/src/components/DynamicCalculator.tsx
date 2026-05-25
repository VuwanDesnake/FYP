import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export interface EmissionSource {
  id: string;
  category: string;
  name: string;
  unit: string;
  co2_per_unit: number;
  icon: string | null;
  is_active: boolean;
}

interface Props {
  category: string;
  title: string;
  description: string;
  quantityLabel?: string;
}

const DynamicCalculator = ({ category, title, description, quantityLabel = "Quantity" }: Props) => {
  const navigate = useNavigate();
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("emission_sources" as any)
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("name");
      setSources((data as any) || []);
      setLoading(false);
    })();
  }, [category]);

  const selected = sources.find((s) => s.id === selectedId);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-foreground text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8">{description}</p>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 mb-8 bg-card rounded-2xl border border-border">
          No emission sources available yet for this category.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {sources.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-200",
                selectedId === s.id
                  ? "bg-primary/15 border-primary"
                  : "bg-card border-border hover:border-primary/30"
              )}
            >
              <div className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-2xl",
                selectedId === s.id ? "bg-primary/25" : "bg-muted"
              )}>
                {s.icon || "🌱"}
              </div>
              <div>
                <h3 className={cn("font-semibold", selectedId === s.id ? "text-primary" : "text-foreground")}>{s.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.co2_per_unit} kg CO₂/{s.unit}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <Label className="text-foreground">{quantityLabel} ({selected.unit})</Label>
            <Input
              type="number"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>
        </div>
      )}

      <Button
        variant="hero"
        size="lg"
        className="w-full"
        disabled={!selected || !quantity}
        onClick={() => navigate("/results", {
          state: {
            category,
            sourceId: selected!.id,
            sourceName: selected!.name,
            unit: selected!.unit,
            co2PerUnit: selected!.co2_per_unit,
            quantity: Number(quantity),
          },
        })}
      >
        Calculate Emissions
      </Button>
    </div>
  );
};

export default DynamicCalculator;