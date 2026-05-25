import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown, Zap, Leaf, Award, Send, Loader2, Calculator, Target, Lightbulb, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FactCard } from "@/components/FactCard";
import { StreakCounter } from "@/components/StreakCounter";
import { DailyQuote } from "@/components/DailyQuote";
import { OnboardingModal } from "@/components/OnboardingModal";
import { AQIWidget } from "@/components/AQIWidget";
import { formatDetails, capitalizeCategory } from "@/lib/formatDetails";

const COLORS = ["hsl(174,58%,55%)", "hsl(174,58%,45%)", "hsl(199,89%,48%)", "hsl(199,60%,40%)"];
const tooltipStyle = { backgroundColor: "hsl(224,25%,19%)", border: "1px solid hsl(224,20%,25%)", borderRadius: "12px", color: "#fff", fontSize: "13px" };

const quickActions = [
  { label: "Log Activity", icon: Calculator, path: "/calculator" },
  { label: "View Goals", icon: Target, path: "/goals" },
  { label: "Eco Tips", icon: Lightbulb, path: "/tips" },
];

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  const [todayCo2, setTodayCo2] = useState(0);
  const [weekCo2, setWeekCo2] = useState(0);
  const [monthCo2, setMonthCo2] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [dailyData, setDailyData] = useState<{ day: string; co2: number }[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_preferences").select("onboarding_completed").eq("user_id", user.id).single()
      .then(({ data }: any) => { if (data && !data.onboarding_completed) setShowOnboarding(true); });
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: logs } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user!.id)
      .gte("logged_at", startOfMonth.toISOString())
      .order("logged_at", { ascending: false });

    const allLogs = logs || [];
    setTodayCo2(allLogs.filter(l => l.logged_at.slice(0, 10) === todayStr).reduce((s, l) => s + Number(l.co2_kg), 0));
    setWeekCo2(allLogs.filter(l => new Date(l.logged_at) >= startOfWeek).reduce((s, l) => s + Number(l.co2_kg), 0));
    setMonthCo2(allLogs.reduce((s, l) => s + Number(l.co2_kg), 0));

    const catMap: Record<string, number> = {};
    allLogs.forEach(l => { const c = capitalizeCategory(l.category); catMap[c] = (catMap[c] || 0) + Number(l.co2_kg); });
    setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 })));

    const days: { day: string; co2: number }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const total = allLogs.filter(l => l.logged_at.slice(0, 10) === ds).reduce((s, l) => s + Number(l.co2_kg), 0);
      days.push({ day: dayNames[d.getDay()], co2: Math.round(total * 10) / 10 });
    }
    setDailyData(days);

    const { data: recent } = await supabase
      .from("activity_logs").select("*").eq("user_id", user!.id).order("logged_at", { ascending: false }).limit(5);
    setRecentLogs(recent || []);

    const { count } = await supabase.from("badges").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
    setBadgeCount(count || 0);

    // Check and award badges
    await checkAndAwardBadges(allLogs);

    setLoading(false);
  };

  const checkAndAwardBadges = async (monthLogs: any[]) => {
    if (!user) return;
    const { data: existingBadges } = await supabase.from("badges").select("badge_name").eq("user_id", user.id);
    const earned = new Set((existingBadges || []).map(b => b.badge_name));

    const awardBadge = async (name: string) => {
      if (earned.has(name)) return;
      await supabase.from("badges").insert({ user_id: user.id, badge_name: name });
      await supabase.from("notifications").insert({ user_id: user.id, message: `🏆 Badge earned: ${name}!` });
    };

    // First Step: has any activity
    const { count: totalCount } = await supabase.from("activity_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id);
    if ((totalCount || 0) > 0) await awardBadge("first_step");

    // Green Week: under 50kg this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekTotal = monthLogs.filter(l => new Date(l.logged_at) >= startOfWeek).reduce((s, l) => s + Number(l.co2_kg), 0);
    if (weekTotal > 0 && weekTotal < 50) await awardBadge("green_week");

    // Streak Master: 7 consecutive days
    const { data: allLogs } = await supabase.from("activity_logs").select("logged_at").eq("user_id", user.id).order("logged_at", { ascending: false });
    if (allLogs) {
      const uniqueDays = [...new Set(allLogs.map(l => l.logged_at.slice(0, 10)))].sort().reverse();
      let streak = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        const prev = new Date(uniqueDays[i - 1]);
        const curr = new Date(uniqueDays[i]);
        prev.setDate(prev.getDate() - 1);
        if (prev.toISOString().slice(0, 10) === curr.toISOString().slice(0, 10)) {
          streak++;
          if (streak >= 7) { await awardBadge("streak_master"); break; }
        } else { streak = 1; }
      }
    }

    // Carbon Cutter: 20% reduction vs last week
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekLogs = (allLogs || []).filter(l => {
      const d = new Date(l.logged_at);
      return d >= lastWeekStart && d < startOfWeek;
    });
    // We don't have co2_kg in the lightweight query, so skip if not available
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: contactName, email: contactEmail, message: contactMessage, user_id: user?.id,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setContactName(""); setContactEmail(""); setContactMessage("");
    }
    setSending(false);
  };

  const summaryCards = [
    { label: "Today", value: `${todayCo2.toFixed(1)} kg`, icon: Zap },
    { label: "This Week", value: `${weekCo2.toFixed(1)} kg`, icon: TrendingDown },
    { label: "This Month", value: `${monthCo2.toFixed(1)} kg`, icon: Leaf },
    { label: "Badges Earned", value: String(badgeCount), icon: Award },
  ];

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}
      <div className="space-y-6">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero opacity-[0.04]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-foreground text-xl font-bold">{greeting()}, {profile?.full_name?.split(" ")[0] || "there"} 👋</h2>
              <p className="text-muted-foreground text-sm mt-1">Here's your carbon footprint overview. Keep going green!</p>
            </div>
            <div className="flex gap-2">
              {quickActions.map(a => (
                <button key={a.label} onClick={() => navigate(a.path)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <a.icon className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FactCard />
          <StreakCounter />
          <DailyQuote />
        </div>

        <AQIWidget />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">{card.label}</span>
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <card.icon className="h-4.5 w-4.5 text-primary" />
                </div>
              </div>
              {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-foreground text-2xl font-bold">{card.value}</p>}
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground font-semibold mb-4">Category Breakdown</h3>
            {loading ? (
              <Skeleton className="h-[250px] w-full rounded-xl" />
            ) : categoryData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No activities logged yet — start tracking your carbon footprint!</div>
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-2">
                  {categoryData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Daily Emissions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground font-semibold mb-4">Daily Emissions (kg CO₂)</h3>
            {loading ? (
              <Skeleton className="h-[280px] w-full rounded-xl" />
            ) : dailyData.every(d => d.co2 === 0) ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No data for this week yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,25%)" />
                  <XAxis dataKey="day" stroke="hsl(220,15%,60%)" fontSize={12} />
                  <YAxis stroke="hsl(220,15%,60%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="co2" fill="hsl(174,58%,55%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Recent Activities */}
        {!loading && recentLogs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="text-foreground font-semibold mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div>
                    <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium mr-2">{capitalizeCategory(log.category)}</span>
                    <span className="text-foreground text-sm">{formatDetails(log.details)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-sm font-medium">{Number(log.co2_kg).toFixed(1)} kg</p>
                    <p className="text-muted-foreground text-xs">{new Date(log.logged_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Get In Touch - Contact Email */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold">Get In Touch</h3>
            <p className="text-muted-foreground text-sm">
              Have questions or feedback? Contact us at{" "}
              <a href="mailto:support@footzero.com" className="text-primary font-medium hover:underline">support@footzero.com</a>
            </p>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-foreground font-semibold text-lg mb-1">Send us a message</h3>
          <p className="text-muted-foreground text-sm mb-6">We'd love to hear from you.</p>
          <form onSubmit={handleContact} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Name</Label>
              <Input value={contactName} onChange={e => setContactName(e.target.value)} className="bg-background border-border text-foreground h-11 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Email</Label>
              <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="bg-background border-border text-foreground h-11 rounded-xl" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-foreground text-sm">Message</Label>
              <Textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} className="bg-background border-border text-foreground min-h-[100px] rounded-xl" required />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="hero" className="rounded-xl" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Send Message
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default Dashboard;
