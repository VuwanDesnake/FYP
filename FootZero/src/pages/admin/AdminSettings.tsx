import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Key, Copy, RefreshCw, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_PASSKEY = "Vuwan1";

interface EmissionSource {
  id: string;
  category: string;
  name: string;
  unit: string;
  co2_per_unit: number;
  icon: string | null;
  is_active: boolean;
}

const CATEGORIES = ["transport", "diet", "energy", "shopping"];
const emptyForm: Omit<EmissionSource, "id"> = {
  category: "transport",
  name: "",
  unit: "km",
  co2_per_unit: 0,
  icon: "🌱",
  is_active: true,
};

const AdminSettings = () => {
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [passkey, setPasskey] = useState(DEFAULT_PASSKEY);
  const [showPasskey, setShowPasskey] = useState(false);
  const [sources, setSources] = useState<EmissionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmissionSource | null>(null);
  const [form, setForm] = useState<Omit<EmissionSource, "id">>(emptyForm);

  const loadSources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("emission_sources" as any)
      .select("*")
      .order("category")
      .order("name");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setSources((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadSources(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };
  const openEdit = (s: EmissionSource) => {
    setEditing(s);
    setForm({ category: s.category, name: s.name, unit: s.unit, co2_per_unit: s.co2_per_unit, icon: s.icon, is_active: s.is_active });
    setDialogOpen(true);
  };

  const saveSource = async () => {
    if (!form.name || !form.unit) {
      toast({ title: "Missing fields", description: "Name and unit are required.", variant: "destructive" });
      return;
    }
    if (editing) {
      const { error } = await supabase.from("emission_sources" as any).update(form).eq("id", editing.id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Updated", description: "Emission source updated." });
    } else {
      const { error } = await supabase.from("emission_sources" as any).insert(form);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      toast({ title: "Added", description: "Emission source created." });
    }
    setDialogOpen(false);
    loadSources();
  };

  const deleteSource = async (id: string) => {
    if (!confirm("Delete this emission source?")) return;
    const { error } = await supabase.from("emission_sources" as any).delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Deleted" });
    loadSources();
  };

  const toggleActive = async (s: EmissionSource) => {
    const { error } = await supabase.from("emission_sources" as any).update({ is_active: !s.is_active }).eq("id", s.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    loadSources();
  };

  const grouped = CATEGORIES.map((cat) => ({ cat, items: sources.filter((s) => s.category === cat) }));

  const handleCopyPasskey = () => {
    navigator.clipboard.writeText(passkey);
    toast({ title: "Copied", description: "Admin passkey copied to clipboard." });
  };

  const handleResetPasskey = () => {
    setPasskey(DEFAULT_PASSKEY);
    toast({ title: "Passkey reset", description: "Admin passkey has been reset to the default." });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-2">Platform Settings</h2>
        <p className="text-muted-foreground">Manage emission factors, admin passkey, and platform configuration.</p>
      </div>

      {/* Admin Passkey Section */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-lg">Admin Secret Key</h3>
            <p className="text-muted-foreground text-xs">Required when creating new admin accounts</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Current Passkey</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPasskey ? "text" : "password"}
                  value={passkey}
                  onChange={e => setPasskey(e.target.value)}
                  className="bg-background border-border text-foreground pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyPasskey} className="border-border shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleResetPasskey} className="border-border shrink-0" title="Reset to default">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">This key is required in the "Add Admin" dialog on the Users page. Share it securely.</p>
          </div>
          <Button variant="hero" onClick={() => toast({ title: "Saved", description: "Passkey updated successfully." })}>
            Save Passkey
          </Button>
        </div>
      </div>

      {/* Emission Factors */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-foreground font-semibold text-lg">Emission Sources</h3>
            <p className="text-muted-foreground text-xs">Manage carbon factors used by the calculator.</p>
          </div>
          <Button variant="hero" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Source</Button>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ cat, items }) => (
              <div key={cat}>
                <h4 className="text-foreground text-sm font-semibold capitalize mb-2">{cat}</h4>
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-xs">No sources.</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 bg-background border border-border rounded-xl p-3">
                        <div className="text-2xl w-8 text-center">{s.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{s.name}</p>
                          <p className="text-muted-foreground text-xs">{s.co2_per_unit} kg CO₂/{s.unit}</p>
                        </div>
                        <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} />
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteSource(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Emission Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Car" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="km / meal / kWh" />
              </div>
              <div className="space-y-1">
                <Label>CO₂ per unit (kg)</Label>
                <Input type="number" step="0.001" value={form.co2_per_unit}
                  onChange={(e) => setForm({ ...form, co2_per_unit: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Icon (emoji)</Label>
              <Input value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🚗" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={saveSource}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Platform Configuration */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-foreground font-semibold text-lg mb-5">Platform Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm font-medium">Open Registration</p>
              <p className="text-muted-foreground text-xs">Allow new users to sign up</p>
            </div>
            <Switch checked={registrationOpen} onCheckedChange={setRegistrationOpen} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm font-medium">Maintenance Mode</p>
              <p className="text-muted-foreground text-xs">Show maintenance page to users</p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
