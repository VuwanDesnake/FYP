import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { capitalizeCategory } from "@/lib/formatDetails";

const periods = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "3m", label: "Last 3 months", days: 90 },
];

const tooltipStyle = { backgroundColor: "hsl(224,25%,19%)", border: "1px solid hsl(224,20%,25%)", borderRadius: "8px", color: "#fff" };

const Analysis = () => {
  const { user } = useAuth();
  const [activePeriod, setActivePeriod] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<{ label: string; co2: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; co2: number }[]>([]);
  const [topCategory, setTopCategory] = useState("");

  useEffect(() => {
    if (user) fetchData();
  }, [user, activePeriod]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const period = periods.find(p => p.key === activePeriod)!;
    const since = new Date();
    since.setDate(since.getDate() - period.days);

    const { data: logs } = await supabase
      .from("activity_logs")
      .select("co2_kg, logged_at, category")
      .eq("user_id", user.id)
      .gte("logged_at", since.toISOString())
      .order("logged_at", { ascending: true });

    const allLogs = logs || [];

    // Trend data — group by day
    const dayMap: Record<string, number> = {};
    allLogs.forEach(l => {
      const key = l.logged_at.slice(0, 10);
      dayMap[key] = (dayMap[key] || 0) + Number(l.co2_kg);
    });

    if (activePeriod === "7d") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const trend: { label: string; co2: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        trend.push({ label: dayNames[d.getDay()], co2: Math.round((dayMap[ds] || 0) * 10) / 10 });
      }
      setTrendData(trend);
    } else if (activePeriod === "30d") {
      // Group by week
      const weeks: { label: string; co2: number }[] = [];
      for (let i = 3; i >= 0; i--) {
        const end = new Date();
        end.setDate(end.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 7);
        const total = allLogs.filter(l => { const d = new Date(l.logged_at); return d >= start && d < end; })
          .reduce((s, l) => s + Number(l.co2_kg), 0);
        weeks.push({ label: `W${4 - i}`, co2: Math.round(total * 10) / 10 });
      }
      setTrendData(weeks);
    } else {
      // Group by month
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const months: { label: string; co2: number }[] = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        const total = allLogs.filter(l => { const ld = new Date(l.logged_at); return ld.getMonth() === m && ld.getFullYear() === y; })
          .reduce((s, l) => s + Number(l.co2_kg), 0);
        months.push({ label: monthNames[m], co2: Math.round(total * 10) / 10 });
      }
      setTrendData(months);
    }

    // Category data
    const catMap: Record<string, number> = {};
    allLogs.forEach(l => { const c = capitalizeCategory(l.category); catMap[c] = (catMap[c] || 0) + Number(l.co2_kg); });
    const catArr = Object.entries(catMap).map(([category, co2]) => ({ category, co2: Math.round(co2 * 10) / 10 }));
    setCategoryData(catArr);
    if (catArr.length) {
      const top = catArr.reduce((a, b) => b.co2 > a.co2 ? b : a);
      setTopCategory(top.category);
    } else {
      setTopCategory("");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-2">Analysis</h2>
        <p className="text-muted-foreground">Track your emission trends and category comparisons.</p>
        {topCategory && !loading && (
          <p className="text-primary text-sm mt-1">📊 Your highest emissions are from <strong>{topCategory}</strong> in this period.</p>
        )}
      </div>

      <div className="flex gap-3 mb-2">
        {periods.map(p => (
          <button key={p.key} onClick={() => setActivePeriod(p.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${activePeriod === p.key ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground hover:bg-muted border border-border"}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-foreground font-semibold mb-4">Emission Trend</h3>
          {loading ? <Skeleton className="h-[280px] w-full rounded-xl" /> : trendData.every(d => d.co2 === 0) ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No data for this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,25%)" />
                <XAxis dataKey="label" stroke="hsl(220,15%,60%)" fontSize={12} />
                <YAxis stroke="hsl(220,15%,60%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="co2" stroke="#4ecdc4" strokeWidth={2} dot={{ fill: "#4ecdc4", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-foreground font-semibold mb-4">Category Comparison (kg CO₂)</h3>
          {loading ? <Skeleton className="h-[280px] w-full rounded-xl" /> : categoryData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No activities logged yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,25%)" />
                <XAxis type="number" stroke="hsl(220,15%,60%)" fontSize={12} />
                <YAxis type="category" dataKey="category" stroke="hsl(220,15%,60%)" fontSize={12} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="co2" fill="#4ecdc4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;
