import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#4ecdc4", "#45b7aa", "#38a89d", "#2d8f85"];
const tooltipStyle = { backgroundColor: "hsl(224,25%,19%)", border: "1px solid hsl(224,20%,25%)", borderRadius: "8px", color: "#fff" };

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [categoryPie, setCategoryPie] = useState<{ name: string; value: number }[]>([]);
  const [weeklyCo2, setWeeklyCo2] = useState<{ week: string; co2: number }[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ month: string; users: number }[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);

    // All activity logs for category + weekly
    const { data: logs } = await supabase.from("activity_logs").select("category, co2_kg, logged_at");
    const allLogs = logs || [];

    // Category pie
    const catMap: Record<string, number> = {};
    allLogs.forEach(l => { catMap[l.category] = (catMap[l.category] || 0) + Number(l.co2_kg); });
    setCategoryPie(Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value) })));

    // Weekly CO2 (last 6 weeks)
    const weeks: { week: string; co2: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const total = allLogs.filter(l => {
        const d = new Date(l.logged_at);
        return d >= start && d < end;
      }).reduce((s, l) => s + Number(l.co2_kg), 0);
      weeks.push({ week: `W${6 - i}`, co2: Math.round(total) });
    }
    setWeeklyCo2(weeks);

    // User growth (last 6 months cumulative)
    const { data: profiles } = await supabase.from("profiles").select("created_at").order("created_at", { ascending: true });
    const allProfiles = profiles || [];
    const months: { month: string; users: number }[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const count = allProfiles.filter(p => new Date(p.created_at) <= endOfMonth).length;
      months.push({ month: monthNames[d.getMonth()], users: count });
    }
    setUserGrowth(months);

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-1">Platform Reports</h2>
        <p className="text-muted-foreground text-sm">Overview of platform-wide emissions and growth.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-foreground font-semibold mb-4">Platform Emissions by Category</h3>
          {loading ? <Skeleton className="h-[250px] w-full rounded-xl" /> : categoryPie.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No emission data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-foreground font-semibold mb-4">Weekly CO₂ (all users, kg)</h3>
          {loading ? <Skeleton className="h-[250px] w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyCo2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,25%)" />
                <XAxis dataKey="week" stroke="hsl(220,15%,60%)" fontSize={12} />
                <YAxis stroke="hsl(220,15%,60%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="co2" fill="#4ecdc4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border lg:col-span-2">
          <h3 className="text-foreground font-semibold mb-4">User Growth</h3>
          {loading ? <Skeleton className="h-[280px] w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,25%)" />
                <XAxis dataKey="month" stroke="hsl(220,15%,60%)" fontSize={12} />
                <YAxis stroke="hsl(220,15%,60%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="users" stroke="#4ecdc4" strokeWidth={2} dot={{ fill: "#4ecdc4", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
