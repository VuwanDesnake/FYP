import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Activity, TrendingDown, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const tooltipStyle = { backgroundColor: "hsl(224,25%,19%)", border: "1px solid hsl(224,20%,25%)", borderRadius: "8px", color: "#fff" };

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeToday, setActiveToday] = useState(0);
  const [avgCo2, setAvgCo2] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [signupData, setSignupData] = useState<{ week: string; signups: number }[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const todayStr = new Date().toISOString().slice(0, 10);

    // All profiles
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, role, created_at").order("created_at", { ascending: false });
    const allProfiles = profiles || [];
    setTotalUsers(allProfiles.length);
    setAdminCount(allProfiles.filter(p => p.role === "admin").length);
    setRecentUsers(allProfiles.slice(0, 4));

    // Weekly signups (last 6 weeks)
    const weeks: { week: string; signups: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const count = allProfiles.filter(p => {
        const d = new Date(p.created_at);
        return d >= start && d < end;
      }).length;
      weeks.push({ week: `W${6 - i}`, signups: count });
    }
    setSignupData(weeks);

    // Activity logs — active today + avg co2
    const { data: todayLogs } = await supabase.from("activity_logs").select("user_id, co2_kg").gte("logged_at", todayStr + "T00:00:00");
    const tLogs = todayLogs || [];
    const uniqueUsers = new Set(tLogs.map(l => l.user_id));
    setActiveToday(uniqueUsers.size);

    const { data: allLogs } = await supabase.from("activity_logs").select("co2_kg");
    const aLogs = allLogs || [];
    setAvgCo2(aLogs.length ? aLogs.reduce((s, l) => s + Number(l.co2_kg), 0) / aLogs.length : 0);

    setLoading(false);
  };

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users },
    { label: "Active Today", value: activeToday.toLocaleString(), icon: Activity },
    { label: "Avg CO₂/Log", value: `${avgCo2.toFixed(1)} kg`, icon: TrendingDown },
    { label: "Admins", value: adminCount.toLocaleString(), icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">{s.label}</span>
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            {loading ? <Skeleton className="h-8 w-20" /> : <p className="text-foreground text-2xl font-bold">{s.value}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-foreground font-semibold mb-4">Weekly Signups</h3>
          {loading ? <Skeleton className="h-[260px] w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,25%)" />
                <XAxis dataKey="week" stroke="hsl(220,15%,60%)" fontSize={12} />
                <YAxis stroke="hsl(220,15%,60%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="signups" fill="#4ecdc4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-foreground font-semibold mb-4">Recent Users</h3>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
          ) : recentUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-foreground text-sm font-medium">{u.full_name || "Unnamed"}</p>
                    <p className="text-muted-foreground text-xs">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
