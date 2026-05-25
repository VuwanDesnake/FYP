import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Target, Sparkles, Shield, Loader2, LogOut, Award, Share2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Section = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
    {children}
  </motion.div>
);

const getCarbonGrade = (avgWeekly: number): { grade: string; color: string } => {
  if (avgWeekly <= 15) return { grade: "A+", color: "text-green-400" };
  if (avgWeekly <= 25) return { grade: "A", color: "text-green-400" };
  if (avgWeekly <= 35) return { grade: "B", color: "text-lime-400" };
  if (avgWeekly <= 50) return { grade: "C", color: "text-yellow-400" };
  if (avgWeekly <= 70) return { grade: "D", color: "text-orange-400" };
  return { grade: "F", color: "text-red-400" };
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [badgeCount, setBadgeCount] = useState(0);

  const [prefs, setPrefs] = useState({
    email_notifications: true,
    weekly_summary: true,
    daily_reminder: false,
    weekly_co2_target: 50,
    goal_reminders: true,
    eco_tips: true,
    action_suggestions: true,
    achievement_alerts: true,
  });

  const [newPassword, setNewPassword] = useState("");

  const [avgWeekly, setAvgWeekly] = useState(0);
  const carbonGrade = useMemo(() => getCarbonGrade(avgWeekly), [avgWeekly]);
  const memberSince = (profile as any)?.created_at ? new Date((profile as any).created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setEmail(profile.email || "");
      setCity(profile.city || "");
    }
    fetchPreferences();
    fetchBadges();
    fetchAvgWeekly();
  }, [profile]);

  const fetchPreferences = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single();
    if (data) {
      setPrefs({
        email_notifications: (data as any).email_notifications,
        weekly_summary: (data as any).weekly_summary,
        daily_reminder: (data as any).daily_reminder,
        weekly_co2_target: Number((data as any).weekly_co2_target),
        goal_reminders: (data as any).goal_reminders,
        eco_tips: (data as any).eco_tips,
        action_suggestions: (data as any).action_suggestions,
        achievement_alerts: (data as any).achievement_alerts,
      });
    }
  };

  const fetchBadges = async () => {
    if (!user) return;
    const { count } = await supabase.from("badges").select("*", { count: "exact", head: true }).eq("user_id", user.id);
    setBadgeCount(count || 0);
  };

  const fetchAvgWeekly = async () => {
    if (!user) return;
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data } = await supabase.from("activity_logs").select("co2_kg").eq("user_id", user.id).gte("logged_at", since.toISOString());
    const logs = data || [];
    setAvgWeekly(logs.length ? logs.reduce((s, l) => s + Number(l.co2_kg), 0) : 0);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving("profile");
    await supabase.from("profiles").update({ full_name: name, email, city, updated_at: new Date().toISOString() } as any).eq("id", user.id);
    await refreshProfile();
    toast({ title: "Profile saved", description: "Your profile has been updated." });
    setSaving(null);
  };

  const savePrefs = async (section: string) => {
    if (!user) return;
    setSaving(section);
    await supabase.from("user_preferences").update({ ...prefs, updated_at: new Date().toISOString() } as any).eq("user_id", user.id);
    toast({ title: "Preferences saved", description: "Your preferences have been updated." });
    setSaving(null);
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setSaving("security");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "Your password has been changed." });
      setNewPassword("");
    }
    setSaving(null);
  };

  const shareScore = () => {
    const text = `🌱 My FootZero carbon score is ${carbonGrade.grade}! I'm tracking and reducing my carbon footprint. Join me!`;
    if (navigator.share) {
      navigator.share({ title: "My Carbon Score", text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Your carbon score has been copied to clipboard." });
    }
  };

  const updatePref = (key: string, value: any) => setPrefs(prev => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your profile and app preferences.</p>
      </div>

      {/* Carbon Score Card */}
      <Section delay={0}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-foreground font-semibold text-lg mb-4">Your Carbon Profile</h3>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className={`text-3xl font-black ${carbonGrade.color}`}>{carbonGrade.grade}</span>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="text-center">
                <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-foreground font-bold">{badgeCount}</p>
                <p className="text-muted-foreground text-xs">Badges</p>
              </div>
              <div className="text-center">
                <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-foreground font-bold text-sm">{memberSince}</p>
                <p className="text-muted-foreground text-xs">Member Since</p>
              </div>
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={shareScore} className="mx-auto">
                  <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Profile */}
      <Section delay={0.05}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-foreground font-semibold text-lg">Profile</h3>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-foreground font-medium">{name || "Your Name"}</p>
              <p className="text-muted-foreground text-sm">{email || "your@email.com"}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="bg-background border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-background border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">City</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} className="bg-background border-border text-foreground" />
            </div>
          </div>
          <Button variant="hero" className="mt-5" onClick={saveProfile} disabled={saving === "profile"}>
            {saving === "profile" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Profile
          </Button>
        </div>
      </Section>

      {/* Notifications */}
      <Section delay={0.1}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-foreground font-semibold text-lg">Notifications</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: "email_notifications", label: "Email Notifications", desc: "Receive emission alerts via email" },
              { key: "weekly_summary", label: "Weekly Summary Report", desc: "Get a weekly carbon summary" },
              { key: "daily_reminder", label: "Daily Reminder", desc: "Daily nudge to log your activities" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
                <Switch checked={(prefs as any)[item.key]} onCheckedChange={v => updatePref(item.key, v)} />
              </div>
            ))}
          </div>
          <Button variant="hero" className="mt-5" onClick={() => savePrefs("notifications")} disabled={saving === "notifications"}>
            {saving === "notifications" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Notifications
          </Button>
        </div>
      </Section>

      {/* Goals & Reminders */}
      <Section delay={0.15}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-foreground font-semibold text-lg">Goals & Reminders</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Weekly CO₂ Target (kg)</Label>
              <Input type="number" value={prefs.weekly_co2_target} onChange={e => updatePref("weekly_co2_target", Number(e.target.value))} className="bg-background border-border text-foreground max-w-[200px]" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground text-sm font-medium">Goal Reminders</p>
                <p className="text-muted-foreground text-xs">Remind me about my weekly goals</p>
              </div>
              <Switch checked={prefs.goal_reminders} onCheckedChange={v => updatePref("goal_reminders", v)} />
            </div>
          </div>
          <Button variant="hero" className="mt-5" onClick={() => savePrefs("goals")} disabled={saving === "goals"}>
            {saving === "goals" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Goals
          </Button>
        </div>
      </Section>

      {/* Preferences */}
      <Section delay={0.2}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-foreground font-semibold text-lg">Preferences</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: "eco_tips", label: "Eco Tips", desc: "Show personalized eco tips" },
              { key: "action_suggestions", label: "Action Suggestions", desc: "Suggest eco-friendly actions" },
              { key: "achievement_alerts", label: "Achievement Alerts", desc: "Notify when you earn badges" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
                <Switch checked={(prefs as any)[item.key]} onCheckedChange={v => updatePref(item.key, v)} />
              </div>
            ))}
          </div>
          <Button variant="hero" className="mt-5" onClick={() => savePrefs("preferences")} disabled={saving === "preferences"}>
            {saving === "preferences" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Preferences
          </Button>
        </div>
      </Section>

      {/* Security */}
      <Section delay={0.25}>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-foreground font-semibold text-lg">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">New Password</Label>
              <Input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-background border-border text-foreground max-w-sm" />
            </div>
          </div>
          <Button variant="hero" className="mt-5" onClick={changePassword} disabled={saving === "security"}>
            {saving === "security" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Update Password
          </Button>
        </div>
      </Section>

      {/* Logout */}
      <Section delay={0.3}>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-foreground font-semibold flex items-center gap-2 mb-4">
            <LogOut className="h-5 w-5 text-destructive" /> Account
          </h3>
          <p className="text-muted-foreground text-sm mb-4">Sign out of your account. You can log back in as a different user or admin.</p>
          <Button
            variant="destructive"
            onClick={async () => {
              await signOut();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default SettingsPage;
