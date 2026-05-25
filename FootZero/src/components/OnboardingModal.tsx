import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Target, MapPin, HelpCircle, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { icon: Leaf, title: "Welcome to FootZero!", description: "Track, reduce, and offset your carbon footprint. Let's set you up in under a minute." },
  { icon: Target, title: "Set Your First Goal", description: "How many kg CO₂ do you want to stay under per week?" },
  { icon: MapPin, title: "Choose Your City", description: "We'll show you local weather and air quality data." },
  { icon: HelpCircle, title: "Quick Carbon Quiz", description: "Test your eco knowledge with a fun question!" },
];

const quizQuestion = {
  question: "Which produces more CO₂: a 1-hour flight or driving 500 km?",
  options: ["1-hour flight", "Driving 500 km", "About the same"],
  answer: 0,
};

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [weeklyTarget, setWeeklyTarget] = useState(50);
  const [city, setCity] = useState("");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const handleFinish = async () => {
    if (!user) return;
    // Save city to profile
    if (city) {
      await supabase.from("profiles").update({ city, updated_at: new Date().toISOString() } as any).eq("id", user.id);
    }
    // Save weekly target as a goal
    await supabase.from("goals").insert({ user_id: user.id, weekly_target: weeklyTarget } as any);
    // Mark onboarding complete
    await supabase.from("user_preferences").update({ onboarding_completed: true } as any).eq("user_id", user.id);
    await refreshProfile();
    onComplete();
  };

  const canNext = () => {
    if (step === 1) return weeklyTarget > 0;
    if (step === 2) return city.trim().length > 0;
    if (step === 3) return quizAnswer !== null;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/50" : "w-2 bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {/* Step icon */}
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
              {step === 0 ? <Logo size="lg" showText={false} /> : (() => { const Icon = steps[step].icon; return <Icon className="h-8 w-8 text-primary" />; })()}
            </div>

            <h2 className="text-foreground text-xl font-bold text-center mb-2">{steps[step].title}</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">{steps[step].description}</p>

            {/* Step content */}
            {step === 1 && (
              <div className="space-y-3">
                <Label className="text-foreground">Weekly CO₂ Target (kg)</Label>
                <Input type="number" value={weeklyTarget} onChange={(e) => setWeeklyTarget(Number(e.target.value))} className="bg-background border-border text-foreground text-center text-lg" min={1} />
                <p className="text-muted-foreground text-xs text-center">The average person emits about 50 kg/week. Start there and reduce over time!</p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <Label className="text-foreground">Your City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Kathmandu" className="bg-background border-border text-foreground" />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-foreground text-sm font-medium text-center">{quizQuestion.question}</p>
                <div className="space-y-2">
                  {quizQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setQuizAnswer(i)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                        quizAnswer === i
                          ? i === quizQuestion.answer
                            ? "bg-primary/15 border-primary text-primary"
                            : "bg-destructive/10 border-destructive text-destructive"
                          : "bg-background border-border text-foreground hover:border-primary/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {quizAnswer !== null && (
                  <p className={`text-xs text-center font-medium ${quizAnswer === quizQuestion.answer ? "text-primary" : "text-muted-foreground"}`}>
                    {quizAnswer === quizQuestion.answer ? "Correct! ✈️ A 1-hour flight emits ~250 kg CO₂." : "Not quite — a 1-hour flight emits ~250 kg CO₂, more than driving 500 km (~100 kg)."}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          ) : <div />}
          {step < steps.length - 1 ? (
            <Button variant="hero" size="sm" onClick={() => setStep(step + 1)} disabled={!canNext()}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button variant="hero" size="sm" onClick={handleFinish} disabled={!canNext()}>
              <Check className="h-4 w-4 mr-1" /> Get Started
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
