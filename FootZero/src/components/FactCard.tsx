import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Fact {
  fact_text: string;
  source: string | null;
}

export function FactCard() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    supabase
      .from("facts" as any)
      .select("fact_text, source")
      .eq("is_active", true)
      .then(({ data }: any) => {
        if (data?.length) setFacts(data);
      });
  }, []);

  useEffect(() => {
    if (facts.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % facts.length), 8000);
    return () => clearInterval(timer);
  }, [facts.length]);

  if (!facts.length) return null;
  const fact = facts[index];

  return (
    <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">Did You Know?</p>
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              <p className="text-foreground text-sm leading-relaxed">{fact.fact_text}</p>
              {fact.source && <p className="text-muted-foreground text-xs mt-1">— {fact.source}</p>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/* Progress dots */}
      {facts.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {facts.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
