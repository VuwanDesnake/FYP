import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Calendar, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { formatDetails, capitalizeCategory } from "@/lib/formatDetails";

const HistoryPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [maxCo2, setMaxCo2] = useState("");
  const types = ["All", "Transport", "Diet", "Energy", "Shopping"];

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false });
    setLogs(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const matchType = filter === "All" || l.category === filter;
      const detailStr = formatDetails(l.details);
      const matchSearch = detailStr.toLowerCase().includes(search.toLowerCase());
      const dateStr = l.logged_at.slice(0, 10);
      const matchDateFrom = !dateFrom || dateStr >= dateFrom;
      const matchDateTo = !dateTo || dateStr <= dateTo;
      const matchCo2 = !maxCo2 || Number(l.co2_kg) <= Number(maxCo2);
      return matchType && matchSearch && matchDateFrom && matchDateTo && matchCo2;
    });
  }, [logs, search, filter, dateFrom, dateTo, maxCo2]);

  const summary = useMemo(() => {
    const co2Values = filtered.map(l => Number(l.co2_kg));
    if (!co2Values.length) return null;
    return {
      best: Math.min(...co2Values),
      worst: Math.max(...co2Values),
      avg: co2Values.reduce((a, b) => a + b, 0) / co2Values.length,
    };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-2">Activity History</h2>
        <p className="text-muted-foreground">View all your past carbon emission logs.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-4 text-center">
                <TrendingDown className="h-5 w-5 text-green-400 mx-auto mb-1" />
                <p className="text-foreground text-lg font-bold">{summary.best.toFixed(1)} kg</p>
                <p className="text-muted-foreground text-xs">Best Entry</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl border border-border p-4 text-center">
                <TrendingUp className="h-5 w-5 text-red-400 mx-auto mb-1" />
                <p className="text-foreground text-lg font-bold">{summary.worst.toFixed(1)} kg</p>
                <p className="text-muted-foreground text-xs">Worst Entry</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-4 text-center">
                <Activity className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-foreground text-lg font-bold">{summary.avg.toFixed(1)} kg</p>
                <p className="text-muted-foreground text-xs">Average</p>
              </motion.div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border text-foreground" />
            </div>
            <div className="flex gap-2 items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-card border-border text-foreground w-36 text-xs" />
              <span className="text-muted-foreground text-xs">to</span>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-card border-border text-foreground w-36 text-xs" />
            </div>
            <Input type="number" placeholder="Max CO₂" value={maxCo2} onChange={e => setMaxCo2(e.target.value)} className="bg-card border-border text-foreground w-28 text-xs" />
          </div>

          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === t ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground border border-border hover:bg-muted"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Details</th>
                  <th className="text-right px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">CO₂ (kg)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-muted-foreground text-sm">No activities logged yet — start tracking your carbon footprint!</td></tr>
                ) : (
                  filtered.map(log => (
                    <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-foreground text-sm">{new Date(log.logged_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium">{capitalizeCategory(log.category)}</span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-sm">{formatDetails(log.details) || "—"}</td>
                      <td className="px-5 py-3 text-right text-foreground font-medium text-sm">{Number(log.co2_kg).toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryPage;
